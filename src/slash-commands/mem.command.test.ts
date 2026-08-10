import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import { connectApiService } from "../services/connect-api.service";
import { createMockInteraction } from "../test/mocks/discord.mock";
import memSlashCommand from "./mem.command";

const { mockGetAchievementUnlocks, mockBuildAuthorization } = vi.hoisted(() => ({
  mockGetAchievementUnlocks: vi.fn(),
  mockBuildAuthorization: vi.fn(() => ({ username: "RABot", webApiKey: "test" })),
}));

vi.mock("@retroachievements/api", () => ({
  getAchievementUnlocks: mockGetAchievementUnlocks,
  buildAuthorization: mockBuildAuthorization,
}));

describe("SlashCommand: mem", () => {
  let mockInteraction: ReturnType<typeof createMockInteraction>;

  function setInput(value: string) {
    (mockInteraction.options.getString as Mock).mockReturnValue(value);
  }

  function editReplyCalls() {
    return (mockInteraction.editReply as Mock).mock.calls;
  }

  beforeEach(() => {
    mockInteraction = createMockInteraction();
    mockGetAchievementUnlocks.mockReset();
    mockBuildAuthorization.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("is defined", () => {
    // ASSERT
    expect(memSlashCommand).toBeDefined();
    expect(memSlashCommand.data.name).toEqual("mem");
  });

  describe("execute", () => {
    it("defers the reply before doing any work", async () => {
      // ARRANGE
      setInput("0xH1234=5");

      // ACT
      await memSlashCommand.execute(mockInteraction, {} as any);

      // ASSERT
      expect(mockInteraction.deferReply).toHaveBeenCalled();
    });

    it("parses a valid MemAddr string", async () => {
      // ARRANGE
      setInput("0xH1234=5");

      // ACT
      await memSlashCommand.execute(mockInteraction, {} as any);

      // ASSERT
      const reply = editReplyCalls()[0]![0] as string;
      expect(reply).toContain("__**Core Group**__:");
      expect(reply).toContain("Mem");
      expect(reply).toContain("8-bit");
      expect(reply).toContain("0x001234");
    });

    it("shows an error message for an invalid MemAddr string", async () => {
      // ARRANGE
      setInput("@#$%");

      // ACT
      await memSlashCommand.execute(mockInteraction, {} as any);

      // ASSERT
      expect(mockInteraction.editReply).toHaveBeenCalledWith(
        expect.stringContaining("**Whoops!**"),
      );
      expect(mockInteraction.editReply).toHaveBeenCalledWith(
        expect.stringContaining("Check your MemAddr string and try again"),
      );
    });

    it("processes an achievement ID successfully", async () => {
      // ARRANGE
      setInput("123456");
      mockGetAchievementUnlocks.mockResolvedValueOnce({ game: { id: 789 } });
      vi.spyOn(connectApiService, "getMemAddr").mockResolvedValueOnce("0xH1234=5");

      // ACT
      await memSlashCommand.execute(mockInteraction, {} as any);

      // ASSERT
      expect(mockInteraction.editReply).toHaveBeenCalledWith(
        ":hourglass: Getting MemAddr for achievement ID **123456**, please wait...",
      );
      expect(mockInteraction.editReply).toHaveBeenCalledWith(
        expect.stringContaining("__**Core Group**__:"),
      );
    });

    it("processes an achievement URL successfully", async () => {
      // ARRANGE
      setInput("https://retroachievements.org/achievement/123456");
      mockGetAchievementUnlocks.mockResolvedValueOnce({ game: { id: 789 } });
      vi.spyOn(connectApiService, "getMemAddr").mockResolvedValueOnce("0xH1234=5");

      // ACT
      await memSlashCommand.execute(mockInteraction, {} as any);

      // ASSERT
      expect(mockInteraction.editReply).toHaveBeenCalledWith(
        ":hourglass: Getting MemAddr for achievement ID **123456**, please wait...",
      );
      expect(mockInteraction.editReply).toHaveBeenCalledWith(
        expect.stringContaining("__**Core Group**__:"),
      );
    });

    it("shows an error message when the game ID is not found", async () => {
      // ARRANGE
      setInput("123456");
      mockGetAchievementUnlocks.mockResolvedValueOnce({});

      // ACT
      await memSlashCommand.execute(mockInteraction, {} as any);

      // ASSERT
      expect(mockInteraction.editReply).toHaveBeenCalledWith(
        "**Whoops!**\nI didn't find the game ID for achievement ID **123456**.",
      );
    });

    it("shows an error message when the MemAddr is not found", async () => {
      // ARRANGE
      setInput("123456");
      mockGetAchievementUnlocks.mockResolvedValueOnce({ game: { id: 789 } });
      vi.spyOn(connectApiService, "getMemAddr").mockResolvedValueOnce(null);

      // ACT
      await memSlashCommand.execute(mockInteraction, {} as any);

      // ASSERT
      expect(mockInteraction.editReply).toHaveBeenCalledWith(
        "**Whoops!**\nI didn't find the MemAddr for achievement ID **123456**.",
      );
    });

    it("handles API errors gracefully", async () => {
      // ARRANGE
      setInput("123456");
      mockGetAchievementUnlocks.mockRejectedValueOnce(new Error("API Error"));

      // ACT
      await memSlashCommand.execute(mockInteraction, {} as any);

      // ASSERT
      expect(mockInteraction.editReply).toHaveBeenCalledWith(
        "**Whoops!**\nFailed to fetch achievement data.",
      );
    });
  });
});
