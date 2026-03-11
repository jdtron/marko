#!/bin/bash

CURRENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

tmux_get_option() {
    local opt="$1"
    local default="$2"

    local value="$( tmux show-option -gqv "$opt" )"
    if [ -n "$value" ]; then
        echo "$value"
    else
        echo "$default"
    fi
}

install_marko() {
    bash "$CURRENT_DIR/scripts/install.sh"
}

is_installed() {
    if command -v marko-tui 2>&1 1>/dev/null; then
        return 0
    else
        return 1
    fi
}

is_outdated() {
    local git_version="$( git -C "$CURRENT_DIR" describe --tags )"
    local marko_version="$( marko-tui -V | xargs )"

    if [ "$git_version" != "$marko_version" ]; then
        return 0
    else
        return 1
    fi
}

main() {
    if ! is_installed || is_outdated; then
        echo "Installing marko"
        bash "$CURRENT_DIR/scripts/install.sh"
    fi

    local key="$( tmux_get_option '@marko-key' 'M' )"
    tmux bind-key "$key" run-shell 'marko-tui -t'
}

main $@
