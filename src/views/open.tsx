import { render, useApp  } from "ink";
import { bookmarkManager, clearScreen, getFsPath } from "../marko";
import { createWriteStream, statSync } from 'fs';
import { FilterList } from "../components/FilterList";
import { useState } from "react";
import { Add } from "./add";
import { Delete } from "./remove";
import { Help } from "../components/Help";
import { exec, execSync } from "child_process";
import macros from "../macros";
import config from "../config";

interface Props {
    onSelect: (selected: string) => void;
}

const Open = ({ onSelect }: Props) => {
    const bookmarks = bookmarkManager.getBookmarks();
    const [view, setView] = useState<'open' | 'add' | 'delete' | 'help'>('open');
    const shortHelp = {
        'A': 'Add',
        'R': 'Remove',
        '?': 'Help',
    };
    const fullHelp = {
        ...shortHelp,
        'J': 'Down',
        'K': 'Up',
        'D': 'Page down',
        'U': 'Page up',
    };
    const { exit } = useApp();

    const handleSelect = (item: string) => {
        onSelect(item);
        exit(0);
    }

    const onOpenInput = (input: string) => {
        if (input == 'A') {
            setView('add');
            return true;
        } else if (input == 'R') {
            setView('delete');
            return true;
        } else if (input == '?') {
            setView('help');
            return true;
        }

        return false;
    }

    const onHelpQuit = () => setView('open');

    switch (view) {
        default:
        case 'open':
            return <FilterList
                items={bookmarks}
                title="Select Bookmark"
                help={shortHelp}
                onSelect={handleSelect}
                onInput={onOpenInput}
            />
        case 'add':
            return <Add cwd={process.cwd()} onEsc={() => setView('open')} />
        case 'delete':
            return <Delete onEsc={() => setView('open')} />
        case 'help':
            return <Help type="list" keys={fullHelp} onQuit={onHelpQuit} />
    }
}

export async function open({ tmux, tmuxPopup }: { tmux?: boolean, tmuxPopup?: boolean }) {
    if (tmux && config.TMUX) {
        openTmux();
    } else {
        await openDefault(tmuxPopup ?? false);
    }
}

async function openDefault(tmux: boolean) {
    let selected: string | undefined;
    const handleSelect = (bookmark: string) => selected = bookmark;

    const ttyStream = createWriteStream('/dev/tty') as unknown as NodeJS.WriteStream;
    clearScreen(ttyStream);

    const { waitUntilExit } = render(<Open onSelect={handleSelect} />, {
        stdout: ttyStream,
        stderr: process.stderr,
        stdin: process.stdin,
    });

    await waitUntilExit();
    if (!selected) {
        process.exit(0);
    }

    if (tmux && config.TMUX) {
        handleTmuxSelection(getFsPath(selected));
    } else {
        console.log(getFsPath(selected));
    }
}

function openTmux() {
    execSync(`tmux display-popup -E '${macros.executableName} --tmux-popup'`);
}

function handleTmuxSelection(selected: string) {
    if (statSync(selected).isFile()) {
        exec(`tmux new-window '${config.EDITOR} ${selected}'`)
    } else {
        exec(`tmux new-window -c '${selected}'`)
    }
}
