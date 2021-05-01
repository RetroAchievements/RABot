const one = "**1.** Don't be a jerk or generally obnoxious - nobody likes trolls.";
const two = "**2.** Don't use our website or Discord server to share copyrighted material or information about where they can be downloaded.";
const three = "**3.** Keep the Discord channels and forum threads on-topic (we do have a section for off-topic chatting, though).";
const four = "**4.** When a moderator/admin asks you to stop, you should stop.";
const five = "**5.** When in doubt, ask a @mod";


const coc = '**Complete Version**: <http://docs.retroachievements.org/Users-Code-of-Conduct/>';

module.exports = {
  1: one,
  2: two,
  3: three,
  4: four,
  5: five,
  coc,

  all: `__**RULES**__\n**Simple Version**:\n${one}\n${two}\n${three}\n${four}\n${five}\n\n${coc}`,
};
