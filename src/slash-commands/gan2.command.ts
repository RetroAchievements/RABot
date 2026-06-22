import { SlashCommandBuilder } from "discord.js";

import type { SlashCommand } from "../models";
import { TemplateService } from "../services/template.service";
import { runGanCommand } from "./shared/run-gan-command";

const gan2SlashCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("gan2")
    .setDescription("Generate a pretty achievement-news post with colored formatting")
    .addStringOption((option) =>
      option
        .setName("game-id")
        .setDescription("Game ID number (e.g. 14402) or RetroAchievements game URL")
        .setRequired(true),
    ),

  async execute(interaction, _client) {
    await runGanCommand(interaction, {
      commandName: "gan2",
      render: (ganData, ix) =>
        TemplateService.generateGan2Template(
          ganData.gameInfo,
          ganData.achievementSetDate,
          ganData.youtubeLink,
          ganData.gameId,
          ix.user,
        ),
    });
  },
};

export default gan2SlashCommand;
