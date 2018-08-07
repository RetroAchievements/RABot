const site = 'https://docs.libretro.com/';

// pages
const cheevos = 'guides/retroachievements/';
const netplay = 'guides/netplay-faq/';
const cores = 'guides/retroachievements/#cores-compatibility';

// answers
const nightly = '**Download the most up to date version of RetroArch here:\n<http://buildbot.libretro.com/nightly/>**';

const specific = '**We have a #retroarch channel, but for questions completely unrelated to RetroAchievements, maybe you can get more help at libretro discord server:\n<https://discordapp.com/invite/chjzzQx>**';

const badges = '**When playing on RetroArch you do NOT have the feature that shows the cheevo\'s badge when you complete it.**\nMore info here: <http://docs.retroachievements.org/FAQ/#how-can-i-see-the-badge-when-i-earn-a-cheevo-on-retroarch>';

const def = `**With RetroArch you can earn RetroAchievements on a wide range of computers and consoles.**\nMore info here: <${site}>`;


module.exports = {
    site: site,

    pages: {
        cheevos: cheevos,
        netplay: netplay,
        cores: cores,
    },

    answers: {
        nightly: nightly,
        specific: specific,
        badges: badges,
        default: def,
    },
}
