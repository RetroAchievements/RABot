const Command = require('../../structures/Command.js');

module.exports = class FramesCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'frames',
      group: 'rautil',
      memberName: 'frames',
      description: 'Says how many frames corresponds to a given amount of time or the vice-versa (see Examples below).',
      examples: [
        '`frames 1h 5min 15s` - info for 1 hour, 5 minutes and 15 seconds considering 60 frames/second (default)',
        '`frames 500ms 30fps` - info for 500 milliseconds, considering 30 frames/second',
        '`frames 123.321min 25fps` - info for 123.321 minutes, considering 25 frames/second',
        '`frames 40` - info for 40 frames, considering 60 frames/second (default)',
        '`frames 123 30fps` - info for 123 frames, considering 30 frames/second',
      ],
      args: [
        {
          key: 'input',
          prompt: '',
          type: 'string',
          infinite: true,
        },
      ],
    });
  }

  run(msg, { input }) {
    // group2: hours
    // group4: minutes
    // group6: seconds
    // group8: milliseconds
    const regexTime = /(([0-9.]+) *h)? *(([0-9.]+) *min)? *(([0-9.]+) *s)? *(([0-9]+) *ms)?/i;

    // group1: frames per second
    const regexFps = /([0-9]+) *fps/i;

    // group2: frames amount
    const regexFramesAmount = /^ *([0-9]+ *fps )? *((0x)?[a-f0-9]+) *( [0-9]+ *fps)? *$/i;

    const inputString = input.join(' ');

    const parsedTime = inputString.match(regexTime);
    const parsedFps = inputString.match(regexFps);

    let totalSeconds = 0;
    let fps;
    let frames;
    let hours;
    let minutes;
    let seconds;
    let milliseconds;

    fps = parsedFps ? parseFloat(parsedFps[1]) : 60;
    hours = parseFloat(parsedTime[2] || 0);
    minutes = parseFloat(parsedTime[4] || 0);
    seconds = parseFloat(parsedTime[6] || 0);
    milliseconds = parseFloat(parsedTime[8] || 0);
    totalSeconds = seconds + milliseconds / 1000 + minutes * 60 + hours * 60 * 60;

    if (totalSeconds > 0 && fps > 0) {
      frames = Math.round(fps * totalSeconds);
    } else {
      const parsedFramesAmount = inputString.match(regexFramesAmount);

      if (parsedFramesAmount) {
        const radix = parsedFramesAmount[2].startsWith('0x') ? 16 : 10;
        frames = parseInt(parsedFramesAmount[2], radix);
      }

      if (frames <= 0 || fps <= 0 || Number.isNaN(frames)) {
        msg.reply(`invalid time format: \`${inputString}\`\nUse \`!help frames\` to se some useful examples`);
        return;
      }

      totalSeconds = parseFloat(frames / fps);
    }

    // deal with the milliseconds first and then remove it from totalSeconds
    milliseconds = Math.round(1000 * (totalSeconds - Math.floor(totalSeconds)));
    totalSeconds = Math.floor(totalSeconds);

    hours = Math.floor(totalSeconds / 3600);
    minutes = Math.floor((totalSeconds - hours * 3600) / 60);
    seconds = totalSeconds - hours * 3600 - minutes * 60;

    msg.say(`**Time:** \`${hours}h ${minutes}min ${seconds}s ${milliseconds}ms\``
            + `\n**FPS:** \`${fps}\``
            + `\n**Frames:** \`${frames} (0x${frames.toString(16)})\``);
  }
};
