import { StateMachine, StateMachineConfig } from '~/types/StateMachine';
import { Direction, Grid, GridCoordinate, GridNode } from 'src/types/grid';

export type GridStateMachineState<T, TState extends object = {}> = TState & {
    grid: Grid<T>;
    node: GridNode<T>;
};

export type GridStateMachineConfig<T, TState extends object = {}> = Omit<
    StateMachineConfig<GridStateMachineState<T>>,
    'nextStates'
> & {
    grid: Grid<T>;
    getValidMoves: (state: GridStateMachineState<T>) => Direction[];
    getNextState: (data: {
        state: GridStateMachineState<T>;
        direction: Direction;
        nextNode: GridNode<T>;
    }) => TState & {
        node: GridNode<T>;
    };
};

export class GridStateMachine<T> extends StateMachine<
    GridStateMachineState<T>
> {
    readonly grid: Grid<T>;

    constructor({
        isEnd,
        onEnd,
        queueType,
        grid,
        getValidMoves,
        getNextState,
    }: GridStateMachineConfig<T>) {
        super({
            isEnd,
            onEnd,
            nextStates: (state) => {
                return getValidMoves(state).reduce<GridStateMachineState<T>[]>(
                    (states, direction) => {
                        const nextNode = grid.getNeighbor(
                            state.node,
                            direction,
                        );
                        if (nextNode) {
                            const nextState = getNextState({
                                state,
                                direction,
                                nextNode,
                            });
                            states.push({
                                ...nextState,
                                grid,
                            });
                        }
                        return states;
                    },
                    [],
                );
            },
            queueType,
        });

        this.grid = grid;
    }

    walk({ start, data }: { start: GridCoordinate; data: T }) {
        const node = this.grid.get(start);
        if (!node) {
            throw new Error('Invalid start coordinates');
        }
        this.run({
            start: {
                ...data,
                node,
                grid: this.grid,
            },
        });
    }
}
