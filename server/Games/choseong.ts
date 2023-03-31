import Api from "../types/api";

export default class Choseong {
    data: Api.Rooms;
    constructor (room: Api.Rooms) {
        this.data = room
    }
}