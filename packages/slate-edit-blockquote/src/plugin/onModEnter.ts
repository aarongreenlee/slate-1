import { Block, Change, Text } from '@gitbook/slate';
import Options from '../options';
import { getCurrentBlockquote } from '../utils';

/*
 * User pressed Mod+Enter in an editor
 * Exit the current block and inserts a paragraph after it
 */

function onModEnter(
    opts: Options,
    event: any,
    change: Change
): Change | undefined {
    const { value } = change;

    const blockquote = getCurrentBlockquote(opts, value);

    if (!blockquote) {
        return undefined;
    }

    event.preventDefault();

    const exitBlock = Block.create({
        type: opts.exitBlockType,
        nodes: [Text.create('')]
    });

    const parent = value.document.getParent(blockquote.key);
    const index = parent.nodes.findIndex(child => child.key === blockquote.key);

    return change
        .insertNodeByKey(parent.key, index + 1, exitBlock)
        .collapseToStartOf(exitBlock);
}

export default onModEnter;
