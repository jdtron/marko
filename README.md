# Marko
Manage bookmarks in your terminal.  

## Using the tools you already have
Marko is written entirely in bash-script and is using [fzf](https://github.com/junegunn/fzf).  
It uses the tools that most users already have installed and are familiar with.

## Installation
There's a Makefile for your convenience. Simply hit `make install` and you're done.  
For your shell integration, there a are targets for your shell, as well.

Currently supported shells are:
- zsh
- bash

## Integrate with tmux
To install marko with [tpm](https://github.com/tmux-plugins/tpm), simply add this to your tmux configuration:
```
set -g @plugin 'jdtron/marko'
set -g @marko-key 'M'
```

If you already have a running session, press `prefix + I` to install the plugin.
