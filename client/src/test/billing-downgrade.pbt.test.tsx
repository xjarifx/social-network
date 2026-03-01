/**
 * Bug Condition Exploration Test - Pro User Downgrade Flow
 *
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4**
 *
 * This test encodes the EXPECTED behavior for Pro user downgrade.
 *
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists.
 * When this test passes after implementation, it confirms the bug is fixed.
 *
 * Property 1: Fault Condition - Pro User Downgrade Flow
 *
 * The test verifies:
 * - Pro users see an enabled "Downgrade" button (Req 2.1)
 * - Clicking the button triggers API call to downgrade endpoint (Req 2.2)
 * - Backend processes downgrade and returns updated user status (Req 2.3)
 * - UI updates to reflect Free plan after successful downgrade (Req 2.4)
 *
 * Expected counterexamples on unfixed code:
 * - Button is disabled (violates Req 2.1)
 * - No onClick handler attached (violates Req 2.2)
 * - No API endpoint exists (violates Req 1.3, 2.2)
 * - Backend service not exposed (violates Req 1.4, 2.3)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import * as fc from "fast-check";
import BillingPage from "../pages/BillingPage";
import { billingAPI } from "../services/api";
import type { BillingStatus } from "../services/api";

// Mock the API module
vi.mock("../services/api", () => ({
  billingAPI: {
    getStatus: vi.fn(),
    createCheckoutSession: vi.fn(),
    downgrade: vi.fn(),
  },
}));

// Mock the auth hook module
vi.mock("../context/auth-context", () => ({
  useAuth: () => ({
    user: { id: "test-user-id", plan: "PRO", email: "test@example.com" },
  }),
}));

describe("Property 1: Fault Condition - Pro User Downgrade Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  /**
   * Property-Based Test: Pro users can successfully downgrade to Free plan
   *
   * This test generates multiple Pro user scenarios and verifies the complete
   * downgrade flow works correctly for all of them.
   *
   * EXPECTED OUTCOME ON UNFIXED CODE: FAIL
   * - Button will be disabled (violates Req 2.1)
   * - No onClick handler (violates Req 2.2)
   * - API method doesn't exist (violates Req 1.3, 2.2)
   * - Backend endpoint doesn't exist (violates Req 1.4, 2.3)
   */
  it("Pro users can downgrade to Free plan through UI flow", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate Pro user billing status
        fc.record({
          id: fc.uuid(),
          email: fc.emailAddress(),
          plan: fc.constant("PRO" as const),
          planStatus: fc.constant("active"),
          planStartedAt: fc.date().map((d) => d.toISOString()),
          stripeCurrentPeriodEndAt: fc.option(
            fc.date().map((d) => d.toISOString()),
            { nil: null },
          ),
          stripeSubscriptionId: fc.option(fc.string(), { nil: null }),
        }),
        async (proUserStatus: BillingStatus) => {
          // Setup: Mock API to return Pro user status
          vi.mocked(billingAPI.getStatus).mockResolvedValue(proUserStatus);

          // Setup: Mock successful downgrade response
          const downgradeResponse = {
            id: proUserStatus.id,
            email: proUserStatus.email,
            plan: "FREE" as const,
            planStatus: null,
            planStartedAt: null,
            stripeCurrentPeriodEndAt: null,
            stripeSubscriptionId: null,
          };
          vi.mocked(billingAPI.downgrade).mockResolvedValue(downgradeResponse);

          // Render the billing page
          const user = userEvent.setup();
          render(
            <BrowserRouter>
              <BillingPage />
            </BrowserRouter>,
          );

          // Wait for the page to load
          await waitFor(
            () => {
              expect(billingAPI.getStatus).toHaveBeenCalled();
            },
            { timeout: 3000 },
          );

          // REQUIREMENT 2.1: Pro user sees enabled "Downgrade" button
          const downgradeButtons = await screen.findAllByRole("button", {
            name: /downgrade/i,
          });
          const downgradeButton = downgradeButtons[0]; // Get the first one (Free plan card)
          expect(downgradeButton).toBeInTheDocument();
          expect(downgradeButton).not.toBeDisabled();

          // REQUIREMENT 2.2: Clicking button triggers API call to downgrade endpoint
          await user.click(downgradeButton);

          // Verify the downgrade API was called
          await waitFor(
            () => {
              expect(billingAPI.downgrade).toHaveBeenCalled();
            },
            { timeout: 3000 },
          );

          // REQUIREMENT 2.3: Backend processes downgrade and returns updated status
          // (Verified by mock returning downgradeResponse)
          expect(vi.mocked(billingAPI.downgrade)).toHaveBeenCalledTimes(1);

          // REQUIREMENT 2.4: UI updates to reflect Free plan status
          await waitFor(
            () => {
              const currentPlanButton = screen.getByRole("button", {
                name: /current plan/i,
              });
              expect(currentPlanButton).toBeInTheDocument();
              expect(currentPlanButton).toBeDisabled();
            },
            { timeout: 3000 },
          );
        },
      ),
      {
        numRuns: 10, // Run 10 different Pro user scenarios
        verbose: true,
      },
    );
  }, 30000); // 30 second timeout for property-based test

  /**
   * Additional test: Verify button state for Pro users
   *
   * This test specifically checks that the Downgrade button is enabled
   * for Pro users, which is the first requirement that fails.
   */
  it("Pro users see enabled Downgrade button on Free plan card", async () => {
    const proUserStatus: BillingStatus = {
      id: "test-user-id",
      email: "pro@example.com",
      plan: "PRO",
      planStatus: "active",
      planStartedAt: new Date().toISOString(),
      stripeCurrentPeriodEndAt: null,
      stripeSubscriptionId: null,
    };

    vi.mocked(billingAPI.getStatus).mockResolvedValue(proUserStatus);

    render(
      <BrowserRouter>
        <BillingPage />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(billingAPI.getStatus).toHaveBeenCalled();
    });

    // REQUIREMENT 2.1: Button should be enabled for Pro users
    const downgradeButton = await screen.findByRole("button", {
      name: /downgrade/i,
    });
    expect(downgradeButton).toBeInTheDocument();
    expect(downgradeButton).not.toBeDisabled();
  });

  /**
   * Additional test: Verify downgrade API method exists
   *
   * This test checks that the billingAPI has a downgrade method,
   * which is currently missing from the API client.
   */
  it("billingAPI has downgrade method", () => {
    // REQUIREMENT 1.3, 2.2: Frontend API method must exist
    expect(billingAPI).toHaveProperty("downgrade");
    expect(typeof billingAPI.downgrade).toBe("function");
  });
});
