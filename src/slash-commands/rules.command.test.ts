import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import { createMockInteraction } from "../test/mocks/discord.mock";
import rulesSlashCommand from "./rules.command";

describe("SlashCommand: rules", () => {
  let mockInteraction: ReturnType<typeof createMockInteraction>;

  function replyContent() {
    return (mockInteraction.reply as Mock).mock.calls[0]![0].content as string;
  }

  beforeEach(() => {
    mockInteraction = createMockInteraction();
    vi.clearAllMocks();
  });

  it("is defined", () => {
    // ASSERT
    expect(rulesSlashCommand).toBeDefined();
    expect(rulesSlashCommand.data.name).toEqual("rules");
  });

  it("shows every rule when no option is given", async () => {
    // ARRANGE
    (mockInteraction.options.getString as Mock).mockReturnValue(null);

    // ACT
    await rulesSlashCommand.execute(mockInteraction, {} as any);

    // ASSERT
    const content = replyContent();
    expect(content).toContain("__**RULES**__");
    expect(content).toContain("**1.**");
    expect(content).toContain("**5.**");
    expect(content).toContain("Users-Code-of-Conduct");
  });

  it("shows a single rule when one is selected", async () => {
    // ARRANGE
    (mockInteraction.options.getString as Mock).mockReturnValue("2");

    // ACT
    await rulesSlashCommand.execute(mockInteraction, {} as any);

    // ASSERT
    const content = replyContent();
    expect(content).toContain("**2.**");
    expect(content).not.toContain("**1.**");
  });

  it("shows the code of conduct link", async () => {
    // ARRANGE
    (mockInteraction.options.getString as Mock).mockReturnValue("coc");

    // ACT
    await rulesSlashCommand.execute(mockInteraction, {} as any);

    // ASSERT
    expect(replyContent()).toContain("Users-Code-of-Conduct");
  });

  it("suppresses mentions so rule 5 cannot ping anyone", async () => {
    // ARRANGE
    (mockInteraction.options.getString as Mock).mockReturnValue("all");

    // ACT
    await rulesSlashCommand.execute(mockInteraction, {} as any);

    // ASSERT
    expect(mockInteraction.reply).toHaveBeenCalledWith(
      expect.objectContaining({ allowedMentions: { parse: [] } }),
    );
  });
});
