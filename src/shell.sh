
marko() {
    local selected
    selected=$( marko-tui )
    [ -z "$selected" ] && return 0

    if [ -f "$selected" ]; then
        "$EDITOR" "$selected"
    elif [ -d "$selected" ]; then
        cd "$selected"
    fi
}

