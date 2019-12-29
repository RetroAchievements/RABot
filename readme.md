# RetroAchievements.org Discord Bot

🤖 **RABot** is the official RetroAchievements' Discord bot. It's an active bot at [RetroAchievements.org Discord server](https://discord.gg/dq2E4hE). If you wanna see it in action, join the server and type `!help`.

The code is written in JavaScript and is powered by [discord.js library](https://discord.js.org/#/docs/main/) and [Commando framework](https://discord.js.org/#/docs/commando/).

If you are used to those technologies and would like to contribute, PRs are welcome! 

## Nerdy info

### Requirements

node.js


### Install

```
$ npm i
```

Fetch game lists and add a badwords file

```
$ bash util/getgamelist.sh
$ echo "[]" > assets/json/badwordsRule2.json
```

### Run

Set the `.env` file properly and then:

#### Production
```
$ node index.js
```

#### Development

To run the bot for development which includes hot-reload, please use the following command:

```
$ npm run dev
```


### Inspiration

Many inspiration for RABot was obtained from the [Xiao bot's code](https://github.com/dragonfire535/xiao).


