const { Collection } = require('discord.js');
const Command = require('../../structures/Command.js');

const allOptions = Object.values(require('../../assets/json/emoji-alphabet.json'));

const logger = require('pino')({
  useLevelLabels: true,
  timestamp: () => `,"time":"${new Date()}"`,
});

function removeReaction(sentMsg, user) {
  sentMsg.channel.fetchMessage(sentMsg.id).then((message) => {
    message.reactions.forEach((r) => r.remove(user.id));
  });
}

module.exports = class TimedPollCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'htpoll',
      group: 'poll',
      memberName: 'htpoll',
      aliases: ['hiddentimedpoll'],
      description: 'Create a hidden timed poll.',
      examples: ['`tpoll 60 \'Which option you choose?\' \'option one\' \'option 2\' \'option N\'`'],
      throttling: {
        usages: 1,
        duration: 30,
      },
      argsSingleQuotes: true,
      argsPromptLimit: 0,
      args: [
        {
          key: 'seconds',
          type: 'integer',
          prompt: '',
          min: 0,
          max: 604800, // 604,800 seconds = 1 week
        },
        {
          key: 'question',
          type: 'string',
          prompt: '',
          validate: (question) => {
            if (question.length > 0 && question.length < 200) return true;
            return 'Invalid question';
          },
        },
        {
          key: 'opts',
          prompt: '',
          type: 'string',
          infinite: true,
          default: '~NO~OPTS~',
        },
      ],
    });
  }

  async run(msg, {
    seconds, question, opts,
  }) {
    if (opts.length < 2 || opts.length > 10) return msg.reply('The number of options must be greater than 2 and less than 10');

    let options = '';
    let i;
    const pollMsg = [];
    const milliseconds = seconds <= 0 ? 0 : seconds * 1000;
    const voters = [];
    const pollResults = new Collection();

    const reactions = allOptions.slice(0, opts.length);

    for (i = 0; i < opts.length; i += 1) {
      options += `\n${reactions[i]} ${opts[i]}`;

      // let's check if there's a repetition in the options
      for (let j = i + 1; j < opts.length; j += 1) if (opts[i] === opts[j]) return msg.reply(`**\`poll\` error**: repeated options found: \`${opts[i]}\``);
    }

    pollMsg.push(`__*${msg.author} started a hidden poll*__:`);
    pollMsg.push(`\n:bar_chart: **${question}**\n${options}`);

    if (milliseconds) pollMsg.push('\n`Notes:\n- only the first reaction is considered a vote\n- unlisted reactions void the vote`');

    const sentMsg = await msg.channel.send(pollMsg);

    if (milliseconds) {
      const endTime = sentMsg.createdAt;
      endTime.setTime(endTime.getTime() + milliseconds);

      pollMsg.push(`:stopwatch: *This poll ends at ${endTime}*`);
      sentMsg.edit(pollMsg);
    }

    for (i = 0; i < opts.length; i += 1) await sentMsg.react(reactions[i]);

    if (!milliseconds) return;

    const filter = async (reaction, user) => {
      // ignore bot's reactions
      if (this.client.user.id === user.id) {
        return false;
      }

      // do not allow repeated votes
      if (voters.indexOf(user.id) < 0) {
        voters.push(user.id);
      } else {
        removeReaction(sentMsg, user);
        return false;
      }

      // do not count invalid reactions
      if (!reactions.includes(reaction.emoji.name)) {
        return false;
      }

      // if the logic reaches here, then the reaction is accepted as a vote
      let numVotes = pollResults.get(reaction.emoji.name);
      numVotes = !numVotes ? 1 : numVotes + 1;

      pollResults.set(reaction.emoji.name, numVotes);

      removeReaction(sentMsg, user);

      return true;
    };

    sentMsg.awaitReactions(filter, { time: milliseconds })
      .then((collected) => {
        const pollEndedMsg = [];

        pollMsg[0] = `~~${pollMsg[0]}~~\n:no_entry: **THIS POLL IS ALREADY CLOSED** :no_entry:`;
        pollMsg.pop(); // removing the message saying when the poll ends
        pollMsg.pop(); // removing the note about how to vote
        pollMsg.push('\n`This poll is closed.`');
        pollMsg.push('__**RESULTS:**__\n');

        if (collected.size === 0) {
          pollMsg.push('No one voted');
        } else {
          pollResults.sort((v1, v2) => v2 - v1);
          pollResults.forEach((value, key) => pollMsg.push(`${key}: ${value}`));
        }

        sentMsg.edit(pollMsg);

        pollEndedMsg.push('**Your poll has ended.**\n**Click this link to see the results:**');
        pollEndedMsg.push(`<${sentMsg.url}>`);
        msg.reply(pollEndedMsg);
      })
      .catch((error) => {
        logger.error(error);
        msg.reply('**`poll` error**: Something went wrong with your poll.');
      });
  }
};
