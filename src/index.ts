import ENV from './.env.json';
import { Client, Team } from './client';
import { hintsBlue, hintsOrange, init, points, resetPoints, scorePoints, tries, updateHints, wordToGuess } from './game';
import { getRandomWord } from './words';

import { Server, Socket } from 'socket.io';
import fs from 'fs';
import https from 'https';

// Initialize the server
const httpsServer = https.createServer({
    key: fs.readFileSync(ENV.keyPath),
    cert: fs.readFileSync(ENV.certPath),
});

export const io = new Server(httpsServer, {
    cors: {
        origin: ENV.corsOrigin,
    }});

httpsServer.listen(ENV.port, () => {
    console.log(`Listening on https://localhost:${ENV.port}`);
});

// io.listen(ENV.port);

// console.log("----------------------------------------------");
// console.log(`Server started at http://localhost:${ENV.port}`);
// console.log("----------------------------------------------");


// Clients
const clients = new Map<string, Client>();


init(getRandomWord());


function clientsList(): Array<[string, Team, string]>{
    const l = new Array<[string, Team, string]>();
    for (const client of clients.values()){
        l.push([client.name, client.getTeam(), client.socket.id.toString()])
    }
    return l;
}

function countTeamPlayers(): [number, number]{
    let nbBlue = 0;
    let nbOrange = 0;
    for (const client of clients.values()){
        if (client.getTeam() == Team.Blue){
            nbBlue ++;
        } else {
            nbOrange ++;
        }
    }
    return [nbBlue, nbOrange];
}


io.sockets.on('connection', function (socket: Socket) {

    // Initialization
    console.log("--------------------------------")
    console.log("new connection");
    const client = new Client(socket);
    clients.set(socket.id, client);

    const [nbBlue, nbOrange] = countTeamPlayers();
    if (nbBlue < nbOrange){
        client.setTeam(Team.Blue);
    } else {
        client.setTeam(Team.Orange)
    }

    let isThereChooser = false;
    for (const client of clients.values()){
        if (client.isChooser()){
            isThereChooser = true;
            break;
        }
    }

    if (isThereChooser == false){
        console.log("chooser")
        socket.emit("chooseHints", wordToGuess);
        client.setChooser(true);
    } else {
        console.log("normal")
        if (client.getTeam() == Team.Blue){
            socket.emit("hints", hintsBlue);
        } else {
            socket.emit("hints", hintsOrange);
        }
    }

    socket.broadcast.emit("updateClients", clientsList());
    socket.emit("updateClients", clientsList());
    socket.emit("updateId", socket.id);
    socket.emit("updatePoints", points);

    // Setup General API
    socket.on("disconnect", handleDisconnect);
    socket.on("guess", guess);
    socket.on("hintsChoosed", handleHintsChoosed);
    socket.on("updateName", handleUpdateName);
    socket.on("resetPoints", handleResetPoints);
    // socket.on("askHint", askHint);

    function handleResetPoints(){
        console.log("handle reset points");
        resetPoints();
        socket.broadcast.emit("updatePoints", points);
        socket.emit("updatePoints", points);
    }

    function handleUpdateName(name: string){
        client.name = name;
        socket.broadcast.emit("updateClients", clientsList());
        socket.emit("updateClients", clientsList());
    }

    function handleHintsChoosed(hintsChoosed: Array<string>){
        updateHints(client.getTeam(), hintsChoosed);
        console.log("new hints: ", hintsBlue, hintsOrange);
        for(const client of clients.values()){
            if (client.socket.id != socket.id){
                client.socket.emit("hints", client.getTeam() == Team.Blue ? hintsBlue: hintsOrange)
            }
        }
    }

    function handleDisconnect(){
        clients.delete(socket.id);
        socket.broadcast.emit("updateClients", clientsList());
    }

    function guess(str: string){
        console.log(`${socket.id} tries ${str}`);
        if (str == wordToGuess){
            let chooserTeam = Team.Blue;
            for (const client of clients.values()){
                if (client.isChooser()){
                    client.chooser = false;
                    chooserTeam = client.getTeam();
                    break;
                }
            }

            scorePoints(client.getTeam(), chooserTeam)
            init(getRandomWord());
            
            // Reset hints
            socket.broadcast.emit("hints", hintsBlue); // toute facon il est _____
            socket.emit("hints", hintsBlue);
            
            // Reset Tries to empty
            socket.broadcast.emit("updateTries", tries);
            socket.emit("updateTries", tries);

            // Update Points
            socket.broadcast.emit("updatePoints", points);
            socket.emit("updatePoints", points);

            // Change the chooser
            
            chooserTeam = chooserTeam == Team.Blue ? Team.Orange : Team.Blue;

            const otherTeam = [];
            for (const client of clients.values()){
                if (client.getTeam() == chooserTeam){
                    otherTeam.push(client);
                }
            }
            if (otherTeam.length > 0){
                const r = Math.floor(Math.random()*otherTeam.length);
                const c = otherTeam[r];
                c.chooser = true;
                c.socket.emit("chooseHints", wordToGuess);
            }

            // for (const client of clients.values()){
            //     if (client.isChooser()){
            //         client.socket.emit("chooseHints", wordToGuess);
            //     }
            // }
        } else {
            tries.push([client.getTeam(), str]);
            socket.broadcast.emit("updateTries", tries);
            socket.emit("updateTries", tries);
        }
    }

    // function askHint(){
    //     console.log(`${socket.id} asks hint`);
    //     addRandomHint();
    //     socket.broadcast.emit("hints", hints);
    //     socket.emit("hints", hints);
    // }


})