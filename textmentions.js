import { generateFailMessage } from "./services.js";

export const BANG = "BANG";
export const BEF = "BEF";
export const START_HUNT = `Prepare your guns and soft petting hands. The hunt begins...`;
export const NO_HUNT_IN_GAME = `There is no hunt going on. Start the hunt with /starthunt`
export const BANG_NONEXISTENT = "BRRRTT BRTTTT Nuginagamue? Walang bibe oyy!";
export const BEF_NONEXISTENT = "Luh creep! Are you trying to befriend a mumu?";
export const BANG_SUCCESS = `Bullseye, pichapie! Killed in`
export const BEF_SUCCESS = `How sweet of you befriending the litol duck duck in`
export const BANG_FAIL_MESSAGES = [
    "You missed HAHAHAA What a nub! ",
    "Your gun jammed. Weh woh. "
]
export const BEF_FAIL_MESSAGES = [
    "Who knew ducks can be so picky.",
    "Social distancing daw! "
]


export const MESSAGES = {
    BANG: {
        SUCCESS: BANG_SUCCESS,
        NONEXISTENT: BANG_NONEXISTENT,
        FAIL_MESSAGE: () => generateFailMessage(BANG_FAIL_MESSAGES),
    },
    BEF: {
        SUCCESS: BEF_SUCCESS,
        NONEXISTENT: BEF_NONEXISTENT,
        FAIL_MESSAGE:() => generateFailMessage(BEF_FAIL_MESSAGES),
    }
}