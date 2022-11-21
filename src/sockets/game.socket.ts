import { SessionSocket } from "@lib/types/app"
import * as DB from "@lib/db"
import SocketIO from "socket.io"

export default async (io: SocketIO.Server, socket: SessionSocket, userId: string, roomId: string) => {
    const room = await DB.getRoomById(roomId)
    console.log(room)
    const categories: string[] = JSON.parse(room.CATEGORIES)
    
    await send("init", {
        maxRound: room.ROUND,
        maxTime: room.TIME,
        nowRound: room.NOW_ROUND
    })
    async function newRound() {
        room.NOW_CATEGORY = categories[Math.floor(Math.random()*categories.length)]
        room.ANSWER = await DB.getRandomWordByCategory(room.NOW_CATEGORY)
        console.log("dd", room)
        await DB.updateRoomByNewRound(room.ID, room.NOW_CATEGORY, room.ANSWER)
        await send("newRound", {
            question: cho_hangul(room.ANSWER),
            nowCategory: room.NOW_CATEGORY
        })
        function cho_hangul(str: string) {
            const cho = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
            let result = "";
            for(let i=0; i<str.length; i++) {
              const code = str.charCodeAt(i)-44032;
              if(code>-1 && code<11172) result += cho[Math.floor(code/588)];
              else result += str.charAt(i);
            }
            return result;
        }
    }
    await newRound()
    socket.on("newRound", newRound)
    socket.on("answer", async e => {
        const data: {value: string, time: number} = JSON.parse(e)
        if (room.ANSWER === data.value) {
            room.NOW_TIME -= data.time
            if (room.NOW_ROUND === room.ROUND)
                finish()
            else {
                room.EXP += (data.value.length * 5 + rand(0, 10))
                room.NOW_ROUND++
                await send("correct", {value: true, answer: data.value})
            }
        }
        else {
            room.WRONG++
            await send("correct", {value: false, answer: data.value})
        }
        console.log(room.ANSWER)
        await DB.updateRoomByRoomData(room)
    })
    socket.on("timeout", async () => {
        await finish()
    })
    async function finish() {
        await DB.setUserExpAndMoney(room.PLAYER, room.EXP, room.MONEY)
        await send("finish", room)
    }
    async function send(type: string, data?: any) {
        const accuracy = ((room.NOW_ROUND - 1) / (room.WRONG + room.ROUND))
        console.log(Math.round((9160 * accuracy) / room.TIME * room.NOW_TIME))
        room.MONEY = Math.round((9160 * accuracy) / room.TIME * room.NOW_TIME)
        await DB.updateRoomByRoomData(room)
        io.to(room.ID).emit("room", JSON.stringify({
            category: room.NOW_CATEGORY,
            wrong: room.WRONG,
            exp: room.EXP,
            money: room.MONEY,
            nowRound: room.NOW_ROUND,
            maxRound: room.ROUND,
            allTime: room.TIME,
            nowAllTime: room.NOW_TIME
        }))
        io.to(room.ID).emit(type, JSON.stringify(data))
    }
    function rand(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}