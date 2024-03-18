import { Socket } from "socket.io";

export enum Team {
    Blue = "Blue",
    Orange = "Orange",
    None = "None"
}

export function randomName(length: number): string {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

export class Client {
    name: string;
    socket: Socket;
    private team: Team;
    chooser: boolean;

    constructor(socket: Socket){
        this.name = randomName(5);
        this.socket = socket;
        this.team = Team.None;
        this.chooser = false;
    }

    setTeam(team: Team){
        this.team = team;
    }

    getTeam(): Team{
        return this.team;
    }

    setChooser(chooser: boolean){
        this.chooser = chooser;
    }

    isChooser(){
        return this.chooser;
    }


}