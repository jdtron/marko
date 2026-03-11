# https://just.systems

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
@install:
    ./scripts/install.sh
