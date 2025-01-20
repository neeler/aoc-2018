import { Puzzle } from './Puzzle';
import {
    Grid,
    GridCoordinate,
    GridCoordinateSet,
    GridNode,
} from '~/types/grid';
import { Maze, MazeNode } from '~/types/Maze';
import { sumOf } from '~/util/iterables';

export const puzzle15 = new Puzzle({
    day: 15,
    parseInput: (fileData) => {
        return fileData;
    },
    part1: (fileData) => {
        const battlefield = new Battlefield({
            fileData,
        });
        battlefield.battle();
        return battlefield.combatScore;
    },
    part2: (fileData) => {
        let elfPower = 4;
        while (true) {
            const battlefield = new Battlefield({
                fileData,
                elfPower,
            });
            battlefield.battle();
            if (battlefield.isTotalElfVictory) {
                return battlefield.combatScore;
            }
            elfPower++;
        }
    },
});

class Player {
    readonly type: 'G' | 'E';
    position: GridCoordinate;
    positionKey: string;
    readonly positionToPlayer: Map<string, Player>;
    readonly maze: Maze;
    readonly players: Set<Player>;
    readonly attackPower: number;
    hitPoints = 200;

    constructor({
        type,
        position,
        positionToPlayer,
        maze,
        players,
        attackPower,
    }: {
        type: 'G' | 'E';
        position: GridCoordinate;
        positionToPlayer: Map<string, Player>;
        maze: Maze;
        players: Set<Player>;
        attackPower: number;
    }) {
        this.type = type;
        this.position = position;
        this.positionKey = GridNode.getKey(position);
        this.positionToPlayer = positionToPlayer;
        this.maze = maze;
        this.players = players;
        this.attackPower = attackPower;
    }

    move() {
        let nearestPositions: GridCoordinate[] = [];
        let lowestDistance = Infinity;

        for (const position of this.positionsInRange) {
            const distance = this.maze.score({
                start: this.position,
                end: position,
                isObstacle: (node) => this.positionToPlayer.has(node.posKey),
            });
            if (distance === Infinity || distance > lowestDistance) {
                continue;
            }
            if (distance === lowestDistance) {
                nearestPositions.push(position);
            } else {
                lowestDistance = distance;
                nearestPositions = [position];
            }
        }

        const targetPosition = sortPositions(nearestPositions)[0];
        if (!targetPosition) {
            return;
        }

        if (lowestDistance === 1) {
            this.moveTo(targetPosition);
            return;
        }

        const adjacentNodes = this.maze.getOrthogonalNeighbors(this.position);
        const possibleMoves: MazeNode[] = [];

        this.maze.score({
            start: targetPosition,
            end: this.position,
            isObstacle: (node) => this.positionToPlayer.has(node.posKey),
            resetAfter: false,
        });

        for (const node of adjacentNodes) {
            const distance = node.data.bestScore;
            if (distance === lowestDistance - 1) {
                possibleMoves.push(node);
            }
        }

        this.maze.resetScores();

        const positionToMoveTo = sortPositions(possibleMoves)[0];
        if (positionToMoveTo) {
            this.moveTo(positionToMoveTo);
        }
    }

    private moveTo(newPosition: GridCoordinate) {
        this.positionToPlayer.delete(this.positionKey);
        this.position = newPosition;
        this.positionKey = GridNode.getKey(this.position);
        this.positionToPlayer.set(this.positionKey, this);
    }

    hasTargets() {
        for (const player of this.players) {
            if (player.type !== this.type) {
                return true;
            }
        }
        return false;
    }

    getEnemyInRange() {
        const adjacentNodes = this.maze.getOrthogonalNeighbors(this.position);
        let enemies: Player[] = [];
        let lowestHitPoints = Infinity;

        adjacentNodes.forEach((node) => {
            const player = this.positionToPlayer.get(node.posKey);
            if (player && player.type !== this.type) {
                if (player.hitPoints < lowestHitPoints) {
                    lowestHitPoints = player.hitPoints;
                    enemies = [player];
                } else if (player.hitPoints === lowestHitPoints) {
                    enemies.push(player);
                }
            }
        });

        return sortPlayers(enemies)[0];
    }

    private get positionsInRange() {
        const positions = new GridCoordinateSet();
        for (const player of this.players) {
            if (player.type !== this.type) {
                const adjacentNodes = this.maze.getOrthogonalNeighbors(
                    player.position,
                );
                for (const node of adjacentNodes) {
                    if (
                        !node.data.obstacle &&
                        !this.positionToPlayer.has(node.posKey)
                    ) {
                        positions.add(node);
                    }
                }
            }
        }
        return positions.values();
    }
}

class Battlefield {
    readonly maze: Maze;
    readonly players: Set<Player>;
    readonly positionToPlayer: Map<string, Player>;
    readonly nElves: number;
    round = 0;
    battled = false;

    constructor({
        fileData,
        elfPower = 3,
    }: {
        fileData: string;
        elfPower?: number;
    }) {
        const { maze } = Maze.fromMazeString(fileData.replace(/[GE]/g, '.'));
        const grid = Grid.fromString(fileData);
        const players = new Set<Player>();
        const positionToPlayer = new Map<string, Player>();
        let nElves = 0;
        grid.forEach((node) => {
            if (node.data === 'G' || node.data === 'E') {
                const player = new Player({
                    type: node.data,
                    position: { row: node.row, col: node.col },
                    positionToPlayer,
                    maze,
                    players,
                    attackPower: node.data === 'E' ? elfPower : 3,
                });
                players.add(player);
                positionToPlayer.set(player.positionKey, player);
                if (player.type === 'E') {
                    nElves++;
                }
            }
        });

        this.players = players;
        this.positionToPlayer = positionToPlayer;
        this.maze = maze;
        this.nElves = nElves;
    }

    battle() {
        while (true) {
            const playerOrder = sortPlayers(this.players);

            for (const player of playerOrder) {
                if (!this.players.has(player)) {
                    continue;
                }
                if (!player.hasTargets()) {
                    this.battled = true;
                    return;
                }
                let enemy = player.getEnemyInRange();
                if (!enemy) {
                    player.move();
                }
                enemy = enemy ?? player.getEnemyInRange();
                if (enemy) {
                    enemy.hitPoints -= player.attackPower;
                    if (enemy.hitPoints <= 0) {
                        this.positionToPlayer.delete(enemy.positionKey);
                        this.players.delete(enemy);
                    }
                }
            }
            this.round++;
        }
    }

    get combatScore() {
        if (!this.battled) {
            throw new Error('Battle has not been fought yet');
        }
        return this.round * sumOf(this.players, (player) => player.hitPoints);
    }

    get isTotalElfVictory() {
        if (!this.battled) {
            throw new Error('Battle has not been fought yet');
        }
        return (
            this.players.size === this.nElves &&
            this.players.values().next().value!.type === 'E'
        );
    }
}

function sortPlayers(players: Iterable<Player>) {
    return Array.from(players).sort((a, b) => {
        if (a.position.row !== b.position.row) {
            return a.position.row - b.position.row;
        }
        return a.position.col - b.position.col;
    });
}

function sortPositions(positions: Iterable<GridCoordinate>) {
    return Array.from(positions).sort((a, b) => {
        if (a.row !== b.row) {
            return a.row - b.row;
        }
        return a.col - b.col;
    });
}
