import type { ChatInputCommandInteraction } from "discord.js";
import { describe, expect, it } from "vitest";

import { AdminChecker } from "./admin-checker";

describe("Util: AdminChecker", () => {
  describe("isAdminFromInteraction", () => {
    it("is defined", () => {
      // ASSERT
      expect(AdminChecker.isAdminFromInteraction).toBeDefined();
    });

    it("given a user with Discord Administrator permissions, returns true", () => {
      // ARRANGE
      const mockInteraction = {
        user: { id: "user123" },
        guild: { id: "guild123" },
        member: {
          permissions: {
            has: (permission: string) => permission === "Administrator",
          },
        },
      } as unknown as ChatInputCommandInteraction;

      // ACT
      const isAdmin = AdminChecker.isAdminFromInteraction(mockInteraction);

      // ASSERT
      expect(isAdmin).toBe(true);
    });

    it("given a regular user without admin permissions, returns false", () => {
      // ARRANGE
      const mockInteraction = {
        user: { id: "user123" },
        guild: { id: "guild123" },
        member: {
          permissions: {
            has: () => false,
          },
        },
      } as unknown as ChatInputCommandInteraction;

      // ACT
      const isAdmin = AdminChecker.isAdminFromInteraction(mockInteraction);

      // ASSERT
      expect(isAdmin).toBe(false);
    });

    it("given a user not in guild, returns false", () => {
      // ARRANGE
      const mockInteraction = {
        user: { id: "user123" },
        guild: null,
        member: null,
      } as unknown as ChatInputCommandInteraction;

      // ACT
      const isAdmin = AdminChecker.isAdminFromInteraction(mockInteraction);

      // ASSERT
      expect(isAdmin).toBe(false);
    });

    it("given a string member (partial data), returns false", () => {
      // ARRANGE
      const mockInteraction = {
        user: { id: "user123" },
        guild: { id: "guild123" },
        member: "partial_member_string",
      } as unknown as ChatInputCommandInteraction;

      // ACT
      const isAdmin = AdminChecker.isAdminFromInteraction(mockInteraction);

      // ASSERT
      expect(isAdmin).toBe(false);
    });

    it("given member with string permissions, returns false", () => {
      // ARRANGE
      const mockInteraction = {
        user: { id: "user123" },
        guild: { id: "guild123" },
        member: {
          permissions: "8", // String representation of permissions
        },
      } as unknown as ChatInputCommandInteraction;

      // ACT
      const isAdmin = AdminChecker.isAdminFromInteraction(mockInteraction);

      // ASSERT
      expect(isAdmin).toBe(false);
    });
  });
});
