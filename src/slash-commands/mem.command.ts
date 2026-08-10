import { buildAuthorization, getAchievementUnlocks } from "@retroachievements/api";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

import { COLORS, RA_WEB_API_KEY } from "../config/constants";
import type { SlashCommand } from "../models";
import { connectApiService } from "../services/connect-api.service";
import { logError } from "../utils/logger";
import { formatMemoryGroups, parseMemory } from "../utils/memory-parser";

const achievementUrlRegex = /^<?(https?:\/\/)?retroachievements\.org\/achievement\/([0-9]+)>?$/i;

const memSlashCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("mem")
    .setDescription("Parse a MemAddr string and show the respective logic.")
    .addStringOption((option) =>
      option
        .setName("input")
        .setDescription("An achievement ID, an achievement URL, or a raw MemAddr string")
        .setRequired(true),
    ),

  cooldown: 3,

  async execute(interaction, _client) {
    await interaction.deferReply();

    const input = interaction.options.getString("input", true).trim();

    const urlMatch = input.match(achievementUrlRegex);
    const achievementId = urlMatch ? Number(urlMatch[2]) : Number(input);

    if (!Number.isNaN(achievementId) && achievementId > 0) {
      await replyWithAchievementLogic(interaction, achievementId);

      return;
    }

    try {
      const parsed = parseMemory(input);
      await interaction.editReply(formatMemoryGroups(parsed.groups));
    } catch (error) {
      await interaction.editReply(
        `**Whoops!**\n${error instanceof Error ? error.message : "Invalid MemAddr string"}\nCheck your MemAddr string and try again.`,
      );
    }
  },
};

async function replyWithAchievementLogic(
  interaction: Parameters<SlashCommand["execute"]>[0],
  achievementId: number,
): Promise<void> {
  await interaction.editReply(
    `:hourglass: Getting MemAddr for achievement ID **${achievementId}**, please wait...`,
  );

  try {
    // The MemAddr lives behind the Connect API, which is keyed by game rather
    // than achievement, so the game ID has to be resolved first.
    const authorization = buildAuthorization({ username: "RABot", webApiKey: RA_WEB_API_KEY });
    const achievementData = await getAchievementUnlocks(authorization, { achievementId });

    const gameId = achievementData?.game?.id;

    if (!gameId) {
      await interaction.editReply(
        `**Whoops!**\nI didn't find the game ID for achievement ID **${achievementId}**.`,
      );

      return;
    }

    const memAddr = await connectApiService.getMemAddr(gameId, achievementId);
    if (!memAddr) {
      await interaction.editReply(
        `**Whoops!**\nI didn't find the MemAddr for achievement ID **${achievementId}**.`,
      );

      return;
    }

    const parsed = parseMemory(memAddr);
    const formatted = formatMemoryGroups(parsed.groups);

    const devChannels = process.env.DEV_CHANNELS?.split(",") ?? [];
    const isDevChannel = devChannels.includes(interaction.channelId);

    if (isDevChannel && parsed.addresses.length > 0) {
      const codeNotes = await connectApiService.getCodeNotes(gameId);
      const embed = createCodeNotesEmbed(gameId, parsed.addresses, codeNotes);

      if (embed) {
        await interaction.editReply({ content: formatted, embeds: [embed] });

        return;
      }
    }

    await interaction.editReply(formatted);
  } catch (error) {
    logError(error, { command: "mem", achievementId });
    await interaction.editReply("**Whoops!**\nFailed to fetch achievement data.");
  }
}

function createCodeNotesEmbed(
  gameId: number,
  addresses: string[],
  codeNotes: Array<{ Address: string; Note: string }>,
): EmbedBuilder | null {
  const embed = new EmbedBuilder()
    .setColor(COLORS.PRIMARY)
    .setTitle("Code Notes")
    .setURL(`https://retroachievements.org/codenotes.php?g=${gameId}`);

  let hasNote = false;
  let fieldCount = 0;
  const maxFields = 10; // Embeds cap out at 25 fields, and long notes hit the size limit well before that.

  for (const addr of addresses) {
    if (fieldCount >= maxFields) break;

    const note = codeNotes.find((n) => n.Address === addr);
    if (!note) continue;

    hasNote = true;

    let noteText = note.Note;
    let fieldName = `📍 ${addr}`;

    // Notes conventionally lead with a bracketed title, which reads better as
    // part of the field name than buried in the body.
    const titleMatch = noteText.match(/^\[.*?\].*$/m);
    if (titleMatch) {
      const title = titleMatch[0].trim();
      fieldName = `📍 ${addr} **${title}**`;
      noteText = noteText.replace(titleMatch[0], "").replace(/^\n+/, "").trim();
    }

    if (noteText.length > 400) {
      noteText = noteText.substring(0, 400) + "...";
    }

    embed.addFields({
      name: fieldName,
      value: noteText ? `\`\`\`${noteText}\`\`\`` : "*No additional details*",
      inline: false,
    });

    fieldCount++;
  }

  if (fieldCount >= maxFields && addresses.length > maxFields) {
    embed.setFooter({
      text: `Showing first ${maxFields} code notes. View all notes on the website.`,
    });
  }

  return hasNote ? embed : null;
}

export default memSlashCommand;
