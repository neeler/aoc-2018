import { Puzzle } from './Puzzle';
import { getNumbers } from '~/util/parsing';
import { sum, sumBy } from '~/util/arithmetic';

interface Node {
    children: Node[];
    metadata: number[];
}

export const puzzle8 = new Puzzle({
    day: 8,
    parseInput: (fileData) => {
        const numbers = getNumbers(fileData);
        const tree = buildTree(numbers);
        return {
            numbers,
            tree,
        };
    },
    part1: ({ tree }) => {
        const sumMetadata = (node: Node): number => {
            return (
                sum(node.metadata) +
                sumBy(node.children, (child) => sumMetadata(child))
            );
        };
        return sumMetadata(tree);
    },
    part2: ({ tree }) => {
        const valueOfNode = (node: Node): number => {
            if (node.children.length === 0) {
                return sum(node.metadata);
            }
            return sumBy(node.metadata, (index) => {
                if (index < 1 || index > node.children.length) {
                    return 0;
                }
                return valueOfNode(node.children[index - 1]!);
            });
        };
        return valueOfNode(tree);
    },
});

function buildTree(numbers: number[]) {
    const { node: tree, remaining } = buildNode(numbers);
    if (remaining.length > 0) {
        throw new Error('Invalid input');
    }
    return tree;
}

function buildNode(numbers: number[]): {
    node: Node;
    remaining: number[];
} {
    if (numbers.length < 2) {
        throw new Error(`Invalid input: ${numbers}`);
    }
    const nChildren = numbers[0]!;
    const nMetadata = numbers[1]!;
    const node: Node = {
        children: [],
        metadata: [],
    };
    let remaining = numbers.slice(2);
    if (remaining.length < nMetadata) {
        throw new Error(`Invalid input: ${numbers}`);
    }
    if (remaining.length === nMetadata) {
        node.metadata.push(...remaining);
        return {
            node,
            remaining: [],
        };
    }
    while (node.children.length < nChildren) {
        const { node: child, remaining: nextRemaining } = buildNode(remaining);
        node.children.push(child);
        remaining = nextRemaining;
    }
    node.metadata = remaining.slice(0, nMetadata);
    return {
        node,
        remaining: remaining.slice(nMetadata),
    };
}
