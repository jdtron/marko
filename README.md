# Marko

Bookmark files and directories in your terminal.

⚠️ This repository conains alpha software. Expect breaking changes, or it suddenly falling apart.

## Prerequisites

To build and run, you'll need [Bun](https://bun.sh/) installed on your system.  
Optional [just](https://github.com/casey/just) for easy build & installation.

## Installation

Install dependencies with `bun ci`.  
ℹ️ After installation is done, make sure to reload your shell for the wrapper to work properly.

### With Just

Run `just install`, to build the project and install executables.  

### Manual

**1. Marko TUI**
Run `bun run build` to output the executable in `dist/`.  
From here, copy the executable to anywhere in your PATH (recommended `~/.local/bin/marko-tui`).

**2. Shell Wrapper**
Copy the shell wrapper `src/marko.sh` (recommended to `~/.local/lib/marko.sh`).  
Make sure to source this file in your shell rc.

## Roadmap
- [X] tmux support
- [ ] tmux plugin for tpm
