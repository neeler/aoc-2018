import { Puzzle } from './Puzzle';
import { splitFilter } from '~/util/parsing';
import {
    CharDirectionMap,
    ClockwiseRotation,
    CounterClockwiseRotation,
    Directions,
    Grid,
    GridNode,
    OrthogonalDirection,
    OrthogonalDirectionChar,
    OrthogonalDirectionsToChars,
} from '~/types/grid';

type CartTurn = 'left' | 'straight' | 'right';
type TrackType = '-' | '|' | '+' | '/' | '\\';

const CartToTrack = {
    [Directions.up]: '|',
    [Directions.down]: '|',
    [Directions.left]: '-',
    [Directions.right]: '-',
} as const;

class Cart {
    nextTurnIndex = 0;
    currentDirection: OrthogonalDirection;

    constructor(initial: string) {
        if (!Object.keys(CharDirectionMap).includes(initial)) {
            throw new Error(`Invalid initial cart direction: ${initial}`);
        }
        this.currentDirection =
            CharDirectionMap[initial as OrthogonalDirectionChar];
    }

    tick(track: TrackType) {
        switch (track) {
            case '+': {
                const nextTurn = Cart.turns[this.nextTurnIndex]!;
                switch (nextTurn) {
                    case 'left':
                        this.currentDirection =
                            CounterClockwiseRotation[this.currentDirection];
                        break;
                    case 'right':
                        this.currentDirection =
                            ClockwiseRotation[this.currentDirection];
                        break;
                    case 'straight':
                        break;
                }
                this.nextTurnIndex =
                    (this.nextTurnIndex + 1) % Cart.turns.length;
                break;
            }
            case '/': {
                this.currentDirection = {
                    [Directions.up]: Directions.right,
                    [Directions.down]: Directions.left,
                    [Directions.left]: Directions.down,
                    [Directions.right]: Directions.up,
                }[this.currentDirection];
                break;
            }
            case '\\': {
                this.currentDirection = {
                    [Directions.up]: Directions.left,
                    [Directions.down]: Directions.right,
                    [Directions.left]: Directions.up,
                    [Directions.right]: Directions.down,
                }[this.currentDirection];
                break;
            }
            case '|': {
                if (
                    !(
                        [
                            Directions.up,
                            Directions.down,
                        ] as OrthogonalDirection[]
                    ).includes(this.currentDirection)
                ) {
                    throw new Error(
                        `Invalid cart direction ${this.currentDirection} for | track`,
                    );
                }
                break;
            }
            case '-': {
                if (
                    !(
                        [
                            Directions.left,
                            Directions.right,
                        ] as OrthogonalDirection[]
                    ).includes(this.currentDirection)
                ) {
                    throw new Error(
                        `Invalid cart direction ${this.currentDirection} for | track`,
                    );
                }
                break;
            }
        }
    }

    static turns: CartTurn[] = ['left', 'straight', 'right'];
}

class NodeData {
    initial: string;
    trackType?: TrackType;
    isTrack: boolean;
    isIntersection: boolean;
    carts: Set<Cart> = new Set<Cart>();

    constructor(initial: string) {
        this.initial = initial;
        this.isTrack = initial !== ' ';
        this.isIntersection = initial === '+';
        let cart: Cart | undefined;
        if (Object.keys(CharDirectionMap).includes(initial)) {
            cart = new Cart(initial);
            this.addCart(cart);
        }
        if (this.isTrack) {
            if (cart) {
                this.trackType = CartToTrack[cart.currentDirection];
            } else {
                this.trackType = initial as TrackType;
            }
        }
    }

    addCart(cart: Cart) {
        if (!this.isTrack) {
            throw new Error('Cannot add cart to non-track node');
        }
        this.carts.add(cart);
    }

    removeCart(cart: Cart) {
        this.carts.delete(cart);
    }

    hasCollision() {
        return this.carts.size > 1;
    }

    toString() {
        if (this.hasCollision()) {
            return 'X';
        }
        if (this.carts.size === 1) {
            return OrthogonalDirectionsToChars[
                Array.from(this.carts)[0]!.currentDirection
            ];
        }
        return this.trackType ?? ' ';
    }
}

export const puzzle13 = new Puzzle({
    day: 13,
    trimInput: false,
    parseInput: (fileData) => {
        const lines = splitFilter(fileData);
        const maxLineLength = Math.max(...lines.map((line) => line.length));
        return Grid.from2DArrayCustom<string, NodeData>(
            lines.map((line) => line.padEnd(maxLineLength).split('')),
            {
                drawFn: (node) => node.data.toString(),
                dataFn: ({ input }) => new NodeData(input),
            },
        );
    },
    part1: (grid) => {
        let firstCollision: string | undefined;
        runTicks({
            grid,
            onCollision: ({ node }) => {
                firstCollision = `${node.col},${node.row}`;
            },
            onTickEnd: () => {
                return !firstCollision;
            },
        });
        return firstCollision;
    },
    part2: (grid) => {
        let finalNode: GridNode<NodeData> | undefined;
        runTicks({
            grid,
            onCollision: ({ node, livingCarts }) => {
                for (const deadCart of node.data.carts) {
                    livingCarts.delete(deadCart);
                }
                node.data.carts.clear();
            },
            onTickEnd: ({ livingCarts, nodePerCart }) => {
                if (livingCarts.size === 1) {
                    finalNode = nodePerCart.get(Array.from(livingCarts)[0]!)!;
                    return false;
                }
                return true;
            },
        });
        return `${finalNode!.col},${finalNode!.row}`;
    },
});

function runTicks({
    grid,
    onCollision,
    onTickEnd,
}: {
    grid: Grid<NodeData>;
    onCollision: (data: {
        node: GridNode<NodeData>;
        livingCarts: Set<Cart>;
    }) => void;
    onTickEnd?: (data: {
        livingCarts: Set<Cart>;
        nodePerCart: Map<Cart, GridNode<NodeData>>;
    }) => boolean;
}) {
    const livingCarts = new Set<Cart>();
    const nodePerCart = new Map<Cart, GridNode<NodeData>>();
    grid.forEach((node) => {
        for (const cart of node.data.carts) {
            livingCarts.add(cart);
            nodePerCart.set(cart, node);
        }
    });
    while (true) {
        const cartsSeen = new Set<Cart>();
        const relevantNodes = new Set<GridNode<NodeData>>();
        for (const cart of livingCarts) {
            const node = nodePerCart.get(cart)!;
            relevantNodes.add(node);
        }
        const sortedNodes = Array.from(relevantNodes).sort((a, b) => {
            if (a.row !== b.row) {
                return a.row - b.row;
            }
            return a.col - b.col;
        });
        for (const node of sortedNodes) {
            for (const cart of node.data.carts) {
                if (livingCarts.has(cart) && !cartsSeen.has(cart)) {
                    cartsSeen.add(cart);
                    node.data.removeCart(cart);
                    const nextNode = grid.getNeighbor(
                        node,
                        cart.currentDirection,
                    );
                    if (!nextNode) {
                        throw new Error('Next node not found');
                    }
                    nextNode.data.addCart(cart);
                    nodePerCart.set(cart, nextNode);
                    if (nextNode.data.hasCollision()) {
                        onCollision({
                            node: nextNode,
                            livingCarts,
                        });
                        break;
                    }
                    cart.tick(nextNode.data.trackType!);
                }
            }
        }
        const shouldContinue =
            onTickEnd?.({ livingCarts, nodePerCart }) ?? true;
        if (!shouldContinue) {
            return;
        }
    }
}
