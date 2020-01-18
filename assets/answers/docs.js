const site = 'https://docs.retroachievements.org/';
const radocs = 'index.html';
const dev = 'Developer-docs';
const devstart = 'Getting-Started-as-an-Achievement-Developer';
const meminspector = 'Memory-Inspector-Overview';
const logic = 'Achievement-Logic-Features';
const delta = 'Achievement-Logic-Features#delta-values';
const hitcounts = 'Achievement-Logic-Features#hit-counts';
const resetif = 'Achievement-Logic-Features#resetif';
const pauseif = 'Achievement-Logic-Features#pauseif';
const addsource = 'Achievement-Logic-Features#add-source';
const subsource = 'Achievement-Logic-Features#sub-source';
const addhits = 'Achievement-Logic-Features#add-hits';
const altgroups = 'Achievement-Logic-Features#alt-groups';
const examples = 'Real-Examples';
const templates = 'Achievement-Templates';
const finishlevel = 'Achievement-Templates#finish-level-n';
const damageless = 'Achievement-Templates#finish-level-n-without-dying-or-getting-hit-using-a-weapon-etc';
const collect = 'Achievement-Templates#collect-an-item-in-a-specific-level';
const changeval = 'Achievement-Templates#check-for-a-specific-value-changing-to-another-specific-value-ten-times';
const condreset = 'Achievement-Templates#conditional-resets';
const difficulty = 'Difficulty-Scale-and-Balance';
const roadmap = 'Set-Development-Roadmap';
const badge = 'Badge-and-Icon-Creation';
const lboards = 'Leaderboards';
const rps = 'Rich-Presence';
const cheevodesign = 'Achievement-Design';
const bonus = 'Bonus-Sets';
const hacks = 'Achievements-for-ROM-hacks';
const lazy = 'I-am-too-lazy-to-read-the-docs';
const coc = 'Users-Code-of-Conduct';
const faq = 'FAQ';
const nocheevos = 'My-game-is-not-loading-achievements';
const contribute = 'How-to-contribute-if-you-are-not-a-developer';
const softcore = "Why-you-shouldn't-use-the-load-state-feature";
const about = 'About';
const ralibretro = 'RALibretro';
const devcoc = 'Developers-Code-of-Conduct';
const badconcepts = 'Developers-Code-of-Conduct#unwelcome-concepts';
const beadev = 'How-to-Become-an-Achievement-Developer';
const revision = 'Achievement-Set-Revisions';


module.exports = {
    site,

    pages: {
        dev,
        devdocs: dev,

        devstart,
        jrdev: devstart,
        startdev: devstart,

        meminspector,

        logic,

        delta,

        hitcounts,
        hits: hitcounts,

        resetif,

        pauseif,

        addsource,

        subsource,

        addhits,

        altgroups,
        alts: altgroups,
        alt: altgroups,

        examples,

        templates,

        finishlevel,

        damageless,
        deathless: damageless,

        collect,
        collectitem: collect,
        getitem: collect,

        changeval,
        changingvalues: changeval,

        condreset,
        conditionalreset: condreset,

        difficulty,

        roadmap,
        devroadmap: roadmap,

        badge,
        icon: badge,

        lboards,
        leaderboards: lboards,
        lbs: lboards,

        rps,
        richpresence: rps,
        rp: rps,

        cheevodesign,
        achievementdesign: cheevodesign,
        design: cheevodesign,

        bonus,
        bonusset: bonus,

        hacks,
        hack: hacks,

        lazy,
        lazydev: lazy,
        lazynoob: lazy,

        coc,
        conduct: coc,
        usercoc: coc,

        faq,

        nocheevos,
        missingcheevos: nocheevos,

        contribute,

        softcore,
        loadstate: softcore,

        about,

        ralibretro,

        devcoc,

        badconcepts,

        beadev,

        revision,
    },

    answers: {
        default: site,
    },
};
