export class Registers {
    values = new Map<string, number>();

    constructor(startingValues?: Map<string, number>) {
        if (startingValues) {
            for (const [key, value] of startingValues) {
                this.values.set(key, value);
            }
        }
    }

    get(target: number | string | undefined): number {
        if (target === undefined) {
            throw new Error('Cannot get an undefined register');
        }
        return typeof target === 'number'
            ? target
            : (this.values.get(target) ?? 0);
    }

    set(target: number | string | undefined, value: number): void {
        if (typeof target !== 'string') {
            throw new Error('Cannot set a number as a register');
        }
        this.values.set(target, value);
    }

    equals(other: Registers): boolean {
        if (this.values.size !== other.values.size) {
            return false;
        }
        for (const [key, value] of this.values) {
            if (other.get(key) !== value) {
                return false;
            }
        }
        return true;
    }
}
