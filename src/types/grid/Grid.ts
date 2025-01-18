import kleur from 'kleur';
import { parseStringBlock } from '~/util/parsing';
import {
    Direction,
    directions,
    orthogonalDirections,
} from '~/types/grid/Directions';
import {
    getCoordsInDirection,
    GridCoordinate,
    manhattanDistance,
} from '~/types/grid/GridCoordinate';
import { findBy } from '~/util/iterables';

export class GridNode<T = undefined> {
    readonly row: number;
    readonly col: number;
    readonly toString: () => string;
    readonly posKey: string;
    data: T;

    constructor({
        row,
        col,
        data,
        toString = (d) => `(${d.row},${d.col})`,
    }: GridCoordinate & { data: T; toString?: (d: GridNode<T>) => string }) {
        this.row = row;
        this.col = col;
        this.data = data;
        this.toString = () => toString(this);
        this.posKey = `(${row},${col})`;
    }
}

export class Grid<T> {
    readonly grid: GridNode<T>[][] = [];
    readonly width: number;
    readonly height: number;
    readonly defaultValue: (c: GridCoordinate) => T;
    readonly drawFn?: (node: GridNode<T>) => string;

    constructor({
        height,
        width,
        defaultValue,
        drawFn,
    }: {
        height: number;
        width: number;
        defaultValue: (c: GridCoordinate) => T;
        drawFn?: (node: GridNode<T>) => string;
    }) {
        this.height = height;
        this.width = width;
        this.grid = Array.from({ length: height }, (_, row) =>
            Array.from(
                { length: width },
                (_, col) =>
                    new GridNode<T>({
                        row,
                        col,
                        data: defaultValue?.({ row, col }),
                        toString: drawFn,
                    }),
            ),
        );
        this.defaultValue = defaultValue;
        this.drawFn = drawFn;
    }

    static from2DArray<TInput>(
        arr: TInput[][],
        {
            drawFn,
        }: {
            drawFn?: (node: GridNode<TInput>) => string;
        } = {},
    ): Grid<TInput> {
        const height = arr.length;
        const width = arr[0]?.length ?? 0;

        if (!(width > 0 && height > 0)) {
            throw new Error('Invalid input dimensions');
        }

        return new Grid<TInput>({
            height,
            width,
            defaultValue: ({ row, col }) => arr[row]![col]!,
            drawFn,
        });
    }

    static from2DArrayCustom<TInput, TData>(
        arr: TInput[][],
        {
            drawFn,
            dataFn,
        }: {
            drawFn?: (node: GridNode<TData>) => string;
            dataFn: (
                data: GridCoordinate & {
                    input: TInput;
                },
            ) => TData;
        },
    ): Grid<TData> {
        const height = arr.length;
        const width = arr[0]?.length ?? 0;

        if (!(width > 0 && height > 0)) {
            throw new Error('Invalid input dimensions');
        }

        return new Grid<TData>({
            height,
            width,
            defaultValue: ({ row, col }) =>
                dataFn({
                    row,
                    col,
                    input: arr[row]![col]!,
                }),
            drawFn,
        });
    }

    static fromString(data: string): Grid<string> {
        return Grid.from2DArray(parseStringBlock(data), {
            drawFn: (node) => node.data,
        });
    }

    clone(): Grid<T> {
        return new Grid<T>({
            height: this.height,
            width: this.width,
            defaultValue: (pos) => this.get(pos)!.data,
            drawFn: this.drawFn,
        });
    }

    get({ row, col }: GridCoordinate): GridNode<T> | undefined {
        return this.grid[row]?.[col];
    }

    set(pos: GridCoordinate, value: T): void {
        const row = this.grid[pos.row];
        if (!row) {
            throw new Error(`Invalid row ${pos.row}`);
        }
        const node = row[pos.col];
        if (!node) {
            throw new Error(`Invalid col ${pos.col}`);
        }
        node.data = value;
    }

    *nodes(): Generator<GridNode<T>> {
        for (const row of this.grid) {
            for (const node of row) {
                yield node;
            }
        }
    }

    forEach(fn: (node: GridNode<T>, index: number) => void): void {
        this.grid.forEach((row, iRow) => {
            row.forEach((node, iCol) => {
                fn(node, iRow * this.width + iCol);
            });
        });
    }

    reduce<TAcc>(
        fn: (acc: TAcc, node: GridNode<T>, index: number) => TAcc,
        initialValue: TAcc,
    ): TAcc {
        let acc = initialValue;
        this.forEach((node, index) => {
            acc = fn(acc, node, index);
        });
        return acc;
    }

    filter(fn: (node: GridNode<T>) => any): GridNode<T>[] {
        let filtered: GridNode<T>[] = [];
        for (const node of this.nodes()) {
            if (fn(node)) {
                filtered.push(node);
            }
        }
        return filtered;
    }

    find(fn: (node: GridNode<T>) => any): GridNode<T> | undefined {
        return findBy(this.nodes(), fn);
    }

    getNeighbor(pos: GridCoordinate, direction: Direction, distance = 1) {
        return this.get(getCoordsInDirection(pos, direction, distance));
    }

    getOrthogonalNeighbors(pos: GridCoordinate) {
        return orthogonalDirections.reduce<GridNode<T>[]>(
            (neighbors, direction) => {
                const node = this.getNeighbor(pos, direction);
                if (node) {
                    neighbors.push(node);
                }
                return neighbors;
            },
            [],
        );
    }

    getOrthogonalNeighborsWithDirections(pos: GridCoordinate) {
        return orthogonalDirections.reduce<
            {
                node: GridNode<T>;
                direction: Direction;
            }[]
        >((neighbors, direction) => {
            const node = this.getNeighbor(pos, direction);
            if (node) {
                neighbors.push({
                    node,
                    direction,
                });
            }
            return neighbors;
        }, []);
    }

    getNAway(pos: GridCoordinate, distance: number): GridNode<T>[] {
        return this.filter((node) => manhattanDistance(node, pos) === distance);
    }

    getNeighbors(pos: GridCoordinate) {
        return directions.reduce<GridNode<T>[]>((neighbors, direction) => {
            const node = this.getNeighbor(pos, direction);
            if (node) {
                neighbors.push(node);
            }
            return neighbors;
        }, []);
    }

    getRow(row: number) {
        return this.grid[row];
    }

    getColumn(col: number) {
        if (col < 0 || col >= this.width) {
            return undefined;
        }
        return this.grid.map((row) => row[col]!);
    }

    forEachRow(fn: (rowOfNodes: GridNode<T>[], iRow: number) => void) {
        this.grid.forEach((rowOfNodes, iRow) => {
            fn(rowOfNodes, iRow);
        });
    }

    mapRows<TMap>(fn: (rowOfNodes: GridNode<T>[], iRow: number) => TMap) {
        return this.grid.map((rowOfNodes, iRow) => fn(rowOfNodes, iRow));
    }

    toRawString(drawFn?: (node: GridNode<T>) => string) {
        return this.grid
            .map((rowOfNodes) =>
                rowOfNodes
                    .map(
                        (node) =>
                            (drawFn ?? this.drawFn)?.(node) ?? node.toString(),
                    )
                    .join(''),
            )
            .join('\n');
    }

    toString(drawFn?: (node: GridNode<T>) => string) {
        const padding = Math.max(4, this.height.toString().length + 1);

        return this.grid
            .map(
                (rowOfNodes, row) =>
                    `${kleur.cyan(
                        row.toString().padStart(padding, ' '),
                    )} ${rowOfNodes
                        .map(
                            (node) =>
                                (drawFn ?? this.drawFn)?.(node) ??
                                node.toString(),
                        )
                        .join('')}`,
            )
            .join('\n');
    }

    get key() {
        return this.grid
            .map((rowOfNodes) =>
                rowOfNodes
                    .map((node) => this.drawFn?.(node) ?? node.toString())
                    .join(''),
            )
            .join('');
    }

    draw(drawFn?: (node: GridNode<T>) => string) {
        console.log(`
${this.toString(drawFn)}
`);
    }

    get data() {
        return this.grid.map((row) => row.map((node) => node.data));
    }

    getSubGrid({
        row: startRow,
        col: startCol,
        width,
        height,
        blankValue,
    }: {
        row: number;
        col: number;
        width: number;
        height: number;
        blankValue: T;
    }) {
        return new Grid<T>({
            width,
            height,
            defaultValue: ({ row, col }) =>
                this.get({ row: row + startRow, col: col + startCol })?.data ??
                blankValue,
            drawFn: this.drawFn,
        });
    }
}
