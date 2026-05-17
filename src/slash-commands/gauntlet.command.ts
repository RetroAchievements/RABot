import {
    CheckboxGroupOptionBuilder,
    ContainerBuilder,
    MessageFlags,
    ModalBuilder,
    ModalSubmitInteraction,
    RadioGroupOptionBuilder,
    SectionBuilder,
    SeparatorSpacingSize,
    SlashCommandBuilder,
    TextDisplayBuilder,
    TextInputStyle
} from "discord.js";

import type {SlashCommand} from "../models";
import {GameInfoService} from "../services/game-info.service.ts";

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
                {name: 'Icon for Hub/Game', value: 'icon'},
                {name: 'Collage for multiple Badges', value: 'collage'}
            )
        ),

    cooldown: 60, // 1 minute cooldown, not too long for easy re-try, not too short to prevent spam

    async execute(interaction, _client) {
        // options
        const url = interaction.options.getString("url", true);
        const type: 'icon' | 'collage' = interaction.options.getString("type", true) as 'icon' | 'collage';

        const regex = /^https:\/\/retroachievements\.org\/(?:hub|game)\/\d+\/?$/;

        if (!regex.test(url)) {
            await interaction.reply({
                content: "Please specify a valid URL for the game/hub you want to change!",
                flags: MessageFlags.Ephemeral
            })
            return;
        }

        // ["https:", "", "retroachievements.org", "hub/game", "id"]
        const urlSplit = url.split('/')
        const hubOrGame = urlSplit[3]
        const itemId = urlSplit[4]

        const info = await GameInfoService.fetchGameInfo(Number(itemId));

        if (info == null) {
            await interaction.reply({
                content: "Unable to find the provided game. Did you enter the correct link?",
                flags: MessageFlags.Ephemeral
            })
            return;
        }

        // Check if there are multiple developers. This slightly tweaks the input to handle this
        const authors = Object.values(info.achievements).map((value) => {
            return value.author
        });
        const uniqAuthors = [...new Set(authors)];
        const multipleAuthors = uniqAuthors.length > 1;

        // Stores all our info to pass to the final component
        const actualPollId = "gauntlet:" + hubOrGame + ":" + itemId + ":" + type;

        // Build our modal
        const modal = new ModalBuilder()
            .setCustomId(actualPollId)
            .setTitle("Icon Gauntlet Submission")

            .addTextDisplayComponents(text => text
                .setContent("Use this form to add all the information about your icons.\n\n" +

                    (type == 'icon'
                        ? ("Since you are just updating an icon, you don't need to provide the original info, it will be fetched automatically. " +
                            "Upload your potential files in the second box. You can upload up to 10 contenders at once!")
                        : ("Since you are using a collage, upload both the original icons in the first box and all of the contenders in the second box. ")) +

                    "\n\nThen, select if you contacted the set dev, or if you did not, select why not. " +
                    (multipleAuthors
                        ? "Note that you must contact every active developer of the set. "
                        : "Note that you must contact the developer unless one of the listed exemptions apply. ") +
                    "Regardless of what you enter, it will be added to the final message, so you don't need to mention it in your final message. " +

                    "\n\nFinally, if you do have anything else to say, use the final Additional Info box. " +
                    "Put information like your reasoning, what you changed, etc. " +
                    "You don't need to mention the @icon-gauntlet, it will do that when you submit this form." +

                    "\nNote that if you are trying to gauntlet a default icon on an unclaimed set or hub, you don't have to! " +
                    "You can just submit it to #cleanup-requests."
                ))

            .addLabelComponents(
                (originalLabel) => originalLabel
                    .setLabel(type == 'icon' ? "Original Icon" : 'Current Icons')
                    .setDescription(type == 'icon' ? "Leave blank to use current icon" : 'Upload a preview of what the icons currently look like')
                    .setFileUploadComponent((file) => file
                        .setCustomId("icon:original")
                        .setMaxValues(1)
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

                (contactDevLabel) => (multipleAuthors ? contactDevLabel
                    .setLabel("Have you contacted the developers regarding this?")
                    .setDescription("You must contact every active developer, unless an exemption applies. Select all relevant options.")
                    .setCheckboxGroupComponent((radioGroup) => radioGroup
                        .setCustomId("notify:group")
                        .addOptions(
                            new CheckboxGroupOptionBuilder()
                                .setLabel("Yes, they have been notified, and replied")
                                .setDescription("Good job!")
                                .setValue("notified"),
                            new CheckboxGroupOptionBuilder()
                                .setLabel("Yes, they have been notified, but did not respond in 72 hours")
                                .setDescription("If no response, well, you tried.")
                                .setValue("notified-no-reply"),
                            new CheckboxGroupOptionBuilder()
                                .setLabel("No, they have opted-out")
                                .setDescription("Check the sheet to be sure!")
                                .setValue("optout"),
                            new CheckboxGroupOptionBuilder()
                                .setLabel("No, they are inactive")
                                .setDescription("No need to contact then")
                                .setValue("inactive"),
                            new CheckboxGroupOptionBuilder()
                                .setLabel("No, it is unclaimed")
                                .setDescription("No one to contact if there's no set")
                                .setValue("unclaimed"),
                            new CheckboxGroupOptionBuilder()
                                .setLabel("No, this is a hub")
                                .setDescription("Who would you contact anyway?")
                                .setValue("hub")
                        )
                    ) : contactDevLabel
                    .setLabel("Have you contacted the developer regarding this?")
                    .setDescription("This is required unless you have one of the exemptions. It will be added to your message for you.")
                    .setRadioGroupComponent((radioGroup) => radioGroup
                        .setCustomId("notify:group")
                        .addOptions(
                            new RadioGroupOptionBuilder()
                                .setLabel("Yes, they have been notified, and replied")
                                .setDescription("Good job!")
                                .setValue("notified"),
                            new RadioGroupOptionBuilder()
                                .setLabel("Yes, they have been notified, but did not respond in 72 hours")
                                .setDescription("If no response, well, you tried.")
                                .setValue("notified-no-reply"),
                            new RadioGroupOptionBuilder()
                                .setLabel("No, they have opted-out")
                                .setDescription("Check the sheet to be sure!")
                                .setValue("optout"),
                            new RadioGroupOptionBuilder()
                                .setLabel("No, they are inactive")
                                .setDescription("No need to contact then")
                                .setValue("inactive"),
                            new RadioGroupOptionBuilder()
                                .setLabel("No, it is unclaimed")
                                .setDescription("No one to contact if there's no set")
                                .setValue("unclaimed"),
                            new RadioGroupOptionBuilder()
                                .setLabel("No, this is a hub")
                                .setDescription("Who would you contact anyway?")
                                .setValue("hub")
                        )
                    )),

                (additionalInfoLabel) => additionalInfoLabel
                    .setLabel("Additional Info")
                    .setDescription("Anything else you want to add? You can also leave a message below this poll for more control.")
                    .setTextInputComponent((textInput) => textInput
                        .setCustomId("user:thoughts")
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(false)
                        .setPlaceholder("Your thoughts go here.")
                    )
            );

        try {
            await interaction.showModal(modal);
        } catch (error) {
            console.error(error);
        }
    },
};

export class GauntletCommand {
    async handleModalSubmit(event: ModalSubmitInteraction) {
        const customId = event.customId.split(":");
        const type = customId[3]! as 'icon' | 'collage';

        if (type == 'icon') {
            await this.buildIconGauntletComponent(event);
        } else if (type == 'collage') {
            await this.buildCollageGauntletComponent(event);
        } else {
            await event.reply({
                content: "Invalid gauntlet type specified!",
                flags: MessageFlags.Ephemeral
            })
        }
    }

    async buildIconGauntletComponent(event: ModalSubmitInteraction) {
        const author = event.user;
        const customId = event.customId.split(":"); // this stores the type, hub/game, and its ID
        const hubOrGame = customId[1]!;
        const itemId = customId[2]!;

        // might be null if not provided, will be something for collages. we need to fetch the icon (if null) and name ourselves
        const originalIcon = event.fields.getUploadedFiles("icon:original");
        const contenders = event.fields.getUploadedFiles("icon:contenders", true);

        const info = await GameInfoService.fetchGameInfo(Number(itemId));

        if (info == null) {
            await event.reply({
                content: "Unable to find game. Did you put the right link?",
                flags: MessageFlags.Ephemeral
            })
            return;
        }

        const originalIconUrl = originalIcon == null || originalIcon.size == 0 ? ("https://media.retroachievements.org" + info.imageIcon) : originalIcon.at(0)!.url

        const notes = event.fields.getTextInputValue("user:thoughts")
        const devNotice = this.parseDevNotice(event.fields.getRadioGroup('notify:group', true))

        const contenderComponents: SectionBuilder[] = [];
        for (let i = 0; i < contenders.size; i++) {
            const contender = contenders.at(i)!;

            contenderComponents.push(new SectionBuilder()
                .setThumbnailAccessory(contenderThumbnail => contenderThumbnail.setURL(contender.url))
                .addTextDisplayComponents(contenderText => contenderText.setContent("# 1️⃣ Contender " + (i + 1)))
            )
        }

        const components = [
            new TextDisplayBuilder().setContent(`Attention @icon-gauntlet! A new gauntlet has been started by <@!${author.id}>.`),
            new ContainerBuilder()
                .addTextDisplayComponents(
                    componentLink => componentLink.setContent(`Game/Hub: [${info.title}](https://retroachievements.org/game/${info.id})`),
                    componentType => componentType.setContent("Changing: Mastery/Hub Icon")
                )
                .addSeparatorComponents(separator => separator.setSpacing(SeparatorSpacingSize.Small).setDivider(true))
                .addTextDisplayComponents(
                    authorNotes => authorNotes.setContent("Author left additional notes: " + notes),
                    devNotify => devNotify.setContent(`Author has stated ${devNotice}.`),
                )
                .addSeparatorComponents(separator => separator.setSpacing(SeparatorSpacingSize.Small).setDivider(true))
                .addSectionComponents(
                    new SectionBuilder()
                        .setThumbnailAccessory(thumbnail => thumbnail.setURL(originalIconUrl))
                        .addTextDisplayComponents(iconText => iconText.setContent("# 🅾️ Original Icon")),
                )
                .addSectionComponents(contenderComponents)
        ];

        await event.reply({components, flags: MessageFlags.IsComponentsV2})
    }

    async buildCollageGauntletComponent(event: ModalSubmitInteraction) {
        const author = event.user;
        const customId = event.customId.split(":"); // this stores the type, hub/game, and its ID
        const itemId = customId[2]!;

        const originalIcon = event.fields.getUploadedFiles("icon:original", true);
        const contenders = event.fields.getUploadedFiles("icon:contenders", true);

        const info = await GameInfoService.fetchGameInfo(Number(itemId));

        if (info == null) {
            await event.reply({
                content: "Unable to find game. Did you put the right link?",
                flags: MessageFlags.Ephemeral
            })
            return;
        }

        const notes = event.fields.getTextInputValue("user:thoughts")
        const devNotice = this.parseDevNotice(event.fields.getRadioGroup('notify:group', true))

        let pollContainer = new ContainerBuilder()
            .setAccentColor(9225410)
            .addTextDisplayComponents(
                componentLink => componentLink.setContent(`Game: [${info.title}](https://retroachievements.org/game/${info.id})`),
                componentType => componentType.setContent("Changing: Achievement Icons")
            )
            .addSeparatorComponents(separator => separator.setSpacing(SeparatorSpacingSize.Small).setDivider(true))
            .addTextDisplayComponents(
                authorNotes => authorNotes.setContent("Author left additional notes: " + notes),
                devNotify => devNotify.setContent(`Author has stated ${devNotice}.`),
            )
            .addSeparatorComponents(separator => separator.setSpacing(SeparatorSpacingSize.Small).setDivider(true))
            .addTextDisplayComponents(contender => contender.setContent("# 🅾️ Original Icons"))
            .addMediaGalleryComponents(mediaGallery => mediaGallery.addItems(
                contenderImage => contenderImage.setURL(originalIcon.at(0)!.url),
            ))

        for (let i = 0; i < contenders.size; i++) {
            const contender = contenders.at(i)!;

            pollContainer = pollContainer
                .addTextDisplayComponents(contender => contender.setContent("# 1️⃣ Contender " + (i+1)))
                .addMediaGalleryComponents(mediaGallery => mediaGallery.addItems(
                    contenderImage => contenderImage.setURL(contender.url),
                ))
        }

        const components = [
            new TextDisplayBuilder().setContent(`Attention @icon-gauntlet! A new gauntlet has been started by <@!${author.id}>.`),
            pollContainer
        ];

        await event.reply({components, flags: MessageFlags.IsComponentsV2})
    }

    private parseDevNotice(response: string): string {
        switch (response) {
            case 'notified':
                return "the developer has been notified."
            case 'notified-no-reply':
                return 'the developer was notified, but did not get a response in 72 hours.'
            case 'optout':
                return "the developer has opted-out of gauntlet notices."
            case 'inactive':
                return "the developer is inactive."
            case 'unclaimed':
                return "set is undeveloped and unclaimed."
            case 'hub':
                return ''; // hubs don't need to be contacted

            default:
                return "unknown developer notice response, report this error."
        }
    }
}

export default gauntletSlashCommand;
