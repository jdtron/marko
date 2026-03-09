import { bookmarkManager } from '../marko';
import { Box, Text, useApp, useInput, type Key } from 'ink';
import { useState } from 'react';
import { FilterList } from '../components/FilterList';

interface ConfirmProps {
    bookmark: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmRemove = ({ bookmark, onConfirm, onCancel }: ConfirmProps) => {
    const [confirmed, setConfirmed] = useState(false);

    useInput((input, key) => {
        if (key.rightArrow || input == 'l') {
            setConfirmed(true);
        } else if (key.leftArrow || input == 'h') {
            setConfirmed(false);
        } else if (key.return) {
            if (confirmed) {
                onConfirm();
            } else {
                onCancel();
            }
        }
    })

    return <>
        <Text>Really delete {bookmark}?</Text>

        <Box flexDirection='row'>
            <Box paddingX={1} borderStyle="single" borderColor={!confirmed ? 'magenta' : 'grey'}>
                <Text color={!confirmed ? 'magenta' : 'grey'}>Cancel</Text>
            </Box>
            <Box paddingX={1} borderStyle="single" borderColor={confirmed ? 'magenta' : 'grey'}>
                <Text color={confirmed ? 'magenta' : 'grey'}>Yes</Text>
            </Box>
        </Box>
    </>
}

interface DeleteProps {
    onEsc?: () => void;
}

export const Delete = ({ onEsc }: DeleteProps) => {
    const bookmarks = bookmarkManager.getBookmarks();
    const { exit } = useApp();
    const [selected, setSelected] = useState<string | undefined>();
    const help = onEsc
        ? { 'Esc': 'Cancel' }
        : undefined;

    const onConfirmed = () => {
        if (!selected) return;

        bookmarkManager.remove(selected);
        exit(0)
    }

    const onInput = (_input: string, key: Key) => {
        if (onEsc && key.escape) {
            onEsc();
            return true;
        }

        return false;
    }

    const onCancel = () => {
        exit(0);
    }

    return <>
        {
            selected
                ? <ConfirmRemove bookmark={selected} onConfirm={onConfirmed} onCancel={onCancel} />
                : <FilterList
                    items={bookmarks}
                    title="Remove Bookmark"
                    titleColor='redBright'
                    onSelect={setSelected}
                    onInput={onInput}
                    help={help}
                />
        }
    </>
}
