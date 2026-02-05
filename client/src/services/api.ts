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

export interface Post {
  id: string;
  authorId: string;
  content: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
  author?: User;
  likes?: Like[];
  comments?: Comment[];
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author?: User;
}

export interface Like {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
  user?: User;
}

export interface Follower {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
  follower?: User;
  following?: User;
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
          clearTokens();
          window.location.href = "/login";
        }
      } catch (error) {
        console.error("Token refresh failed:", error);
        clearTokens();
        window.location.href = "/login";
      }
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || errorData.message || `API Error: ${response.status}`,
    );
  }

  return response.json();
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

  getCurrentProfile: async (): Promise<User> => {
    return apiRequest("/users/me");
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    return apiRequest("/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  getTimeline: async (
    userId: string,
    limit = 20,
    offset = 0,
  ): Promise<Post[]> => {
    return apiRequest(
      `/users/${userId}/timeline?limit=${limit}&offset=${offset}`,
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

  unlikePost: async (likeId: string): Promise<void> => {
    return apiRequest(`/posts/likes/${likeId}`, { method: "DELETE" });
  },

  getPostLikes: async (postId: string): Promise<Like[]> => {
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

  getPostComments: async (postId: string): Promise<Comment[]> => {
    return apiRequest(`/posts/${postId}/comments`);
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
  followUser: async (followingId: string): Promise<Follower> => {
    return apiRequest(`/users/${followingId}/follow`, {
      method: "POST",
      body: JSON.stringify({ followingId }),
    });
  },

  unfollowUser: async (followingId: string): Promise<void> => {
    return apiRequest(`/users/${followingId}/follow`, {
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
// Export for convenience
// ============================================================================

export { getAccessToken, getRefreshToken, setTokens, clearTokens };
