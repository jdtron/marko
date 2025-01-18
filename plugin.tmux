#!/usr/bin/env bash

CURRENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$CURRENT_DIR/src/tmux/util.sh"

key="$( tmux_get_option '@marko-key' 'M' )"

tmux bind-key $key run-shell "bash $CURRENT_DIR/src/tmux/plugin.sh '$CURRENT_DIR'"
