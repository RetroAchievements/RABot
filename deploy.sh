#!/usr/bin/env bash

ssh -T deploy-discord-bot@retroachievements.org << EOF
    cd /srv/discord-bot
    git pull -v
    npm i --production
    sudo supervisorctl restart discord-bot:*
EOF
