import { Grid, GridCoordinate, GridNode } from 'src/types/grid';
import { Queue } from '~/types/queues';
import { parseStringBlock } from '~/util/parsing';

interface MazeNodeData {
    char?: string;
    obstacle: boolean;
    bestScore: number;
    isBestPath: boolean;
}

export type MazeNode = GridNode<MazeNodeData>;

export class Maze extends Grid<MazeNodeData> {
    hasScores = false;
    hasBestPath = false;

    constructor({ width, height }: { width: number; height: number }) {
        super({
            width,
            height,
            defaultValue: () => ({
                obstacle: false,
                bestScore: Infinity,
                isBestPath: false,
            }),
            drawFn: ({ data }) => {
                if (data.obstacle) {
                    return '#';
                }

                if (data.bestScore !== Infinity) {
                    return data.bestScore.toString().slice(-1);
                }

                if (data.char) {
                    return data.char;
                }

                return '.';
            },
        });
    }

    static fromMazeString(
        block: string,
        {
            obstacleChar = '#',
            startChar = 'S',
            endChar = 'E',
        }: {
            obstacleChar?: string;
            startChar?: string;
            endChar?: string;
        } = {},
    ) {
        const stringData = parseStringBlock(block);
        const height = stringData.length;
        const width = stringData[0]!.length;
        const maze = new Maze({
            width,
            height,
        });

        const obstacles: MazeNode[] = [];
        const nonObstacles: MazeNode[] = [];
        let start: MazeNode | undefined;
        let end: MazeNode | undefined;

        if (obstacleChar) {
            maze.forEach((node) => {
                if (node) {
                    const { row, col, data } = node;
                    data.char = stringData[row]?.[col];
                    data.obstacle = data.char === obstacleChar;
                    if (data.obstacle) {
                        obstacles.push(node);
                    } else {
                        nonObstacles.push(node);
                    }
                    if (data.char === startChar) {
                        start = node;
                    }
                    if (data.char === endChar) {
                        end = node;
                    }
                }
            });
        }

        return {
            maze,
            obstacles,
            nonObstacles,
            start,
            end,
        };
    }

    score({
        start: startCoord,
        end: endCoord,
        resetAfter = true,
        isObstacle,
    }: {
        start: GridCoordinate;
        end: GridCoordinate;
        resetAfter?: boolean;
        isObstacle?: (node: MazeNode) => boolean;
    }) {
        if (this.hasScores || this.hasBestPath) {
            this.resetScores();
        }

        const start = this.get(startCoord)!;
        const end = this.get(endCoord)!;

        const queue = new Queue<MazeNode>();
        start.data.bestScore = 0;
        queue.add(start);

        queue.process((node) => {
            if (node === end) {
                queue.reset();
                return;
            }

            const score = node.data.bestScore;
            const neighbors = this.getOrthogonalNeighbors(node);
            neighbors.forEach((neighbor) => {
                if (
                    neighbor.data.bestScore <= score + 1 ||
                    neighbor.data.obstacle ||
                    isObstacle?.(neighbor)
                ) {
                    return;
                }

                neighbor.data.bestScore = score + 1;

                queue.add(neighbor);
            });
        });

        const score = end.data.bestScore;

        if (resetAfter) {
            this.resetScores();
        } else {
            this.hasScores = true;
        }

        return score;
    }

    findBestPath({
        start: startCoord,
        end: endCoord,
    }: {
        start: GridCoordinate;
        end: GridCoordinate;
    }) {
        this.score({
            start: startCoord,
            end: endCoord,
            resetAfter: false,
        });
        const queue = new Queue<MazeNode>();
        queue.add(this.get(endCoord)!);
        queue.process((node) => {
            if (node === this.get(startCoord)) {
                queue.reset();
                return;
            }
            const neighbors = this.getOrthogonalNeighbors(node);
            const bestNeighbor = this.getOrthogonalNeighbors(node).reduce(
                (best, neighbor) => {
                    if (best && neighbor.data.bestScore < best.data.bestScore) {
                        return neighbor;
                    }
                    return best;
                },
                neighbors[0],
            );
            if (bestNeighbor) {
                bestNeighbor.data.isBestPath = true;
                queue.add(bestNeighbor);
            } else {
                queue.reset();
            }
        });
        this.hasBestPath = true;
    }

    resetScores() {
        this.forEach((node) => {
            if (node) {
                node.data.bestScore = Infinity;
            }
        });
        this.hasBestPath = false;
    }

    drawWithScores() {
        let longestScore = 0;
        this.forEach((node) => {
            if (node && node.data.bestScore !== Infinity) {
                const score = node.data.bestScore.toString();
                if (score.length > longestScore) {
                    longestScore = score.length;
                }
            }
        });
        const padding = longestScore + 1;
        this.draw((node) => {
            if (!node) {
                return ''.padEnd(padding, ' ');
            }
            if (node.data.bestScore === Infinity) {
                return '#'.repeat(longestScore).padEnd(padding, ' ');
            }
            return this.hasBestPath
                ? (node.data.isBestPath
                      ? node.data.bestScore.toString()
                      : '#'.repeat(longestScore)
                  ).padEnd(padding, ' ')
                : node.data.bestScore.toString().padEnd(padding, ' ');
        });
    }
}
