#!/usr/bin/env bash

PLUGIN_DIR="$1"

get_filetype() {
    local target="$1"

    local ft="$( xdg-mime query filetype "$target" )"
    if [ -z "$ft" ]; then
        echo 'text/unknown'
        return
    fi

    echo "$ft"
}

main() {
    selected="$( bash "$PLUGIN_DIR/src/marko.sh" -t )"
    [ -z "$selected" ] && exit 0

    selected="${selected/\~/$HOME}"

    if [ -d "$selected" ]; then
        tmux neww -c "$selected"
        exit 0
    fi

    case "$( get_filetype "$selected" )" in
        text/*)
            tmux neww -c "$HOME" -n "$( basename "$selected" )" "${EDITOR:-vi} $selected"
            ;;
        *)
            xdg-open "$selected"
            ;;

    esac
}

main "$@"
