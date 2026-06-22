import { SlashCommandBuilder } from "discord.js";

import type { SlashCommand } from "../models";
import { TemplateService } from "../services/template.service";
import { runGanCommand } from "./shared/run-gan-command";

const ganSlashCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("gan")
    .setDescription("Generate an achievement-news post template for a game")
    .addStringOption((option) =>
      option
        .setName("game-id")
        .setDescription("Game ID number (e.g. 14402) or RetroAchievements game URL")
        .setRequired(true),
    ),

  legacyName: "gan", // For migration mapping - using the most common alias.

  async execute(interaction, _client) {
    await runGanCommand(interaction, {
      commandName: "gan",
      render: (ganData) => ({
        content: `Here's your achievement-news post template:\n${TemplateService.generateGanTemplate(
          ganData.gameInfo,
          ganData.achievementSetDate,
          ganData.youtubeLink,
          ganData.gameId,
        )}`,
      }),
    });
  },
};

export default ganSlashCommand;
