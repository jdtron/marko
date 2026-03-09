import z from 'zod';
import path from 'path';
import macros from './macros';

const schema = z.object({
    HOME: z.string(),
    EDITOR: z.string().default('vi'),
    TMUX: z.string().optional(),
    MARKO_BOOKMARKS_FILE: z
        .string()
        .default(
            path.join(
                Bun.env.HOME!,
                '.local',
                'share',
                macros.appName,
                'bookmarks.json',
            ),
        ),
});

export default schema.parse(Bun.env);
