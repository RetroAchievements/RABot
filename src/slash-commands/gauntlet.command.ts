import {MessageFlags, ModalBuilder, RadioGroupOptionBuilder, SlashCommandBuilder, TextInputStyle} from "discord.js";

import type {SlashCommand} from "../models";

const gauntletSlashCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName("gauntlet")
        .setDescription("Starts up an icon-gauntlet.")
        .addStringOption((option) => option
            .setName("url")
            .setDescription("URL of the game/hub you are updating")
            .setRequired(true)
        )
        .addStringOption((option) => option
            .setName("type")
            .setDescription("The type of gauntlet you want to run")
            .setRequired(true)
            .addChoices(
                { name: 'Icon for Hub/Game', value: 'icon' },
                { name: 'Collage for multiple Badges', value: 'collage' }
            )
        ),

    cooldown: 60, // 1 minute cooldown.

    async execute(interaction, _client) {
        // options
        const url = interaction.options.getString("url", true);
        const type: 'icon' | 'collage' = interaction.options.getString("type", true) as 'icon' | 'collage';

        const regex = /^https:\/\/retroachievements\.org\/(?:hub|game)\/\d+\/?$/;

        if (!regex.test(url)) {
            await interaction.reply({ content: "Please specify a valid URL for the game/hub you want to change!", flags: MessageFlags.Ephemeral })
            return;
        }

        const actualPollUrl = "gauntlet:" + url;

        // Build our modal
        const modal = new ModalBuilder()
            .setCustomId(actualPollUrl)
            .setTitle("Icon Gauntlet Submission")
            .addLabelComponents(
                (originalLabel) => originalLabel
                    .setLabel(type == 'icon' ? "Original Icon" : 'Current Icons')
                    .setDescription(type == 'icon' ? "Leave blank to use current icon" : 'Upload a preview of what the icons currently look like')
                    .setFileUploadComponent((file) => file
                        .setCustomId("icon:original")
                        .setMaxValues(1)
                        .setRequired(false)
                        .setRequired(type == 'collage')
                    ),

                (contendersLabel) => contendersLabel
                    .setLabel("Contenders")
                    .setDescription("Upload each contender as its own image below")
                    .setFileUploadComponent((file) => file
                        .setCustomId("icon:contenders")
                        .setMaxValues(10)
                        .setRequired(true)
                    ),

                (contactDevLabel) => contactDevLabel
                    .setLabel("Have you contacted the dev regarding this?")
                    .setDescription("This is required unless you have one of the exemptions. It will be added to your message for you.")
                    .setRadioGroupComponent((radioGroup) => radioGroup
                        .setCustomId("radiogroup-id")
                        .addOptions(
                            new RadioGroupOptionBuilder()
                                .setLabel("Yes, they have been notified")
                                .setDescription("Good job!")
                                .setValue("notified"),
                            new RadioGroupOptionBuilder()
                                .setLabel("No, they have opted-out")
                                .setDescription("Check the sheet to be sure!")
                                .setValue("optout"),
                            new RadioGroupOptionBuilder()
                                .setLabel("No, they are inactive")
                                .setDescription("No need to contact then")
                                .setValue("inactive"),
                            new RadioGroupOptionBuilder()
                                .setLabel("No, this is a hub")
                                .setDescription("Who would you contact anyway?")
                                .setValue("hub")
                        )
                    ),

                (additionalInfoLabel) => additionalInfoLabel
                    .setLabel("Additional Info")
                    .setDescription("Anything else you want to add? You can also leave a message below this poll for more control.")
                    .setTextInputComponent((textInput) => textInput
                        .setCustomId("user:thoughts")
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(false)
                        .setPlaceholder("Your thoughts go here")
                    )
            );

        try {
            await interaction.showModal(modal);
        } catch (error) {
            console.error(error);
        }
    },
};

export default gauntletSlashCommand;
