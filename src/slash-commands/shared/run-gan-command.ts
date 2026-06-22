import type { ChatInputCommandInteraction, InteractionEditReplyOptions } from "discord.js";

import { GameInfoService } from "../../services/game-info.service";
import type { GanData } from "../../utils/fetch-gan-data";
import { fetchGanData } from "../../utils/fetch-gan-data";
import { logError } from "../../utils/logger";

type GanReplyPayload = string | InteractionEditReplyOptions;

type GanRenderer = (ganData: GanData, interaction: ChatInputCommandInteraction) => GanReplyPayload;

interface RunGanCommandOptions {
  commandName: "gan" | "gan2";
  render: GanRenderer;
}

export const runGanCommand = async (
  interaction: ChatInputCommandInteraction,
  { commandName, render }: RunGanCommandOptions,
): Promise<void> => {
  await interaction.deferReply();

  const gameInput = interaction.options.getString("game-id", true);

  const gameId = GameInfoService.extractGameId(gameInput);
  // Preserve the original falsy check: extractGameId("0") returns 0, which should be treated as invalid.
  if (!gameId) {
    await interaction.editReply(
      "Invalid game ID or URL format. Please provide a game ID number or a RetroAchievements game URL.",
    );

    return;
  }

  try {
    const ganData = await fetchGanData(gameId);
    if (!ganData) {
      await interaction.editReply(
        `Unable to get info from the game ID \`${gameId}\`... :frowning:`,
      );

      return;
    }

    await interaction.editReply(render(ganData, interaction));
  } catch (error) {
    logError(`Error in ${commandName} slash command:`, { error });
    await interaction.editReply(`Unable to get info from the game ID \`${gameId}\`... :frowning:`);
  }
};
