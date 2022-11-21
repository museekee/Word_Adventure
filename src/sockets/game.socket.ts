import { SessionSocket } from "@lib/types/app"
import * as DB from "@lib/db"

export default async (socket: SessionSocket, userId: string, roomId: string) => {
    const room = await DB.getRoomById(roomId)
    const categories: string[] = JSON.parse(room.CATEGORY)

    socket.on("newRound", async () => {
        const category: string = categories[Math.floor(Math.random()*categories.length)]
        const word = await DB.getRandomWordByCategory(category)
        await DB.updateRoomByNewRound(room.ID, category, word)
        send("newRound", {
            question: cho_hangul(word),
            nowRound: room.NOW_ROUND,
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
    })
    socket.on("answer", async e => {
        const data: {value: string, time: number} = JSON.parse(e)
        if (room.ANSWER === data.value) {
            room.NOW_TIME -= data.time
            if (room.NOW_ROUND === room.ROUND)
                finish()
            else {
                room.EXP += (data.value.length * 5 + rand(0, 10))
                room.NOW_ROUND++
                await send("correct", {value: true})
            }
        }
        else {
            room.WRONG++
            await send("correct", {value: false})
        }
        console.log(room.ANSWER)
        await DB.updateRoomByRoomData(room)
    })
    socket.on("timeout", async () => {
        await finish()
    })
    async function finish() {
        await DB.setUserExpAndMoney(room.PLAYER, room.EXP, room.MONEY)
        await send("finish")
    }
    async function send(type: string, data?: any) {
        socket.to(room.ID).emit("room", JSON.stringify({
            wrong: room.WRONG,
            exp: room.EXP,
            money: room.MONEY
        }))
        socket.to(room.ID).emit(type, JSON.stringify(data))
    }
    function rand(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}