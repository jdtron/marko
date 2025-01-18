# Get tmux option
tmux_get_option() {
    local opt="$1"      # str
    local default="$2"  # str

    local value="$( tmux show-option -gqv "$opt" )"
    if [ -n "$value" ]; then
        echo "$value"
    else
        echo "$default"
    fi
}
