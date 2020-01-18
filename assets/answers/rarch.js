const site = 'https://docs.libretro.com/';

// pages
const cheevos = 'guides/retroachievements/';
const netplay = 'guides/netplay-faq/';
const cores = 'guides/retroachievements/#cores-compatibility';

// answers
const nightly = '**Download the most up to date version of RetroArch here:\n<http://buildbot.libretro.com/nightly/>**';

const specific = '**We have a #retroarch channel, but for questions completely unrelated to RetroAchievements, maybe you can get more help at libretro discord server:\n<https://discordapp.com/invite/chjzzQx>**';

const badges = "This feature was implemented in RetroArch 1.7.7 (May/2019), however there are some platforms where it still doesn't work (such as PS Vita). You just need to assure the Menu Widget option enabled (and it's usually enabled by default).";

const def = `**With RetroArch you can earn RetroAchievements on a wide range of computers and consoles.**\nMore info here: <${site}>`;


module.exports = {
    site,

    pages: {
        cheevos,
        netplay,
        cores,
    },

    answers: {
        nightly,
        specific,
        badges,
        default: def,
    },
};
