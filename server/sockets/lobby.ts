import socketIO from "socket.io";

export default async (socket: socketIO.Socket) => {
    // socket.on("LBchat", (data) => {
    //     socket.broadcast.to("lobby").emit("LBchat", { value: data.value })
    //     console.log(data.value)
    // })
    socket.on("CreateRoom", (data) => {
        socket.emit(data)
    })
}