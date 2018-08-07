#!/usr/bin/env bash

ssh -T deploy-discord-bot@retroachievements.org << EOF
    cd /var/www/discord-bot
    git pull -v
    npm i --unsafe-perm=true --allow-root --production
    sudo supervisorctl restart discord-bot:*
EOF
