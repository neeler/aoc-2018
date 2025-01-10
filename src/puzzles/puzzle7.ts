import { Puzzle } from './Puzzle';
import { MapOfArrays } from '~/util/collections';
import { filterToArray } from '~/util/iterables';

export const puzzle7 = new Puzzle({
    day: 7,
    parseInput: (fileData) => {
        const steps = new Set<string>();
        const parentsByStep = new MapOfArrays<string, string>();
        for (const [, parentStep, childStep] of fileData.matchAll(
            /Step (\w+) must be finished before step (\w+) can begin./g,
        )) {
            steps.add(parentStep!);
            steps.add(childStep!);
            parentsByStep.addToKey(childStep!, parentStep!);
        }
        return {
            steps,
            parentsByStep,
        };
    },
    part1: ({ steps, parentsByStep }) => {
        const remainingSteps = new Set(steps);
        const path: string[] = [];
        while (remainingSteps.size > 0) {
            const available = filterToArray(remainingSteps, (step) => {
                const parents = parentsByStep.get(step);
                return !parents || parents.every((p) => !remainingSteps.has(p));
            });
            if (available.length > 0) {
                available.sort();
                const nextStep = available[0]!;
                path.push(nextStep);
                remainingSteps.delete(nextStep);
            }
        }
        return path.join('');
    },
    part2: ({ steps, parentsByStep }, { example }) => {
        const nWorkers = example ? 2 : 5;

        interface Worker {
            step: string;
            timeLeft: number;
        }

        let workers: Worker[] = [];
        const completedSteps = new Set<string>();
        const remainingSteps = new Set(steps);
        let time = 0;
        while (completedSteps.size < steps.size) {
            const nWorkersAvailable = nWorkers - workers.length;
            if (nWorkersAvailable > 0) {
                const available = filterToArray(remainingSteps, (step) => {
                    const parents = parentsByStep.get(step);
                    return (
                        !parents || parents.every((p) => completedSteps.has(p))
                    );
                });
                available.sort();
                const nAvailable = Math.min(
                    available.length,
                    nWorkersAvailable,
                );
                for (let i = 0; i < nAvailable; i++) {
                    const nextStep = available.shift()!;
                    remainingSteps.delete(nextStep);
                    workers.push({
                        step: nextStep,
                        timeLeft:
                            (example ? 0 : 60) +
                            nextStep.charCodeAt(0) -
                            'A'.charCodeAt(0) +
                            1,
                    });
                }
            }

            workers = workers.reduce<Worker[]>((workers, worker) => {
                if (worker.timeLeft === 1) {
                    completedSteps.add(worker.step);
                } else {
                    workers.push({
                        ...worker,
                        timeLeft: worker.timeLeft - 1,
                    });
                }
                return workers;
            }, []);

            time++;
        }

        return time;
    },
});
