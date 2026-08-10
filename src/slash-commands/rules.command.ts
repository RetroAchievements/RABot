import { SlashCommandBuilder } from "discord.js";

import type { SlashCommand } from "../models";

const one = "**1.** Don't be a jerk or generally obnoxious - nobody likes trolls.";
const two =
  "**2.** Don't use our website or Discord server to share copyrighted material or information about where they can be downloaded.";
const three =
  "**3.** Keep the Discord channels and forum threads on-topic (we do have a section for off-topic chatting, though).";
const four = "**4.** When a moderator/admin asks you to stop, you should stop.";
const five = "**5.** When in doubt, ask a @mod";

const coc = "**Complete Version**: <https://docs.retroachievements.org/Users-Code-of-Conduct/>";

const rules: Record<string, string> = {
  1: one,
  2: two,
  3: three,
  4: four,
  5: five,
  coc,

  all: `__**RULES**__\n**Simple Version**:\n${one}\n${two}\n${three}\n${four}\n${five}\n\n${coc}`,
};

const rulesSlashCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("rules")
    .setDescription("Show the rules (or a specific one)")
    .addStringOption((option) =>
      option
        .setName("rule")
        .setDescription("Which rule to show. Defaults to all of them.")
        .setRequired(false)
        .addChoices(
          { name: "All rules", value: "all" },
          { name: "Rule 1 - Don't be a jerk", value: "1" },
          { name: "Rule 2 - No copyrighted material", value: "2" },
          { name: "Rule 3 - Stay on-topic", value: "3" },
          { name: "Rule 4 - Listen to moderators", value: "4" },
          { name: "Rule 5 - When in doubt, ask a mod", value: "5" },
          { name: "Code of Conduct", value: "coc" },
        ),
    ),

  async execute(interaction, _client) {
    const rule = interaction.options.getString("rule") ?? "all";

    await interaction.reply({
      content: rules[rule] ?? rules.all!,
      allowedMentions: { parse: [] },
    });
  },
};

export default rulesSlashCommand;
