const site = 'http://docs.retroachievements.org/FAQ/';
const emulator = '#which-emulator-do-i-need-to-use';
const psx = '#will-retroachievements-support-playstation';
const roms = '#where-can-i-find-roms';
const missingcheevos = '#why-is-my-game-not-loading-up-achievement';
const hardcore = '#what-is-hardcore-mode';
const tickets = '#this-achievement-didnt-trigger-or-triggered-at-a-wrong-time';
const manualunlock = '#i-completed-a-hard-cheevo-but-it-didnt-trigger-can-it-be-manually-awarded-to-me';
const whitepoints = '#what-are-the-white-points';
const cheat = '#whats-considered-cheating-for-hardcore-what-if-i-find-evidence-of-a-cheater';
const resetcheevo = '#what-if-i-got-an-achievement-i-didnt-earn';
const resetpassword = '#how-do-i-reset-my-password-if-i-dont-remember-my-password';
const rarchbadges = '#how-can-i-see-the-badge-when-i-earn-a-cheevo-on-retroarch';


module.exports = {
    site: site,

    pages: {
        emulator: emulator,
        emu: emulator,

        psx: psx,
        rapsx: psx,

        roms: roms,
        getroms: roms,

        missingcheevos: missingcheevos,
        nocheevos: missingcheevos,

        hardcore: hardcore,
        hc: hardcore,

        rarchbadges: rarchbadges,

        tickets: tickets,
        ticket: tickets,
        bug: tickets,
        buggycheevo: tickets,

        manualunlock: manualunlock,
        manualaward: manualunlock,

        whitepoints: whitepoints,
        wp: whitepoints,
        retroratio: whitepoints,

        cheat: cheat,
        cheater: cheat,

        resetcheevo: resetcheevo,
        reset: resetcheevo,

        resetpassword: resetpassword,
        password: resetpassword,
        pw: resetpassword,
    },

    answers: {
        default: site,
    },
}
