import "dotenv/config";

// Set up test environment variables
process.env.JWT_SECRET = "test-jwt-secret-key-for-testing";
process.env.JWT_EXPIRES_IN = "1h";
process.env.REFRESH_TOKEN_SECRET = "test-refresh-token-secret-for-testing";
process.env.REFRESH_TOKEN_EXPIRES_IN = "7d";
process.env.DATABASE_URL =
  "postgresql://test:test@localhost:5432/social_network_test";
process.env.PORT = "3001";
process.env.FRONTEND_URL = "http://localhost:5173";
process.env.STRIPE_SECRET_KEY = "sk_test_fake_stripe_key";

// Suppress console logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};
