import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import type { Express } from "express";

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.3",
        info: {
            title: "Social Network API",
            version: "1.0.0",
            description:
                "RESTful API for the Social Network platform — authentication, users, posts, comments, likes, follows, notifications, blocks, and billing.",
            contact: {
                name: "API Support",
            },
        },
        servers: [
            {
                url: "/api/v1",
                description: "API v1",
            },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Enter your JWT access token",
                },
            },
            schemas: {
                // ── Shared ──────────────────────────────────────────
                Error: {
                    type: "object",
                    properties: {
                        error: { type: "string", example: "Something went wrong" },
                    },
                },
                SuccessResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: true },
                        data: { type: "object" },
                        error: { type: "string", nullable: true, example: null },
                    },
                },
                ErrorResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: false },
                        data: { type: "object", example: {} },
                        error: { type: "string", example: "Error description" },
                    },
                },

                // ── Auth ────────────────────────────────────────────
                RegisterBody: {
                    type: "object",
                    required: ["username", "email", "password", "firstName", "lastName"],
                    properties: {
                        username: {
                            type: "string",
                            minLength: 2,
                            maxLength: 30,
                            example: "johndoe",
                        },
                        email: {
                            type: "string",
                            format: "email",
                            example: "john@example.com",
                        },
                        password: {
                            type: "string",
                            minLength: 8,
                            example: "P@ssw0rd!",
                            description:
                                "Must contain at least one uppercase, one lowercase, one number, and one special character (#@$!%*?&)",
                        },
                        firstName: {
                            type: "string",
                            minLength: 1,
                            maxLength: 50,
                            example: "John",
                        },
                        lastName: {
                            type: "string",
                            minLength: 1,
                            maxLength: 50,
                            example: "Doe",
                        },
                    },
                },
                LoginBody: {
                    type: "object",
                    required: ["email", "password"],
                    properties: {
                        email: {
                            type: "string",
                            format: "email",
                            example: "john@example.com",
                        },
                        password: { type: "string", example: "P@ssw0rd!" },
                    },
                },
                TokenPair: {
                    type: "object",
                    properties: {
                        accessToken: { type: "string" },
                        refreshToken: { type: "string" },
                    },
                },
                RefreshTokenBody: {
                    type: "object",
                    required: ["refreshToken"],
                    properties: {
                        refreshToken: { type: "string" },
                    },
                },

                // ── User ────────────────────────────────────────────
                UserProfile: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                        username: { type: "string" },
                        email: { type: "string", format: "email" },
                        firstName: { type: "string" },
                        lastName: { type: "string" },
                        bio: { type: "string", nullable: true },
                        avatarUrl: { type: "string", nullable: true },
                        coverUrl: { type: "string", nullable: true },
                        createdAt: { type: "string", format: "date-time" },
                        followersCount: { type: "integer" },
                        followingCount: { type: "integer" },
                    },
                },
                UpdateProfileBody: {
                    type: "object",
                    properties: {
                        firstName: { type: "string" },
                        lastName: { type: "string" },
                        bio: { type: "string" },
                        avatarUrl: { type: "string" },
                        coverUrl: { type: "string" },
                    },
                },

                // ── Post ────────────────────────────────────────────
                Post: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                        content: { type: "string" },
                        imageUrl: { type: "string", nullable: true },
                        authorId: { type: "string", format: "uuid" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                        likesCount: { type: "integer" },
                        commentsCount: { type: "integer" },
                        isLiked: { type: "boolean" },
                    },
                },
                UpdatePostBody: {
                    type: "object",
                    properties: {
                        content: { type: "string" },
                    },
                },

                // ── Comment ─────────────────────────────────────────
                Comment: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                        content: { type: "string" },
                        authorId: { type: "string", format: "uuid" },
                        postId: { type: "string", format: "uuid" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                        likesCount: { type: "integer" },
                    },
                },
                CreateCommentBody: {
                    type: "object",
                    required: ["content"],
                    properties: {
                        content: { type: "string", example: "Nice post!" },
                    },
                },

                // ── Notification ────────────────────────────────────
                Notification: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                        type: { type: "string" },
                        read: { type: "boolean" },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                UpdateNotificationBody: {
                    type: "object",
                    properties: {
                        read: { type: "boolean" },
                    },
                },

                // ── Block ───────────────────────────────────────────
                BlockBody: {
                    type: "object",
                    required: ["username"],
                    properties: {
                        username: { type: "string", example: "janedoe" },
                    },
                },

                // ── Pagination ──────────────────────────────────────
                PaginatedResponse: {
                    type: "object",
                    properties: {
                        data: { type: "array", items: {} },
                        meta: {
                            type: "object",
                            properties: {
                                page: { type: "integer" },
                                limit: { type: "integer" },
                                total: { type: "integer" },
                                hasMore: { type: "boolean" },
                            },
                        },
                    },
                },
            },
        },
        tags: [
            { name: "Auth", description: "Authentication & token management" },
            { name: "Users", description: "User profiles & search" },
            { name: "Posts", description: "Posts & feed" },
            { name: "Comments", description: "Post comments" },
            { name: "Likes", description: "Post & comment likes" },
            { name: "Follows", description: "Follow / unfollow users" },
            {
                name: "Notifications",
                description: "User notifications",
            },
            { name: "Blocks", description: "Block / unblock users" },
            { name: "Billing", description: "Stripe billing & subscriptions" },
        ],
    },
    apis: ["./src/modules/**/*.routes.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
    app.use(
        "/api-docs",
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec, {
            customCss: `
        .swagger-ui .topbar { display: none; }
        .swagger-ui .info .title { font-size: 2rem; }
      `,
            customSiteTitle: "Social Network API Docs",
        }),
    );
    app.get("/api-docs.json", (_req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });
    console.log("📚 Swagger docs available at /api-docs");
}
