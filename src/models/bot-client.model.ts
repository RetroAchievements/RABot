import type { Client, Collection } from "discord.js";

import type { SlashCommand } from "./slash-command.model";

export interface BotClient extends Client {
  slashCommands: Collection<string, SlashCommand>;
  cooldowns: Collection<string, Collection<string, number>>;
}
