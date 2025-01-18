#!/bin/env bash

BIN_NAME='marko'
BOOKMARKS_FILE="${XDG_DATA_HOME:-$HOME/.local/share}/$BIN_NAME/bookmarks"
DEPENDENCIES=(fzf)
FZF_CMD="fzf --reverse --border rounded"

eval_mode=0
confirmation_enabled=1
fzf_args=''
no_browse=false

check_deps() {
    for d in "${DEPENDENCIES[@]}"; do
        ! command -v "$d" >/dev/null && echo "Unmet dependency: $d" && return 1
    done

    return 0
}

ensure_state() {
    [ -f "$BOOKMARKS_FILE" ] && return 0
    mkdir -p "$(dirname "$BOOKMARKS_FILE")"
    touch "$BOOKMARKS_FILE"
}

usage() {
    echo "$BIN_NAME - a terminal bookmark manager"
    echo
    echo "USAGE: $BIN_NAME [OPTION] [ARGUMENTS]"
    echo '  Execution with no arguments will launch in interactive mode'
    echo
    echo 'OPTIONS'
    echo '  -h          Print this help message'
    echo '  -a          Add bookmark'
    echo '  -d          Delete bookmark'
    echo '  -E          Evaluation mode (see below)'
    echo '  -t          Open in tmux popup'
    echo '  -n          Disable browsing when selecting a directory'
    echo
    echo 'EVALUATION MODE'
    echo "  When enabled, $BIN_NAME outputs instructions to be evaluated"
    echo '  by a shell, instead of the selected path.'
    echo '  This is useful to integrate as a shell shortcut, for example.'
}

normalize_path() {
    local path="$1"

    [ -d "$path" ] && path="$path/"
    path="${path/$HOME/\~}"

    echo "$path"
}

abs_path() {
    local path="${1/\~/$HOME}"
    readlink -f "$path" && return 0
    return 1
}

any_bookmarks() {
    local count=

    count="$(xargs -I {} echo {} <"$BOOKMARKS_FILE" | wc -l)"
    [ "$count" -gt 0 ] && return 0
}

has_bookmark() {
    local path="$1"

    grep -e "^$path$" "$BOOKMARKS_FILE" >/dev/null && return 0
    return 1
}

add_bookmark() {
    local path=

    path="$(readlink -f "$1")"
    path="$(normalize_path "$path")"

    has_bookmark "$path" && echo "Already a bookmark: $path" && return 1

    echo "$path" >> "$BOOKMARKS_FILE" || return 1
    echo "✅ Added $path to your bookmarks"
}

add_bookmark_interactive() {
    local start="$1"
    local path=

    path="$(browse "${1:-$PWD}" 'Add bookmark')"
    [ -z "$path" ] && return 0

    add_bookmark "$path"
}

confirm_delete() {
    local prompt=
    local len=

    prompt='Really delete bookmark'
    len="$(wc -l <<<"$@")"
    [ "$len" -gt 1 ] && prompt="${prompt}s?" || prompt="$prompt $1?"

    echo -e "no\nyes" | $FZF_CMD --no-sort --header "$prompt"
}

del_bookmark() {
    local path="$1"
    local backup_file=

    [ -z "$path" ] && path="$PWD"
    path="$(abs_path "$path")"
    path="$(normalize_path "$path")"

    ! has_bookmark "$path" && echo "Not a bookmark: $path" >&2 && exit 1

    [ "$confirmation_enabled" -eq 1 ] && confirmation="$(confirm_delete "$path")"
    [ "$confirmation_enabled" -eq 1 ] && [ -z "$confirmation" ] && return
    [ "$confirmation_enabled" -eq 1 ] && [ "${confirmation,,}" != 'yes' ] && return

    backup_file="$BOOKMARKS_FILE.bak"
    mv "$BOOKMARKS_FILE" "$backup_file"
    sed -r "s|^$path$||g" <"$backup_file" | xargs -I {} echo {} > "$BOOKMARKS_FILE" \
        && echo "✅ Removed $path from your bookmarks"
}

del_bookmark_interactive() {
    local path=
    local confirmation=

    path="$(list_bookmarks | $FZF_CMD -m)"
    [ -z "$path" ] && return 0

    confirmation="$(confirm_delete "$path")"
    [ -z "$confirmation" ] && return
    [ "${confirmation,,}" != 'yes' ] && return

    confirmation_enabled=0
    while read -r item; do
        [ -z "$item" ] && continue
        del_bookmark "$item"
    done <<<"$path"
}

sort_bookmarks() {
    local dirs=()
    local files=()

    while read -r bookmark; do
        local path="$(abs_path "$bookmark")"
        [ -z "$path" ] && continue
        [ -d "$path" ] && dirs+=("$path")
        [ -f "$path" ] && files+=("$path")
    done </dev/stdin

    for d in "${dirs[@]}"; do normalize_path "$d"; done
    for f in "${files[@]}"; do normalize_path "$f"; done
}

list_bookmarks() {
    xargs -I {} echo {} <"$BOOKMARKS_FILE" | sort | sort_bookmarks
}

get_editor() {
    command -v nvim vim nano emacs | grep -v 'alias' | head -n1 || return 1
    return 0
}

eval_selection() {
    local path="$1"

    path="$(abs_path "$path")"
    [ -d "$path" ] && echo "cd '$path'"
    [ -f "$path" ] && echo "${EDITOR:-$(get_editor)} '$path'"

    return 0
}

post_process() {
    local input=

    input="$(cat /dev/stdin)"
    [ -z "$input" ] && return 0

    local input_path="$( abs_path "$input" )"
    if [ $no_browse = false ] && [ -d "$input_path" ]; then
        input="$( browse "$input_path" )"
    fi

    [ "$eval_mode" -eq 1 ] \
        && eval_selection "$input" && return 0 \
        || echo "$input"
}

browse_list() {
    local path="$1"
    local header="$2"

    [ -n "$header" ] && header="$header > "
    {
        echo '.'
        echo '..'
        find "$path" -maxdepth 1 -type d -exec echo {}/ \; | sed "s|$path/||"
        find "$path" -maxdepth 1 -type f | sed "s|$path/||"
    } | xargs -I {} echo {} | $FZF_CMD --header "${header}${path}" | sed 's|/$||'
}

browse() {
    local start="$1"
    local header="$2"
    local path=

    path="$(browse_list "$start" "$header")"
    [ -z "$path" ] && return

    [ "$path" = '.' ] && echo "$start" && return 0
    [ "$path" = '..' ] && browse "$(dirname "$start")" "$header" && return 0

    path="$start/$path"
    [ -d "$path" ] && browse "$path" "$header" && return 0
    [ -f "$path" ] && echo "$path" && return 0

    # fallback
    browse "$start" "$header"
}


check_deps || exit 1
ensure_state

while getopts 'haA:dD:lEtn' opt 2>/dev/null; do
    case "$opt" in
        a) add_bookmark_interactive; exit $? ;;
        A) add_bookmark "$OPTARG"; exit $? ;;
        d) del_bookmark_interactive; exit $? ;;
        D) del_bookmark "$OPTARG"; exit $? ;;
        l) list_bookmarks; exit $? ;;
        E) eval_mode=1 ;;
        h) usage; exit 0 ;;
        t) fzf_args="$fzf_args --tmux" ;;
        n) no_browse=true ;;
        *)
            echo "Invalid option: $(eval echo \$"$OPTERR")"
            echo
            usage; exit 1
            ;;
    esac
done

list_bookmarks | $FZF_CMD \
    --header 'Add: alt-a | Del: alt-d' \
    --bind "alt-a:execute($BIN_NAME -a "$PWD")+reload($BIN_NAME -l)" \
    --bind "alt-d:execute($BIN_NAME -D {})+reload($BIN_NAME -l)" \
    $fzf_args \
    | post_process
