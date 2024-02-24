m() {
    local selected="$(marko -E)"
    [ -z "$selected" ] && return 1
    eval "$selected"
}
