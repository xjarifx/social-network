// API configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

// Storage keys
const TOKEN_KEY = "social_access_token";
const REFRESH_TOKEN_KEY = "social_refresh_token";

// ============================================================================
// TYPES
// ============================================================================

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  plan: "FREE" | "PRO";
}

export interface UserSummary {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
}

export interface Post {
  id: string;
  authorId?: string;
  content: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
  author?: User;
  likes?: string[];
  comments?: Comment[];
}

export interface Comment {
  id: string;
  postId?: string;
  content: string;
  createdAt: string;
  author?: UserSummary;
}

export interface Like {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
  user?: UserSummary;
  message?: string;
}

export interface Follower {
  id: string;
  followedAt: string;
  follower?: UserSummary;
  user?: UserSummary;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  limit: number;
  offset: number;
}

export interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedUser?: UserSummary | null;
  relatedPost?: { id: string; content: string } | null;
}

export interface BlocksResponse {
  blocked: BlockedUser[];
  total: number;
  limit: number;
  offset: number;
}

export interface BlockedUser {
  id: string;
  blockedAt: string;
  user: UserSummary;
}

export interface BillingStatus {
  id: string;
  email: string;
  plan: "FREE" | "PRO";
  planStatus: string | null;
  planStartedAt: string | null;
  stripeCurrentPeriodEndAt: string | null;
  stripeSubscriptionId: string | null;
}

export interface CommentsResponse {
  comments: Comment[];
  total: number;
  limit: number;
  offset: number;
}

export interface UserPostsResponse {
  posts: Post[];
  total: number;
  limit: number;
  offset: number;
}

export interface SearchUsersResponse {
  results: User[];
  total: number;
  limit: number;
  offset: number;
}

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// ============================================================================
// HTTP HELPER
// ============================================================================

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  const token = getAccessToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle token refresh on 401
  if (response.status === 401 && token) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const data: AuthResponse = await refreshResponse.json();
          setTokens(data.accessToken, data.refreshToken);

          // Retry original request with new token
          headers["Authorization"] = `Bearer ${data.accessToken}`;
          return apiRequest<T>(endpoint, { ...options, headers });
        } else {
          // Only redirect if not already on login page
          clearTokens();
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
          throw new Error("Session expired");
        }
      } catch (error) {
        console.error("Token refresh failed:", error);
        clearTokens();
        // Only redirect if not already on login page
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        throw error;
      }
    } else {
      // No refresh token available
      clearTokens();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      throw new Error("No refresh token available");
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || errorData.message || `API Error: ${response.status}`,
    );
  }

  if (response.status === 204 || response.status === 205) {
    return undefined as T;
  }

  const contentLength = response.headers.get("content-length");
  if (contentLength === "0") {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return text as T;
}

// ============================================================================
// AUTH API
// ============================================================================

export const authAPI = {
  register: async (data: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<AuthResponse> => {
    return apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  login: async (data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    return apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  logout: async (): Promise<void> => {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await apiRequest("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refreshToken }),
        });
      }
    } finally {
      clearTokens();
    }
  },

  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    return apiRequest("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  },
};

// ============================================================================
// USERS API
// ============================================================================

export const usersAPI = {
  getProfile: async (userId: string): Promise<User> => {
    return apiRequest(`/users/${userId}`);
  },

  getUserPosts: async (
    userId: string,
    limit = 10,
    offset = 0,
  ): Promise<UserPostsResponse> => {
    return apiRequest(`/users/${userId}/posts?limit=${limit}&offset=${offset}`);
  },

  getCurrentProfile: async (): Promise<User> => {
    return apiRequest("/users/me");
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    return apiRequest("/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  search: async (
    query: string,
    limit = 10,
    offset = 0,
  ): Promise<SearchUsersResponse> => {
    return apiRequest(
      `/users/search?q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`,
    );
  },
};

// ============================================================================
// POSTS API
// ============================================================================

export const postsAPI = {
  create: async (content: string): Promise<Post> => {
    return apiRequest("/posts", {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  },

  getPost: async (postId: string): Promise<Post> => {
    return apiRequest(`/posts/${postId}`);
  },

  updatePost: async (postId: string, content: string): Promise<Post> => {
    return apiRequest(`/posts/${postId}`, {
      method: "PATCH",
      body: JSON.stringify({ content }),
    });
  },

  deletePost: async (postId: string): Promise<void> => {
    return apiRequest(`/posts/${postId}`, { method: "DELETE" });
  },

  getFeed: async (limit = 20, offset = 0): Promise<Post[]> => {
    return apiRequest(`/posts?limit=${limit}&offset=${offset}`);
  },

  getNewsFeed: async (limit = 20, offset = 0): Promise<Post[]> => {
    return apiRequest(`/posts/feed?limit=${limit}&offset=${offset}`);
  },
};

// ============================================================================
// LIKES API
// ============================================================================

export const likesAPI = {
  likePost: async (postId: string): Promise<Like> => {
    return apiRequest(`/posts/${postId}/likes`, {
      method: "POST",
    });
  },

  unlikePost: async (postId: string): Promise<void> => {
    return apiRequest(`/posts/${postId}/likes`, { method: "DELETE" });
  },

  getPostLikes: async (
    postId: string,
  ): Promise<{
    likes: Like[];
    total: number;
    limit: number;
    offset: number;
  }> => {
    return apiRequest(`/posts/${postId}/likes`);
  },
};

// ============================================================================
// COMMENTS API
// ============================================================================

export const commentsAPI = {
  createComment: async (postId: string, content: string): Promise<Comment> => {
    return apiRequest(`/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  },

  getPostComments: async (
    postId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<CommentsResponse> => {
    const params = new URLSearchParams();
    if (options?.limit !== undefined) {
      params.set("limit", String(options.limit));
    }
    if (options?.offset !== undefined) {
      params.set("offset", String(options.offset));
    }
    const query = params.toString();
    return apiRequest(`/posts/${postId}/comments${query ? `?${query}` : ""}`);
  },

  updateComment: async (
    postId: string,
    commentId: string,
    content: string,
  ): Promise<Comment> => {
    return apiRequest(`/posts/${postId}/comments/${commentId}`, {
      method: "PATCH",
      body: JSON.stringify({ content }),
    });
  },

  deleteComment: async (postId: string, commentId: string): Promise<void> => {
    return apiRequest(`/posts/${postId}/comments/${commentId}`, {
      method: "DELETE",
    });
  },
};

// ============================================================================
// FOLLOWS API
// ============================================================================

export const followsAPI = {
  followUser: async (
    userId: string,
    followingId: string,
  ): Promise<Follower> => {
    return apiRequest(`/users/${userId}/follow`, {
      method: "POST",
      body: JSON.stringify({ followingId }),
    });
  },

  unfollowUser: async (userId: string, followingId: string): Promise<void> => {
    return apiRequest(`/users/${userId}/follow/${followingId}`, {
      method: "DELETE",
    });
  },

  getUserFollowers: async (userId: string): Promise<Follower[]> => {
    return apiRequest(`/users/${userId}/followers`);
  },

  getUserFollowing: async (userId: string): Promise<Follower[]> => {
    return apiRequest(`/users/${userId}/following`);
  },
};

// ============================================================================
// NOTIFICATIONS API
// ============================================================================

export const notificationsAPI = {
  list: async (limit = 20, offset = 0): Promise<NotificationsResponse> => {
    return apiRequest(`/notifications?limit=${limit}&offset=${offset}`);
  },

  getById: async (notificationId: string): Promise<Notification> => {
    return apiRequest(`/notifications/${notificationId}`);
  },

  markRead: async (
    notificationId: string,
    read = true,
  ): Promise<Notification> => {
    return apiRequest(`/notifications/${notificationId}`, {
      method: "PATCH",
      body: JSON.stringify({ read }),
    });
  },

  remove: async (notificationId: string): Promise<void> => {
    return apiRequest(`/notifications/${notificationId}`, {
      method: "DELETE",
    });
  },
};

// ============================================================================
// BLOCKS API
// ============================================================================

export const blocksAPI = {
  list: async (limit = 20, offset = 0): Promise<BlocksResponse> => {
    return apiRequest(`/blocks?limit=${limit}&offset=${offset}`);
  },

  blockUser: async (blockedId: string): Promise<BlockedUser> => {
    return apiRequest(`/blocks`, {
      method: "POST",
      body: JSON.stringify({ blockedId }),
    });
  },

  unblockUser: async (userId: string): Promise<void> => {
    return apiRequest(`/blocks/${userId}`, { method: "DELETE" });
  },
};

// ============================================================================
// BILLING API
// ============================================================================

export const billingAPI = {
  getStatus: async (): Promise<BillingStatus> => {
    return apiRequest("/billing/me");
  },

  createCheckoutSession: async (): Promise<{ url: string }> => {
    return apiRequest("/billing/checkout-session", { method: "POST" });
  },
};

// ============================================================================
// Export for convenience
// ============================================================================

export { getAccessToken, getRefreshToken, setTokens, clearTokens };
