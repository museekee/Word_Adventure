import { SessionSocket } from "@lib/types/app"
import * as DB from "@lib/db"
import SocketIO from "socket.io"

export default async (io: SocketIO.Server, socket: SessionSocket, roomId: string, userType: "player" | "observer") => {
    const room = await DB.getRoomById(roomId)
    const categories: string[] = JSON.parse(room.CATEGORIES)
    
    await send("init", {
        maxRound: room.ROUND,
        maxTime: room.TIME,
        nowRound: room.NOW_ROUND
    })
    async function newRound() {
        if (userType !== "player") return await send("newRound", {
            question: cho_hangul(room.ANSWER),
            nowCategory: room.NOW_CATEGORY
        })
        room.NOW_CATEGORY = categories[Math.floor(Math.random()*categories.length)]
        room.ANSWER = await DB.getRandomWordByCategory(room.NOW_CATEGORY)
        await DB.updateRoomByNewRound(room.ID, room.NOW_CATEGORY, room.ANSWER)
        await send("newRound", {
            question: cho_hangul(room.ANSWER),
            nowCategory: room.NOW_CATEGORY
        })
    }
    await newRound()
    socket.on("newRound", newRound)
    socket.on("answer", async e => {
        if (userType !== "player") return await send("observe", {value: "플레이어 외의 유저는 채팅을 칠 수 없습니다."})
        const data: {value: string, time: number} = JSON.parse(e)
        room.NOW_TIME = data.time
        if (cho_hangul(room.ANSWER) === cho_hangul(data.value)) {
            for (const item of await DB.getWordsByCategoryId(room.NOW_CATEGORY, 0, 1)) {
                if (item.WORD === data.value) {
                    if (room.NOW_ROUND === room.ROUND)
                        return await finish()
                    else {
                        room.EXP += (data.value.length * 5 + rand(0, 10))
                        room.NOW_ROUND++
                        return await send("correct", {value: true, answer: data.value})
                    }
                }
            }
            room.WRONG++
            await send("correct", {value: false, answer: data.value})
        }
        else {
            room.WRONG++
            await send("correct", {value: false, answer: data.value})
        }
        await DB.updateRoomByRoomData(room)
    })
    socket.on("timeout", async () => {
        if (userType !== "player")
        await finish()
    })
    socket.on("disconnect", async (reason) => {
        if (userType !== "player") return
        await DB.deleteRoomById(room.ID)
    })
    async function finish() {
        if (userType === "observer") return await send("finish", room)
        await DB.setUserExpAndMoney(room.PLAYER, room.EXP, room.MONEY)
        room.CATEGORIES = JSON.stringify(await DB.getCategoriesNameByCategoriesId(JSON.parse(room.CATEGORIES)))
        await send("finish", room)
        await DB.deleteRoomById(room.ID)
    }
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
    async function send(type: string, data?: any) {
        if (userType !== "player") {
            socket.emit("room", JSON.stringify({
                category: room.NOW_CATEGORY ? await DB.getCategoryNameByCategoryId(room.NOW_CATEGORY) : null,
                wrong: room.WRONG,
                exp: room.EXP,
                money: room.MONEY,
                nowRound: room.NOW_ROUND,
                maxRound: room.ROUND,
                allTime: room.TIME,
                nowAllTime: room.NOW_TIME
            }))
            socket.emit(type, JSON.stringify(data))
            return
        }
        const accuracy = ((room.NOW_ROUND - 1) / (room.WRONG + room.ROUND))
        room.MONEY = Math.round((9160 * accuracy) / room.TIME * room.NOW_TIME)
        await DB.updateRoomByRoomData(room)
        io.to(room.ID).emit("room", JSON.stringify({
            category: room.NOW_CATEGORY ? await DB.getCategoryNameByCategoryId(room.NOW_CATEGORY) : null,
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