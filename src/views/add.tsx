import { useApp, type Key } from "ink"
import { useEffect, useState } from "react";
import fs from 'fs';
import path from 'path';
import { bookmarkManager, getNicePath } from "../marko";
import { FilterList } from "../components/FilterList";

const dirElements = ['.', '..'];

interface Props {
    cwd: string;
    onEsc?: () => void;
}

export const Add = ({ cwd: startDir, onEsc }: Props) => {
    const { exit } = useApp();
    const [cwd, setCwd] = useState(startDir);
    const [files, setFiles] = useState([...dirElements, ...listDir(cwd)]);
    const [displayCwd, setDisplayCwd] = useState(getNicePath(cwd));
    const help = onEsc
        ? { 'Esc': 'Cancel' }
        : undefined;

    const onSelect = (file: string) => {
        if (file == '.') {
            bookmarkManager.add(cwd);
            exit(0);
            return;
        }

        const filePath = path.join(cwd, file);
        if (fs.statSync(filePath).isFile()) {
            bookmarkManager.add(filePath);
            exit(0);
            return;
        }

        setCwd(filePath);
    }

    const getKey = (files: string[]) => {
        let hash = '';

        for (const file of files) {
            const fileHash  = String(Bun.hash(file));
            hash = String(Bun.hash(`${hash}${fileHash}`));
        }

        return hash;
    }

    useEffect(() => {
        setFiles([...dirElements, ...listDir(cwd)]);
        setDisplayCwd(getNicePath(cwd));
    }, [cwd])

    const onInput = (_input: string, key: Key) => {
        if (onEsc && key.escape) {
            onEsc();
            return true;
        }

        return false;
    }

    return <FilterList key={getKey(files)}
        items={files}
        title="Add Bookmark"
        titleColor="green"
        subTitle={displayCwd}
        onSelect={onSelect}
        onInput={onInput}
        help={help}
    />
}

function listDir(cwd: string) {
    return fs.readdirSync(cwd, { withFileTypes: true })
        .map((f) => f.isDirectory() ? `${f.name}/` : f.name)
}
