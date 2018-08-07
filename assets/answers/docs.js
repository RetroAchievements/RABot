const site = 'https://docs.retroachievements.org/';
const radocs = "index.html";
const dev = "Developer-docs";
const devstart = "Getting-Started-as-an-Achievement-Developer";
const logic = "Achievement-Logic-Features";
const delta = "Achievement-Logic-Features#delta-values";
const hitcounts = "Achievement-Logic-Features#hit-counts";
const resetif = "Achievement-Logic-Features#resetif";
const pauseif = "Achievement-Logic-Features#pauseif";
const addsource = "Achievement-Logic-Features#add-source";
const subsource = "Achievement-Logic-Features#sub-source";
const addhits = "Achievement-Logic-Features#add-hits";
const altgroups = "Achievement-Logic-Features#alt-groups";
const examples = "Real-Examples";
const templates = "Achievement-Templates";
const finishlevel = "Achievement-Templates#finish-level-n";
const damageless = "Achievement-Templates#finish-level-n-without-dying-or-getting-hit-using-a-weapon-etc";
const collect = "Achievement-Templates#collect-an-item-in-a-specific-level";
const changeval = "Achievement-Templates#check-for-a-specific-value-changing-to-another-specific-value-ten-times";
const condreset = "Achievement-Templates#conditional-resets";
const difficulty = "Difficulty-Scale-and-Balance";
const roadmap = "Set-Development-Roadmap";
const badge = "Badge-and-Icon-Creation";
const lboards = "Leaderboards";
const rps = "Rich-Presence";
const cheevodesign = "Achievement-Design";
const bonus = "Bonus-Sets";
const hacks = "Achievements-for-ROM-hacks";
const lazy = "I-am-too-lazy-to-read-the-docs";
const coc = "Users-Code-of-Conduct";
const faq = "FAQ";
const nocheevos = "My-game-is-not-loading-achievements";
const contribute = "How-to-contribute-if-you-are-not-a-developer";
const softcore = "Why-you-shouldn't-use-the-load-state-feature";
const about = "About";
const ralibretro = "RALibretro";


module.exports = {
    site: site,

    pages: {
        dev: dev,
        devdocs: dev,

        devstart: devstart,
        jrdev: devstart,
        startdev: devstart,

        logic: logic,

        delta: delta,

        hitcounts: hitcounts,
        hits: hitcounts,

        resetif: resetif,

        pauseif: pauseif,

        addsource: addsource,

        subsource: subsource,

        addhits: addhits,

        altgroups: altgroups,
        alts: altgroups,
        alt: altgroups,

        examples: examples,

        templates: templates,

        finishlevel: finishlevel,

        damageless: damageless,
        deathless: damageless,

        collect: collect,
        collectitem: collect,
        getitem: collect,

        changeval: changeval,
        changingvalues: changeval,

        condreset: condreset,
        conditionalreset: condreset,

        difficulty: difficulty,

        roadmap: roadmap,
        devroadmap: roadmap,

        badge: badge,
        icon: badge,

        lboards: lboards,
        leaderboards: lboards,
        lbs: lboards,

        rps: rps,
        richpresence: rps,
        rp: rps,

        cheevodesign: cheevodesign,
        achievementdesign: cheevodesign,
        design: cheevodesign,

        bonus: bonus,
        bonusset: bonus,

        hacks: hacks,

        lazy: lazy,
        lazydev: lazy,
        lazynoob: lazy,

        coc: coc,
        conduct: coc,
        usercoc: coc,

        faq: faq,

        nocheevos: nocheevos,
        missingcheevos: nocheevos,

        contribute: contribute,

        softcore: softcore,
        loadstate: softcore,

        about: about,

        ralibretro: ralibretro,
    },
}
