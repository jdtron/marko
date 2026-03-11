#!/bin/bash

MARKO_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"
PREFIX="${PREFIX:-$HOME/.local/bin}"
TARGET="$PREFIX/marko-tui"
LIB="$HOME/.local/lib/marko.sh"

_dependencies=( bun )
_shell="$( basename $SHELL )"

# Check system dependencies
_check_dependencies() {
    for dep in ${_dependencies[*]}; do
        if ! command -v "$dep" 2>&1 1>/dev/null; then
            echo "$dep is not installed. Please install $dep and try again"
            exit 1
        fi
    done
}

# Install dependencies
_build() {
    cd "$MARKO_DIR"
    bun ci
    bun run build
}

# Install Marko
_install() {
    install -Dm755 "$MARKO_DIR/dist/marko-tui" "$TARGET"
}

# Install shell wrapper
_install_wrapper() {
    mkdir -p $( dirname "$LIB" )
    install -Dm744 "$MARKO_DIR/src/shell.sh" "$LIB"

    if [ "$_shell" = 'zsh' ]; then
        _shellrc="$HOME/.zshrc"
    elif [ "$_shell" = 'bash' ]; then
        _shellrc="$HOME/.bashrc"
    else
        echo 'Unsupported shell' >&2
        exit 1
    fi

    grep "$LIB" "$_shellrc" 2>&1 1>/dev/null && return
    echo "source '$LIB'" >> "$_shellrc"
}

_main() {
    _check_dependencies
    _build
    _install
    _install_wrapper
}

_main $@
