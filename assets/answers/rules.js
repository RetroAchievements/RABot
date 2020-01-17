const one = "**1.** Don't be a dick.";
const two = '**2.** Do NOT use this server to share copyrighted material or info about where they can be downloaded. Just use your favorite web search engine.';
const three = '**3.** Try to keep the channels on-topic. Off-topic and casual chatting: #casual. More info about channels: #about-us';
const four = '**4.** When in doubt, ask a @mod.';

const coc = '**Complete Version**: <http://docs.retroachievements.org/Users-Code-of-Conduct/>';

module.exports = {
  1: one,
  2: two,
  3: three,
  4: four,
  coc,

  all: `__**RULES**__\n**Simple Version**:\n${one}\n${two}\n${three}\n${four}\n\n${coc}`,
};
