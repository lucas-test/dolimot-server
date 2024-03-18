// Initialize game

import { Team } from "./client";


export const points = [0,0];


export let wordToGuess = "";
export let hintsBlue = "";
export let hintsOrange = "";
const hintsPos = new Array<number>();
export const tries = new Array<[Team, string]>();


export function resetPoints(){
    points[0] = 0;
    points[1] = 0;
}

export function scorePoints(team: Team, chooserTeam: Team){
    let p = 1;
    let nbHintsBlue = 0;
    for (let i = 0; i < hintsBlue.length; i ++){
        if (hintsBlue[i] != "_"){
            nbHintsBlue ++;
        }
    }
    let nbHintsOrange = 0;
    for (let i = 0; i < hintsOrange.length; i ++){
        if (hintsOrange[i] != "_"){
            nbHintsOrange ++;
        }
    }


    if (team == Team.Blue){
        p = wordToGuess.length - nbHintsBlue; 
    } else {
        p = wordToGuess.length - nbHintsOrange;
    }

    if (team == Team.Blue){
        points[0] += p;
    } else {
        points[1] += p;
    }
}


export function updateHints(team: Team, hintsChoosed: Array<string>){
    hintsBlue = "";
    hintsOrange = "";
    for (let i = 0; i < hintsChoosed.length; i ++){
        if (hintsChoosed[i] == "Common" || (hintsChoosed[i] == "MyTeam" && team == Team.Blue) ){
            hintsBlue = hintsBlue.concat(wordToGuess[i]);
        }
        if (hintsChoosed[i] == "Common" || (hintsChoosed[i] == "MyTeam" && team == Team.Orange) ){
            hintsOrange = hintsOrange.concat(wordToGuess[i]);
        }
    }
    const h = wordToGuess.length - hintsBlue.length;
    for (let i = 0 ; i < h; i++){
        hintsBlue += "_";
    }
    const h2 = wordToGuess.length - hintsOrange.length;
    for (let i = 0 ; i < h2; i++){
        hintsOrange += "_";
    }
}

// export function addRandomHint(){
//     if (hintsPos.length >= wordToGuess.length) return;
//     while(true){
//         const i = Math.floor(Math.random()*wordToGuess.length);
//         if (hintsPos.indexOf(i) == -1){
//             hintsPos.push(i);
//             hintsPos.sort();
//             break;
//         }
//     }

//     hints = ""; 
//     for (let i = 0 ; i < hintsPos.length; i ++){
//         hints = hints.concat(wordToGuess[hintsPos[i]]);
//     }
//     const h = wordToGuess.length - hints.length;
    
//     for (let i = 0 ; i < h; i++){
//         hints += "_";
//     }

// }



export function init(str: string){
    console.log("init ", str);
    wordToGuess = str;
    hintsBlue = "";
    hintsOrange = "";
    hintsPos.splice(0,hintsPos.length);
    tries.splice(0, tries.length);
    
    // for (let i = 0 ; i < wordToGuess.length; i ++){
    //     if (Math.random() < 0.5){
    //         hintsPos.push(i);
    //         hints = hints.concat(wordToGuess[i])
    //     }
    // }
    const h = wordToGuess.length - hintsBlue.length;
    for (let i = 0 ; i < h; i++){
        hintsBlue += "_";
    }

    const h2 = wordToGuess.length - hintsOrange.length;
    for (let i = 0 ; i < h; i++){
        hintsOrange += "_";
    }
    console.log(hintsBlue);


}







