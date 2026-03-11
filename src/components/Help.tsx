import { Box, Text, useInput } from "ink";

interface Props {
    keys: Record<string, string>
}

type ListProps = Props & {
    onQuit?: () => void;
}

type HelpProps =
    | ({ type: 'inline' } & Props)
    | ({ type: 'list' } & ListProps)

const Inline = ({ keys }: Props) => {
    return <Box>
        {Object.entries(keys).map(
            ([keys, text], idx, all) => <Box key={`help-${keys}`}>
                <Text color="gray" bold={true}>{keys} </Text>
                <Text color="gray">{text}</Text>
                {idx < all.length - 1 && <Text color="gray"> · </Text>}
            </Box>
        )}
    </Box>
}

const List = ({ keys, onQuit }: ListProps) => {
    useInput((input) => {
        if (input == 'q') {
            onQuit?.();
        }
    })

    return <Box flexDirection="column">
        <Box justifyContent="center">
            <Text color="blue">Help</Text>
        </Box>
    
        {Object.entries({ ...keys, 'Q': 'Quit Help' }).map(
            ([keys, text]) => <Box>
                <Text bold={true}>{keys} </Text>
                <Text>{text}</Text>
            </Box>
        )}
    </Box>
}

export const Help = (props: HelpProps) => {
    switch (props.type) {
        case 'inline':
            return <Inline keys={props.keys} />
        case "list":
            return <List keys={props.keys} onQuit={props.onQuit} />
    }
}
