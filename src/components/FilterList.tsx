import { Box, Spacer, Text, useCursor, useInput, type Key } from "ink";
import { useEffect, useState } from "react";
import type { InspectColorForeground } from "util";
import { Help } from "./Help";

interface Props {
    title?: string;
    subTitle?: string;
    marginTop?: number;
    items: string[];
    titleColor?: InspectColorForeground;
    help?: Record<string, string>,
    onSelect?: (item: string) => void;
    onInput?: (input: string, key: Key) => boolean;
}


export const FilterList = ({ title, subTitle, items, titleColor, help: customHelp, onSelect, onInput }: Props) => {
    const height = process.stderr.rows;
    const width = process.stderr.columns;
    const pageSize = height - 5;
    const help = {
        '↑↓': 'Move',
        '↲': 'Select',
        ...(customHelp ?? {}),
    };
    const { setCursorPosition } = useCursor();

    const filterItems = (items: string[], filter: string) =>
        items.filter((item) => item.toLowerCase().includes(filter.toLowerCase()));

    const paginate = (items: string[], page: number) =>
        items.slice(page * pageSize, (page * pageSize) + pageSize);

    const selectNext = () => {
        const totalPages = filtered.length / pageSize;
        const nextSelected = selected + 1;
        const nextPage = page + 1;

        if (nextSelected < paginated.length) {
            setSelected((s) => s + 1);
        } else if (nextSelected >= paginated.length && nextPage < totalPages) {
            setSelected(0);
            setPage((p) => p + 1);
        }
    }

    const selectPrev = () => {
        const prevSelected = selected - 1;
        const prevPage = page - 1;

        if (prevSelected >= 0) {
            setSelected((s) => s - 1);
        } else if (prevSelected < 0 && prevPage >= 0) {
            setPage(prevPage);
            setSelected(paginated.length - 1);
        }
    }

    const pageDown = () => {
        const totalPages = filtered.length / pageSize;
        const nextPage = page + 1;

        if (nextPage < totalPages) {
            setPage((p) => p + 1);
            setSelected(0);
        }
    }

    const pageUp = () => {
        const prevPage = page - 1;

        if (prevPage >= 0) {
            setPage(prevPage);
            setSelected(0);
        }
    }

    const [filter, setFilter] = useState('');
    const [filtered, setFiltered] = useState(filterItems(items, filter));
    const [page, setPage] = useState(0);
    const [paginated, setPaginated] = useState(paginate(filtered, page));
    const [selected, setSelected] = useState(0);

    useInput((input, key) => {
        if (key.delete || key.backspace) {
            setFilter((f) => f.substring(0, f.length - 1));
        } else if (key.ctrl && input == 'u') {
            setFilter('');
        } else if (key.downArrow || input == 'J') {
            selectNext();
        } else if (key.upArrow || input == 'K') {
            selectPrev();
        } else if (key.pageDown || input == 'D') {
            pageDown();
        } else if (key.pageUp || input == 'U') {
            pageUp();
        } else if (key.return) {
            const item = paginated[selected];
            if (item) {
                onSelect?.(item);
            }
        } else {
            if (!onInput || !onInput(input, key)) {
                setFilter((f) => f + input.toLowerCase());
            }
        }
    });

    setCursorPosition({
        x: filter.length + 3,
        y: 1,
    });

    useEffect(() => {
        setFiltered(filterItems(items, filter));
    }, [filter])

    useEffect(() => {
        setPaginated(paginate(filtered, page));
    }, [filtered, page])

    useEffect(() => {
        if (paginated.length == 0) {
            setSelected(0);
        } else if (selected >= paginated.length) {
            setSelected(paginated.length - 1);
        }
    }, [paginated]);

    return <>
        {title && (
            <Box justifyContent="center">
                <Text color={titleColor ?? 'blueBright'}>{title}</Text>
            </Box>
        )}

        <Box marginX={1} borderLeft={false} borderTop={false} borderRight={false} borderStyle="single" borderColor="gray">
            <Text color="magenta" bold={true}>&gt; </Text><Text>{filter}</Text>
            {subTitle && (filter.length + subTitle.length < width - 4) && <>
                <Spacer />
                <Text color="gray">{subTitle}</Text>
            </>}
        </Box>

        <Box flexDirection="column" marginX={1}>
            {paginated.map((item, idx) => {
                const isSelected = selected == idx;

                return <Box key={`${item}-${idx}`} backgroundColor={isSelected ? 'gray' : undefined}>
                    <Text bold={isSelected}>{item}</Text>
                </Box>
            })}
        </Box>

        <Box marginTop={height - paginated.length - 5} marginX={1}>
            <Text color="blueBright">{page + 1}/{Math.ceil(filtered.length / pageSize)}</Text>
            <Spacer />
            <Help type="inline" keys={help} />
        </Box>
    </>
}
