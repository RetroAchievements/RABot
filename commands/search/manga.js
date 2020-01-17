/*
 * This code is highly based on the work of dragonfire535 and his Xiao bot:
 * https://github.com/dragonfire535/xiao
 */
const Command = require("../../structures/Command");
const request = require("node-superfetch");
const { RichEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");
const { shorten } = require("../../util/Utils");

const searchGraphQL = stripIndents`
    query ($search: String, $type: MediaType, $isAdult: Boolean) {
        anime: Page (perPage: 1) {
            results: media (type: $type, isAdult: $isAdult, search: $search) { id }
        }
    }
`;

const resultGraphQL = stripIndents`
    query media($id: Int, $type: MediaType) {
        Media(id: $id, type: $type) {
            id
            title { userPreferred }
            coverImage { large }
            startDate { year }
            description
            type
            status
            volumes
            chapters
            isAdult
            meanScore
        }
    }
`;

module.exports = class MangaCommand extends Command {
    constructor(client) {
        super(client, {
            name: "manga",
            group: "search",
            memberName: "manga",
            description: "Searches AniList for your query, getting manga results.",
            clientPermissions: ["EMBED_LINKS"],
            args: [
                {
                    key: "query",
                    prompt: "What manga would you like to search for?",
                    type: "string"
                }
            ]
        });
    }

    async run(msg, { query }) {
        const sentMsg = await msg.reply(":hourglass: Getting info, please wait...");

        try {
            const id = await this.search(query, msg.channel.nsfw);
            if (!id)
                return sentMsg.edit("Didn't find anything... :frowning:");

            const manga = await this.fetchAnime(id);

            const response = new RichEmbed()
                .setColor(0x02A9FF)
                .setAuthor("AniList", "https://i.imgur.com/iUIRC7v.png", "https://anilist.co/")
                .setURL(`https://anilist.co/manga/${manga.id}`)
                .setThumbnail(manga.coverImage.large || null)
                .setTitle(manga.title.userPreferred)
                .setDescription(manga.description ? shorten(manga.description.replace(/( *<br> *)+/g, "\n")) : "No description.")
                .addField("Status", manga.status, true)
                .addField("Chapters / Volumes", `${manga.chapters || "???"}/${manga.volumes || "???"}`, true)
                .addField("Year", manga.startDate.year, true)
                .addField("Average Score", `${manga.meanScore}/100`, true);

            return sentMsg.edit(response);
        } catch (err) {
            return msg.reply(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
        }
    }

    async search(query, nsfw) {
        const { body } = await request
            .post("https://graphql.anilist.co/")
            .send({
                variables: {
                    search: query,
                    type: "MANGA",
                    isAdult: Boolean(nsfw)
                },
                query: searchGraphQL
            });
        if (!body.data.anime.results.length) return null;
        return body.data.anime.results[0].id;
    }

    async fetchAnime(id) {
        const { body } = await request
            .post("https://graphql.anilist.co/")
            .send({
                variables: {
                    id,
                    type: "MANGA"
                },
                query: resultGraphQL
            });
        return body.data.Media;
    }
};
