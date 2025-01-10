import { Puzzle } from './Puzzle';
import { getNumbers, splitFilter } from '~/util/parsing';
import { findBestBy, maxOf, sumOf } from '~/util/iterables';

interface Event {
    timestamp: Date;
    action: 'falls asleep' | 'wakes up';
}

class GuardSession {
    guardId: number;
    startedShiftAt: Date;
    events: Event[] = [];

    constructor(guardId: number, startedAt: Date) {
        this.guardId = guardId;
        this.startedShiftAt = startedAt;
    }
}

export const puzzle4 = new Puzzle({
    day: 4,
    parseInput: (fileData) => {
        const sessions: GuardSession[] = [];
        const sortedData = splitFilter(fileData)
            .map((line) => {
                const [timestamp, action] = line.slice(1).split('] ') as [
                    string,
                    string,
                ];
                return {
                    timestamp: new Date(timestamp),
                    action,
                };
            })
            .sort((a, b) => a.timestamp.valueOf() - b.timestamp.valueOf());
        sortedData.forEach(({ timestamp, action }) => {
            if (action.startsWith('Guard')) {
                const guard = new GuardSession(
                    getNumbers(action)[0]!,
                    timestamp,
                );
                sessions.push(guard);
            } else if (sessions.length === 0) {
                throw new Error('No guards found');
            } else {
                const guard = sessions[sessions.length - 1]!;
                guard.events.push({
                    timestamp,
                    action: action.includes('falls asleep')
                        ? 'falls asleep'
                        : 'wakes up',
                });
            }
        });
        const asleepMinuteCountsPerGuard = new Map<
            number,
            Map<number, number>
        >();
        for (const guard of sessions) {
            const asleepMinuteCounts =
                asleepMinuteCountsPerGuard.get(guard.guardId) ??
                new Map<number, number>();
            asleepMinuteCountsPerGuard.set(guard.guardId, asleepMinuteCounts);

            let asleep = false;
            let currentMinute = 0;
            guard.events.forEach(({ timestamp, action }) => {
                const minute = timestamp.getMinutes();
                if (asleep) {
                    for (let m = currentMinute; m < minute; m++) {
                        asleepMinuteCounts.set(
                            m,
                            (asleepMinuteCounts.get(m) ?? 0) + 1,
                        );
                    }
                    if (action === 'wakes up') {
                        asleep = false;
                    }
                } else {
                    if (action === 'falls asleep') {
                        asleep = true;
                    }
                }
                currentMinute = minute;
            });

            if (asleep) {
                for (let m = currentMinute; m < 60; m++) {
                    asleepMinuteCounts.set(
                        m,
                        (asleepMinuteCounts.get(m) ?? 0) + 1,
                    );
                }
            }
        }
        return asleepMinuteCountsPerGuard;
    },
    part1: (asleepMinuteCountsPerGuard) => {
        const minutesAsleepPerGuard = asleepMinuteCountsPerGuard
            .entries()
            .map(([guardId, asleepMinuteCounts]): [number, number] => [
                guardId,
                sumOf(asleepMinuteCounts.values(), (v) => v),
            ]);
        const sleepiestGuard = findBestBy(
            minutesAsleepPerGuard,
            (guard1, guard2) => guard1[1] > guard2[1],
        )[0];
        const minuteCountsForGuard =
            asleepMinuteCountsPerGuard.get(sleepiestGuard)!;
        const sleepiestMinute = findBestBy(
            minuteCountsForGuard.entries(),
            (minute1, minute2) => minute1[1] > minute2[1],
        )[0];
        return sleepiestGuard * sleepiestMinute;
    },
    part2: (asleepMinuteCountsPerGuard) => {
        const maxMinutesAsleepPerGuard = asleepMinuteCountsPerGuard
            .entries()
            .map(([guardId, asleepMinuteCounts]): [number, number] => [
                guardId,
                maxOf(asleepMinuteCounts.values(), (v) => v),
            ]);
        const sleepiestGuard = findBestBy(
            maxMinutesAsleepPerGuard,
            (guard1, guard2) => guard1[1] > guard2[1],
        )[0];
        const minuteCountsForGuard =
            asleepMinuteCountsPerGuard.get(sleepiestGuard)!;
        const sleepiestMinute = findBestBy(
            minuteCountsForGuard.entries(),
            (minute1, minute2) => minute1[1] > minute2[1],
        )[0];
        return sleepiestGuard * sleepiestMinute;
    },
});
