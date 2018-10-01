#!/bin/bash
# getgamelists.sh
#################
# Get the lists of all supported games, separated by console.
# And save it on its JSON format.

# global variables ############################################################

scriptdir="$(dirname "$0")"
scriptdir="$(cd "$scriptdir" && pwd)"

readonly url="https://retroachievements.org/dorequest.php?r=officialgameslist&c="
readonly gl_path="${scriptdir}/../assets/json"

CONSOLE_NAME=()
CONSOLE_NAME[1]=megadrive
CONSOLE_NAME[2]=n64
CONSOLE_NAME[3]=snes
CONSOLE_NAME[4]=gb
CONSOLE_NAME[5]=gba
CONSOLE_NAME[6]=gbc
CONSOLE_NAME[7]=nes
CONSOLE_NAME[8]=pcengine
CONSOLE_NAME[9]=segacd
CONSOLE_NAME[10]=sega32x
CONSOLE_NAME[11]=mastersystem
CONSOLE_NAME[12]=psx
CONSOLE_NAME[13]=atarilynx
CONSOLE_NAME[14]=ngp
CONSOLE_NAME[15]=gamegear
CONSOLE_NAME[16]=gamecube
CONSOLE_NAME[17]=jaguar
CONSOLE_NAME[18]=nds
CONSOLE_NAME[19]=wii
CONSOLE_NAME[20]=wiiu
CONSOLE_NAME[21]=ps2
CONSOLE_NAME[22]=xbox
CONSOLE_NAME[23]=skynet
CONSOLE_NAME[24]=xone
CONSOLE_NAME[25]=atari2600
CONSOLE_NAME[26]=dos
CONSOLE_NAME[27]=arcade
CONSOLE_NAME[28]=virtualboy
CONSOLE_NAME[29]=msx
CONSOLE_NAME[30]=commodore64
CONSOLE_NAME[31]=zx81

SUPPORTED_SYSTEMS=(megadrive n64 snes gb gba gbc nes pcengine mastersystem atarilynx ngp gamegear atari2600 arcade virtualboy)


# functions ###################################################################

function get_console_id() {
    local i
    local match="$1"

    for i in "${!CONSOLE_NAME[@]}"; do
        if [[ "${CONSOLE_NAME[i]}" == "$match" ]]; then
            echo -n "$i"
            return 0
        fi
    done
    return 1
}


function main() {
    local console
    local console_id
    local tmp="$(mktemp)"

    for console in "${SUPPORTED_SYSTEMS[@]}"; do
        echo "[LOG] getting gamelist for $console"
        console_id="$(get_console_id $console)" || continue
        curl -s "${url}${console_id}" > "$tmp"
        [[ -s "$tmp" ]] && mv "$tmp" "${gl_path}/gl-${CONSOLE_NAME[console_id]}.json"
    done
}


[[ "$0" == "$BASH_SOURCE" ]] && main "$@"

