import { Puzzle } from './Puzzle';
import { getNumbers, splitFilter } from '~/util/parsing';
import { Directions, Grid, GridNode } from '~/types/grid';
import { Queue, Stack } from '~/types/queues';

export const puzzle17 = new Puzzle({
    day: 17,
    parseInput: (fileData) => {
        const clayData = splitFilter(fileData).map((line): Bounds => {
            const coordinateData = line.split(', ');
            let minX = Infinity;
            let maxX = -Infinity;
            let minY = Infinity;
            let maxY = -Infinity;
            for (const datum of coordinateData) {
                const [axis, range] = datum.split('=') as [string, string];
                const rangeBounds = getNumbers(range);
                const start = rangeBounds[0]!;
                const end = rangeBounds[1] ?? start;
                if (axis === 'x') {
                    minX = Math.min(minX, start);
                    maxX = Math.max(maxX, end);
                } else {
                    minY = Math.min(minY, start);
                    maxY = Math.max(maxY, end);
                }
            }
            return {
                minX,
                maxX,
                minY,
                maxY,
            };
        });

        const groundMap = new GroundMap({ clayData });
        return {
            groundMap,
        };
    },
    part1: ({ groundMap }) => {
        groundMap.fill();
        return groundMap.grid.filter(
            (node) => node.data.hasWater && groundMap.inBounds(node),
        ).length;
    },
    part2: ({ groundMap }) => {
        groundMap.fill();
        return groundMap.grid.filter(
            (node) =>
                node.data.hasWater &&
                !node.data.isFlowing &&
                groundMap.inBounds(node),
        ).length;
    },
});

interface XY {
    x: number;
    y: number;
}

interface Bounds {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}

class Ground {
    readonly x: number;
    readonly y: number;
    isClay = false;
    isSpring = false;
    isFlowing = false;
    hasWater = false;

    constructor({ x, y }: XY) {
        this.x = x;
        this.y = y;
    }

    get isBarrier() {
        return this.isClay || this.hasWater;
    }

    toString() {
        if (this.isSpring) {
            return '+';
        }
        if (this.isClay) {
            return '#';
        }
        if (this.hasWater) {
            return this.isFlowing ? '|' : '~';
        }
        return '.';
    }
}

class GroundMap {
    readonly grid: Grid<Ground>;
    readonly minX: number;
    readonly minY: number;
    readonly spring: GridNode<Ground>;
    readonly countingBounds: Bounds;

    constructor({ clayData }: { clayData: Bounds[] }) {
        const overallMinX =
            Math.min(500, ...clayData.map((data) => data.minX)) - 1;
        const overallMaxX =
            Math.max(500, ...clayData.map((data) => data.maxX)) + 1;
        const overallMinY = Math.min(...clayData.map((data) => data.minY));
        const overallMaxY = Math.max(...clayData.map((data) => data.maxY));
        const width = overallMaxX - overallMinX + 1;
        const height = overallMaxY + 1;

        this.countingBounds = {
            minX: overallMinX,
            maxX: overallMaxX,
            minY: overallMinY,
            maxY: overallMaxY,
        };

        this.minX = overallMinX;
        this.minY = 0;

        this.grid = new Grid<Ground>({
            width,
            height,
            defaultValue: ({ row, col }) =>
                new Ground({
                    x: col + this.minX,
                    y: row + this.minY,
                }),
            drawFn: (node) => node.data.toString(),
        });
        clayData.forEach(({ minX, maxX, minY, maxY }) => {
            for (let x = minX; x <= maxX; x++) {
                for (let y = minY; y <= maxY; y++) {
                    const node = this.getXY({ x, y });
                    if (!node) {
                        throw new Error(`Node not found at (${x}, ${y})`);
                    }
                    node.data.isClay = true;
                }
            }
        });
        this.spring = this.getXY({ x: 500, y: 0 })!;
        this.spring.data.isSpring = true;
    }

    getXY({ x, y }: XY): GridNode<Ground> | undefined {
        return this.grid.get({ col: x - this.minX, row: y - this.minY });
    }

    draw() {
        this.grid.draw();
    }

    inBounds(node: GridNode<Ground>) {
        return (
            node.data.y >= this.countingBounds.minY &&
            node.data.y <= this.countingBounds.maxY &&
            node.data.x >= this.countingBounds.minX &&
            node.data.x <= this.countingBounds.maxX
        );
    }

    isBoundedByClay(node: GridNode<Ground>) {
        let left = this.grid.getNeighbor(node, Directions.left);
        if (!left) {
            return false;
        }
        let leftBelow = this.grid.getNeighbor(left, Directions.down);
        while (
            left &&
            !left.data.isClay &&
            leftBelow &&
            leftBelow.data.isBarrier
        ) {
            left = this.grid.getNeighbor(left, Directions.left);
            leftBelow = left
                ? this.grid.getNeighbor(left, Directions.down)
                : undefined;
        }
        if (!left?.data.isClay || !leftBelow?.data.isBarrier) {
            return false;
        }
        let right = this.grid.getNeighbor(node, Directions.right);
        if (!right) {
            return false;
        }
        let rightBelow = this.grid.getNeighbor(right, Directions.down);
        while (
            right &&
            !right.data.isClay &&
            rightBelow &&
            rightBelow.data.isBarrier
        ) {
            right = this.grid.getNeighbor(right, Directions.right);
            rightBelow = right
                ? this.grid.getNeighbor(right, Directions.down)
                : undefined;
        }
        return !!right?.data.isClay && !!rightBelow?.data.isBarrier;
    }

    fill() {
        const fallingQueue = new Queue<GridNode<Ground>>();
        fallingQueue.add(this.spring);
        fallingQueue.process((node) => {
            if (node.data.isBarrier) {
                return;
            }
            const fillingQueue = new Stack<GridNode<Ground>>();
            fillingQueue.add(node);
            node.data.hasWater = true;
            node.data.isFlowing = true;
            let below = this.grid.getNeighbor(node, Directions.down);
            while (below && !below.data.isBarrier) {
                fillingQueue.add(below);
                below.data.hasWater = true;
                below.data.isFlowing = true;
                below = this.grid.getNeighbor(below, Directions.down);
            }
            let hasLeftBound = false;
            let hasRightBound = false;
            if (below?.data.hasWater) {
                let left = this.grid.getNeighbor(below, Directions.left);
                while (left?.data.hasWater) {
                    left = this.grid.getNeighbor(left, Directions.left);
                }
                hasLeftBound = !!left?.data.isClay;
                let right = this.grid.getNeighbor(below, Directions.right);
                while (right?.data.hasWater) {
                    right = this.grid.getNeighbor(right, Directions.right);
                }
                hasRightBound = !!right?.data.isClay;
            }
            let foundOutlet =
                !below ||
                (!!below?.data.hasWater && (!hasLeftBound || !hasRightBound));

            fillingQueue.process((currentNode) => {
                if (foundOutlet) {
                    fillingQueue.reset();
                    return;
                }

                const hasBounds = this.isBoundedByClay(currentNode);

                if (hasBounds) {
                    currentNode.data.isFlowing = false;
                }

                let left = this.grid.getNeighbor(currentNode, Directions.left);
                while (left && !left.data.isClay) {
                    const leftBelow = this.grid.getNeighbor(
                        left,
                        Directions.down,
                    );
                    if (!leftBelow) {
                        left.data.hasWater = true;
                        left.data.isFlowing = !hasBounds;
                        break;
                    }
                    if (leftBelow.data.isBarrier) {
                        left.data.hasWater = true;
                        left.data.isFlowing = !hasBounds;
                        left = this.grid.getNeighbor(left, Directions.left);
                    } else {
                        fallingQueue.add(left);
                        foundOutlet = true;
                        break;
                    }
                }
                let right = this.grid.getNeighbor(
                    currentNode,
                    Directions.right,
                );
                while (right && !right.data.isClay) {
                    const rightBelow = this.grid.getNeighbor(
                        right,
                        Directions.down,
                    );
                    if (!rightBelow) {
                        right.data.hasWater = true;
                        right.data.isFlowing = !hasBounds;
                        break;
                    }
                    if (rightBelow.data.isBarrier) {
                        right.data.hasWater = true;
                        right.data.isFlowing = !hasBounds;
                        right = this.grid.getNeighbor(right, Directions.right);
                    } else {
                        fallingQueue.add(right);
                        foundOutlet = true;
                        break;
                    }
                }

                if (!foundOutlet) {
                    let above = this.grid.getNeighbor(
                        currentNode,
                        Directions.up,
                    );
                    if (above) {
                        fallingQueue.add(above);
                    }
                }
            });
        });
    }
}
