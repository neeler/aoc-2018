import { Puzzle } from './Puzzle';
import { getNumbers, getNumbersForEachLine, splitFilter } from '~/util/parsing';
import { Registers } from '~/types/Registers';

export const puzzle16 = new Puzzle({
    day: 16,
    parseInput: (fileData) => {
        const [samples, program = ''] = fileData.split('\n\n\n');
        return {
            samples: splitFilter(samples!, '\n\n').map((sample): Sample => {
                const [beforeLine, instructionLine, afterLine] =
                    sample.split('\n');
                return {
                    before: getNumbers(beforeLine!),
                    instruction: new Instruction(getNumbers(instructionLine!)),
                    after: registerFrom(getNumbers(afterLine!)),
                };
            }),
            program: getNumbersForEachLine(program).map(
                (input) => new Instruction(input),
            ),
        };
    },
    part1: ({ samples }) => {
        return samples.filter(({ before, instruction, after }) => {
            let nMatchingOps = 0;
            for (const op of InstructionTypes) {
                const testRegisters = registerFrom(before);
                instruction.actAs(op, testRegisters);
                if (testRegisters.equals(after)) {
                    nMatchingOps++;
                }
                if (nMatchingOps >= 3) {
                    return true;
                }
            }
        }).length;
    },
    part2: ({ samples, program }, { example }) => {
        if (example) return;

        const opcodeMap = new Map<number, Set<InstructionType>>();
        samples.forEach(({ before, instruction, after }) => {
            const possibleOps: Set<InstructionType> = new Set();
            for (const op of InstructionTypes) {
                const testRegisters = registerFrom(before);
                instruction.actAs(op, testRegisters);
                if (testRegisters.equals(after)) {
                    possibleOps.add(op);
                }
            }
            const existingOpSet = opcodeMap.get(instruction.opIndex);
            opcodeMap.set(
                instruction.opIndex,
                existingOpSet === undefined
                    ? possibleOps
                    : possibleOps.union(existingOpSet),
            );
        });
        const finalOpCodeMap = new Map<number, InstructionType>();
        while (finalOpCodeMap.size < InstructionTypes.length) {
            for (const [index, possibleOps] of opcodeMap.entries()) {
                if (possibleOps.size === 1) {
                    const op = Array.from(possibleOps)[0]!;
                    finalOpCodeMap.set(index, op);
                    opcodeMap.forEach((ops) => ops.delete(op));
                }
            }
        }

        const registers = new Registers();
        for (const instruction of program) {
            instruction.actAs(
                finalOpCodeMap.get(instruction.opIndex)!,
                registers,
            );
        }
        return registers.get('0');
    },
});

interface Sample {
    before: number[];
    instruction: Instruction;
    after: Registers;
}

function registerFrom(input: number[]) {
    const registers = new Registers();
    for (const [index, value] of input.entries()) {
        registers.set(index.toString(), value);
    }
    return registers;
}

const InstructionTypes = [
    'addr',
    'addi',
    'mulr',
    'muli',
    'banr',
    'bani',
    'borr',
    'bori',
    'setr',
    'seti',
    'gtir',
    'gtri',
    'gtrr',
    'eqir',
    'eqri',
    'eqrr',
] as const;

type InstructionType = (typeof InstructionTypes)[number];

class Instruction {
    opIndex: number;
    A: number;
    B: number;
    C: string;

    constructor(inputs: number[]) {
        if (inputs.length !== 4) {
            throw new Error('Invalid instruction input');
        }
        const [opIndex, A, B, C] = inputs;
        this.opIndex = opIndex!;
        this.A = A!;
        this.B = B!;
        this.C = C!.toString();
    }

    actAs(op: InstructionType, registers: Registers) {
        switch (op) {
            case 'addr': {
                registers.set(
                    this.C,
                    registers.get(this.A.toString()) +
                        registers.get(this.B.toString()),
                );
                break;
            }
            case 'addi': {
                registers.set(
                    this.C,
                    registers.get(this.A.toString()) + this.B,
                );
                break;
            }
            case 'mulr': {
                registers.set(
                    this.C,
                    registers.get(this.A.toString()) *
                        registers.get(this.B.toString()),
                );
                break;
            }
            case 'muli': {
                registers.set(
                    this.C,
                    registers.get(this.A.toString()) * this.B,
                );
                break;
            }
            case 'banr': {
                registers.set(
                    this.C,
                    registers.get(this.A.toString()) &
                        registers.get(this.B.toString()),
                );
                break;
            }
            case 'bani': {
                registers.set(
                    this.C,
                    registers.get(this.A.toString()) & this.B,
                );
                break;
            }
            case 'borr': {
                registers.set(
                    this.C,
                    registers.get(this.A.toString()) |
                        registers.get(this.B.toString()),
                );
                break;
            }
            case 'bori': {
                registers.set(
                    this.C,
                    registers.get(this.A.toString()) | this.B,
                );
                break;
            }
            case 'setr': {
                registers.set(this.C, registers.get(this.A.toString()));
                break;
            }
            case 'seti': {
                registers.set(this.C, this.A);
                break;
            }
            case 'gtir': {
                registers.set(
                    this.C,
                    Number(this.A > registers.get(this.B.toString())),
                );
                break;
            }
            case 'gtri': {
                registers.set(
                    this.C,
                    Number(registers.get(this.A.toString()) > this.B),
                );
                break;
            }
            case 'gtrr': {
                registers.set(
                    this.C,
                    Number(
                        registers.get(this.A.toString()) >
                            registers.get(this.B.toString()),
                    ),
                );
                break;
            }
            case 'eqir': {
                registers.set(
                    this.C,
                    Number(this.A === registers.get(this.B.toString())),
                );
                break;
            }
            case 'eqri': {
                registers.set(
                    this.C,
                    Number(registers.get(this.A.toString()) === this.B),
                );
                break;
            }
            case 'eqrr': {
                registers.set(
                    this.C,
                    Number(
                        registers.get(this.A.toString()) ===
                            registers.get(this.B.toString()),
                    ),
                );
                break;
            }
        }
    }
}
