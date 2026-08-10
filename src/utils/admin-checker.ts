import type { ChatInputCommandInteraction, PermissionsBitField } from "discord.js";

import { logger } from "./logger";

export class AdminChecker {
  /**
   * Check if a user has Discord Administrator permissions.
   */
  private static hasAdminPermissions(permissions: PermissionsBitField | null): boolean {
    if (!permissions) {
      return false;
    }

    return permissions.has("Administrator");
  }

  /**
   * Check if a user is an administrator via interaction context.
   */
  static isAdminFromInteraction(interaction: ChatInputCommandInteraction): boolean {
    // Only check admin permissions if in a guild.
    if (!interaction.guild || !interaction.member) {
      return false;
    }

    const userId = interaction.user.id;
    const member = interaction.member;

    // Check Discord admin permissions.
    if (member && typeof member !== "string" && "permissions" in member) {
      const memberPermissions = member.permissions;
      const permissions = typeof memberPermissions === "string" ? null : memberPermissions;

      if (this.hasAdminPermissions(permissions)) {
        logger.debug("Administrator bypassing cooldown", { userId });

        return true;
      }
    }

    return false;
  }
}
