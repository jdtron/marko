import z from 'zod';
import config from './config';
import { existsSync } from 'fs';
import type { WriteStream } from 'tty';

class BookmarkManager {
    private bookmarks: string[] = [];

    async load() {
        try {
            const raw = await Bun.file(config.MARKO_BOOKMARKS_FILE).json();
            this.bookmarks = z.string().array().parse(raw);
        } catch {
            this.bookmarks = [];
        }

        this.cleanup();
        return this;
    }

    getBookmarks() {
        return this.bookmarks;
    }

    async add(bookmark: string) {
        if (this.has(bookmark)) {
            return;
        }

        const path = getFsPath(bookmark);
        if (!existsSync(path)) {
            throw new Error(`File ${path} does not exist`);
        }

        this.bookmarks.push(getNicePath(bookmark));
        await this.store();
    }

    has(bookmark: string) {
        return this.bookmarks.some(
            (b) => b == getNicePath(bookmark) || b == getFsPath(bookmark),
        );
    }

    async remove(bookmark: string) {
        bookmark = getNicePath(bookmark);

        this.bookmarks = this.bookmarks.filter((b) => b != bookmark);
        await this.store();
    }

    filter(q: string) {
        return this.bookmarks.filter((bookmark) =>
            bookmark.toLowerCase().includes(q),
        );
    }

    cleanup() {
        this.bookmarks = this.bookmarks.filter((bookmark) => {
            const path = getFsPath(bookmark);
            return existsSync(path);
        });

        return this;
    }

    async store() {
        await Bun.file(config.MARKO_BOOKMARKS_FILE).write(
            JSON.stringify(this.bookmarks, null, 2),
        );
    }
}

export function getNicePath(path: string) {
    return path.replace(config.HOME, '~');
}

export function getFsPath(path: string) {
    return path.replace('~', config.HOME);
}

export const bookmarkManager = await new BookmarkManager().load();

export function clearScreen(str: WriteStream) {
    str.write('\x1Bc');
}
