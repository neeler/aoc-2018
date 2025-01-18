import { GridCoordinate } from '~/types/grid/GridCoordinate';

export const Directions = {
    up: 'up',
    down: 'down',
    left: 'left',
    right: 'right',
    upLeft: 'upLeft',
    upRight: 'upRight',
    downLeft: 'downLeft',
    downRight: 'downRight',
} as const;

export type Direction = keyof typeof Directions;

export const directions = [
    Directions.up,
    Directions.down,
    Directions.left,
    Directions.right,
    Directions.upLeft,
    Directions.upRight,
    Directions.downLeft,
    Directions.downRight,
] as const;
export const orthogonalDirections = [
    Directions.up,
    Directions.down,
    Directions.left,
    Directions.right,
] as const;

export type OrthogonalDirection = (typeof orthogonalDirections)[number];

export const DirectionsToDiffs = {
    [Directions.up]: {
        row: -1,
        col: 0,
    },
    [Directions.down]: {
        row: 1,
        col: 0,
    },
    [Directions.left]: {
        row: 0,
        col: -1,
    },
    [Directions.right]: {
        row: 0,
        col: 1,
    },
    [Directions.upLeft]: {
        row: -1,
        col: -1,
    },
    [Directions.upRight]: {
        row: -1,
        col: 1,
    },
    [Directions.downLeft]: {
        row: 1,
        col: -1,
    },
    [Directions.downRight]: {
        row: 1,
        col: 1,
    },
} satisfies Record<Direction, GridCoordinate>;

export const CharDirectionMap = {
    '^': Directions.up,
    v: Directions.down,
    '<': Directions.left,
    '>': Directions.right,
} satisfies Record<string, OrthogonalDirection>;

export type OrthogonalDirectionChar = keyof typeof CharDirectionMap;

export const OrthogonalDirectionsToChars = {
    [Directions.up]: '^',
    [Directions.down]: 'v',
    [Directions.left]: '<',
    [Directions.right]: '>',
} satisfies Record<OrthogonalDirection, string>;

export const ClockwiseRotation = {
    [Directions.up]: Directions.right,
    [Directions.right]: Directions.down,
    [Directions.down]: Directions.left,
    [Directions.left]: Directions.up,
    [Directions.upLeft]: Directions.upRight,
    [Directions.upRight]: Directions.downRight,
    [Directions.downRight]: Directions.downLeft,
    [Directions.downLeft]: Directions.upLeft,
} satisfies Record<Direction, Direction>;

export const CounterClockwiseRotation = {
    [Directions.up]: Directions.left,
    [Directions.left]: Directions.down,
    [Directions.down]: Directions.right,
    [Directions.right]: Directions.up,
    [Directions.upLeft]: Directions.downLeft,
    [Directions.downLeft]: Directions.downRight,
    [Directions.downRight]: Directions.upRight,
    [Directions.upRight]: Directions.upLeft,
} satisfies Record<Direction, Direction>;

export const OppositeDirections = {
    [Directions.up]: Directions.down,
    [Directions.down]: Directions.up,
    [Directions.left]: Directions.right,
    [Directions.right]: Directions.left,
    [Directions.upLeft]: Directions.downRight,
    [Directions.downRight]: Directions.upLeft,
    [Directions.downLeft]: Directions.upRight,
    [Directions.upRight]: Directions.downLeft,
} satisfies Record<Direction, Direction>;
