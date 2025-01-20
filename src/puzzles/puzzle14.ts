import { Puzzle } from './Puzzle';
import { getNumbers } from '~/util/parsing';
import { mod } from '~/util/arithmetic';

export const puzzle14 = new Puzzle({
    day: 14,
    parseInput: (fileData) => {
        return getNumbers(fileData)[0]!;
    },
    part1: (nRecipes) => {
        const scores = [3, 7];
        let iElf1 = 0;
        let iElf2 = 1;

        while (scores.length < nRecipes + 10) {
            const elf1Score = scores[iElf1]!;
            const elf2Score = scores[iElf2]!;
            scores.push(
                ...(elf1Score + elf2Score).toString().split('').map(Number),
            );
            iElf1 = mod(iElf1 + 1 + elf1Score, scores.length);
            iElf2 = mod(iElf2 + 1 + elf2Score, scores.length);
        }
        return scores.slice(nRecipes, nRecipes + 10).join('');
    },
    part2: (targetSequence) => {
        const targetString = targetSequence.toString();
        const targetLength = targetString.length;

        const scores = ['3', '7'];
        let iElf1 = 0;
        let iElf2 = 1;

        let scoreString = scores.join('');

        while (true) {
            const elf1Score = +scores[iElf1]!;
            const elf2Score = +scores[iElf2]!;
            const newRecipeString = (elf1Score + elf2Score).toString();
            const newRecipes = newRecipeString.split('');
            scores.push(...newRecipes);
            iElf1 = mod(iElf1 + 1 + elf1Score, scores.length);
            iElf2 = mod(iElf2 + 1 + elf2Score, scores.length);

            scoreString += newRecipeString;

            const matchIndex = scoreString.indexOf(targetString);

            if (matchIndex > -1) {
                return (
                    scores.length -
                    targetLength -
                    (newRecipes.length - matchIndex)
                );
            }

            scoreString = scoreString.slice(-targetLength);
        }
    },
});
