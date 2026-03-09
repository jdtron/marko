# https://just.systems

prefix := env('PREFIX', join(env('HOME'), '.local', 'bin'))
target := join(prefix, 'marko-tui')
lib := join(env('HOME'), '.local', 'lib', 'marko.sh')
sh := shell('basename $SHELL')

# List available recipes
@list:
    {{ just_executable() }} -l

# Build executable
@build:
    bun run build

# Clean build files
@clean:
    [ -d ./dist ] && rm -rf ./dist/ || :

# Install marko
@install: build && install-shell
    install -Dm755 ./dist/marko-tui {{ target }}

# Install shell wrapper
install-shell:
    #!/bin/sh
    mkdir -p $( dirname '{{ lib }}' )
    install -Dm744 ./src/shell.sh {{ lib }}
    if [ '{{ sh }}' = 'zsh' ]; then
        shellrc="$HOME/.zshrc"
    elif [ '{{ sh }}' = 'bash' ]; then
        shellrc="$HOME/.bashrc"
    else
        echo 'Unsupported shell' >&2
        exit 1
    fi
    grep '{{ lib }}' "$shellrc" >/dev/null && exit 0
    echo "source '{{ lib }}'" >> "$shellrc"
