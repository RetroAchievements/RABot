#!/usr/bin/env bash
# getgamelists.sh
#################
# Get the lists of all supported games, separated by console.
# And save it on its JSON format.

# global variables ############################################################

scriptdir="$(dirname "$0")"
scriptdir="$(cd "$scriptdir" && pwd)"

readonly url="https://retroachievements.org/dorequest.php?r=officialgameslist&c="
readonly glPath="${scriptdir}/../assets/json"

# valid console IDs obtained from isValidConsoleId() function in
# https://github.com/RetroAchievements/RAWeb/blob/develop/lib/database/release.php
readonly validConsoleIds=(
    1 # Mega Drive/Genesis
    2 # Nintendo 64
    3 # SNES
    4 # Game Boy
    5 # Game Boy Advance
    6 # Game Boy Color
    7 # NES
    8 # PC Engine
    9 # Sega CD
    10 # Sega 32X
    11 # Master System
    12 # PlayStation
    13 # Atari Lynx
    14 # Neo Geo Pocket
    15 # Game Gear
    # 16 # GameCube
    17 # Atari Jaguar
    18 # Nintendo DS
    # 19 # Wii
    # 20 # Wii U
    # 21 # PlayStation 2
    # 22 # Xbox
    # 23 # Unused
    24 # Pokemon Mini
    25 # Atari 2600
    # 26 # DOS
    27 # Arcade
    28 # Virtual Boy
    # 29 # MSX
    # 30 # Commodore 64
    # 31 # ZX81
    # 32 # Oric
    33 # SG-1000
    # 34 # VIC-20
    # 35 # Amiga
    # 36 # Atari ST
    # 37 # Amstrad CPC
    38 # Apple II
    39 # Sega Saturn
    # 40 # Dreamcast
    # 41 # PlayStation Portable
    # 42 # Philips CD-i
    # 43 # 3DO Interactive Multiplayer
    44 # ColecoVision
    # 45 # Intellivision
    # 46 # Vectrex
    47 # PC-8000/8800
    # 48 # PC-9800
    # 49 # PC-FX
    # 50 # Atari 5200
    51 # Atari 7800
    # 52 # X68K
    53 # WonderSwan
    # 54 # Cassette Vision
    # 55 # Super Cassette Vision
    # 100 # Hubs (not an actual console)
    # 101 # Events (not an actual console)
)

readonly consoleNames=(
    ZERO            # I know, it's an ugly (and shameless) workaround
    megadrive       # 1 # Mega Drive/Genesis
    n64             # 2 # Nintendo 64
    snes            # 3 # SNES
    gb              # 4 # Game Boy
    gba             # 5 # Game Boy Advance
    gbc             # 6 # Game Boy Color
    nes             # 7 # NES
    pcengine        # 8 # PC Engine
    segacd          # 9 # Sega CD
    sega32x         # 10 # Sega 32X
    mastersystem    # 11 # Master System
    psx             # 12 # PlayStation
    atarilynx       # 13 # Atari Lynx
    ngp             # 14 # Neo Geo Pocket
    gamegear        # 15 # Game Gear
    gamecube        # # 16 # GameCube
    jaguar          # 17 # Atari Jaguar
    nds             # 18 # Nintendo DS
    wii             # # 19 # Wii
    wiiu            # # 20 # Wii U
    ps2             # # 21 # PlayStation 2
    xbox            # # 22 # Xbox
    UNUSED          # # 23 # Unused
    pokemonmini     # 24 # Pokemon Mini
    atari2600       # 25 # Atari 2600
    dos             # # 26 # DOS
    arcade          # 27 # Arcade
    virtualboy      # 28 # Virtual Boy
    msx             # # 29 # MSX
    commodore       # # 30 # Commodore 64
    zx81            # # 31 # ZX81
    oric            # # 32 # Oric
    sg100           # 33 # SG-1000
    vic20           # # 34 # VIC-20
    amiga           # # 35 # Amiga
    atarist         # # 36 # Atari ST
    amstradcpc      # # 37 # Amstrad CPC
    apple2          # 38 # Apple II
    saturn          # 39 # Sega Saturn
    dreamcast       # # 40 # Dreamcast
    psp             # # 41 # PlayStation Portable
    philipscdi      # # 42 # Philips CD-i
    3do             # # 43 # 3DO Interactive Multiplayer
    coleco          # 44 # ColecoVision
    intellivision   # # 45 # Intellivision
    vectrex         # # 46 # Vectrex
    pc88            # 47 # PC-8000/8800
    pc98            # # 48 # PC-9800
    pcfx            # # 49 # PC-FX
    atari5200       # # 50 # Atari 5200
    atari7800       # 51 # Atari 7800
    x68k            # # 52 # X68K
    wonderswan      # 53 # WonderSwan
    cassettevision  # # 54 # Cassette Vision
    scassettevision # # 55 # Super Cassette Vision
)


# functions ###################################################################

function main() {
    local consoleId
    local consoleName
    local tmp="$(mktemp)"

    for consoleId in "${validConsoleIds[@]}"; do
        consoleName="${consoleNames[consoleId]}"
        echo "[LOG] getting gamelist for $consoleName ($consoleId)"
        curl -s "${url}${consoleId}" > "$tmp"
        [[ -s "$tmp" ]] && mv "$tmp" "${glPath}/gl-${consoleName}.json"
    done
}


[[ "$0" == "$BASH_SOURCE" ]] && main "$@"
