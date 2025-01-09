import kleur from 'kleur';
import { Timer } from '~/types/Timer';

async function start() {
    const timer = new Timer();

    console.log(kleur.cyan(`All puzzles ran in ${timer.time}.`));
}

start();
