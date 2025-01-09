import kleur from 'kleur';
import { puzzle1, puzzle2 } from '~/puzzles';
import { Timer } from '~/types/Timer';

async function start() {
    const timer = new Timer();

    // await puzzle1.run();
    await puzzle2.run({
        example: true,
        mainProblem: true,
    });

    console.log(kleur.cyan(`All puzzles ran in ${timer.time}.`));
}

start();
