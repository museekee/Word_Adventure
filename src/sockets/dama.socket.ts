import { SessionSocket } from "@lib/types/app"
import * as DB from "@lib/db"
import SocketIO from "socket.io"

export default async (io: SocketIO.Server, socket: SessionSocket, roomId: string, observe: boolean, quizType: "choQuiz" | "jungjongQuiz") => {
    const room = await DB.getRoomById(roomId)
    const categories: string[] = JSON.parse(room.CATEGORIES)
    const used: string[] = JSON.parse(room.USED)

    await send("init", {
        maxRound: room.ROUND,
        maxTime: room.TIME,
        nowRound: room.NOW_ROUND
    })
    async function newRound() {
        if (observe) return await send("newRound", {
            question: disassemble_hangul(room.ANSWER),
            nowCategory: room.NOW_CATEGORY
        })
        const newCategory = categories[Math.floor(Math.random()*categories.length)]
        const newAnswer = await DB.getRandomWordByCategory(newCategory)
        const newQuestion = disassemble_hangul(newAnswer)
        if (!used.includes(newQuestion)) {
            used.push(newQuestion)
            room.USED = JSON.stringify(used)
            room.NOW_CATEGORY = newCategory
            room.ANSWER = newAnswer
            await DB.updateRoomByRoomData(room)
            await send("newRound", {
                question: newQuestion,
                nowCategory: room.NOW_CATEGORY
            })
        }
        else await newRound()
    }
    await newRound()
    socket.on("newRound", newRound)
    socket.on("answer", async e => {
        if (observe) return await send("observe", {value: "플레이어 외의 유저는 채팅을 칠 수 없습니다."})
        const data: {value: string, time: number} = JSON.parse(e)
        room.NOW_TIME = data.time
        if (disassemble_hangul(room.ANSWER) === disassemble_hangul(data.value)) {
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
    socket.on("useItem", async e => {
        if (observe) return await send("observe", {value: "플레이어 외의 유저는 아이템을 사용할 수 없습니다."})
        const data: {value: string} = JSON.parse(e)
        console.log(data)
        const user = await DB.getUserById(room.PLAYER)
        switch (data.value) {
            case "hint": {
                if (user.MONEY < 1000) return await send("useItem", {code: 403, value: `돈이 부족합니다.<br/>${1000 - user.MONEY}담 필요`})
                
                return;
            }
            case "skip": {
                if (user.MONEY < 10000) return await send("useItem", {code: 403, value: `돈이 부족합니다.<br/>${10000 - user.MONEY}담 필요`})
                await DB.setUserExpAndMoney(room.PLAYER, 0, -10000)
                if (room.NOW_ROUND === room.ROUND)
                    return await finish()
                else {
                    room.EXP += (data.value.length * 5 + rand(0, 10))
                    room.NOW_ROUND++
                    return await send("correct", {value: true, answer: room.ANSWER})
                }
            }
        }
    })
    socket.on("timeout", async () => {
        if (observe) return
        await finish()
    })
    socket.on("disconnect", async (reason) => {
        if (observe) return
        await DB.deleteRoomById(room.ID)
    })
    async function finish() {
        if (!await DB.isExistRoom(room.ID)) return
        if (observe) return await send("finish", room)
        await DB.setUserExpAndMoney(room.PLAYER, room.EXP, room.MONEY)
        room.CATEGORIES = JSON.stringify(await DB.getCategoriesNameByCategoriesId(JSON.parse(room.CATEGORIES)))
        await send("finish", room)
        await DB.deleteRoomById(room.ID)
    }
    function disassemble_hangul(str: string) {
        const korean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
        const result = []
        for (let i = 0; i < str.length; i++) {
            const word = String.fromCharCode(str.charCodeAt(i))
            if (!korean.test(word)) {
                result.push(word)
                continue
            }
            const uni = str.charCodeAt(i) - 44032;
            const cho = ((uni / 28) / 21) + 4352;
            const jung = ((uni / 28) % 21) + 4449;
            const jong = (uni % 28) + 4519;
            if (quizType === "choQuiz") result.push(String.fromCharCode(cho))
            else if (quizType === "jungjongQuiz") result.push(String.fromCharCode(4447) + String.fromCharCode(jung) + (jong !== 4519 ? String.fromCharCode(jong) : ""))
        }
        return result.join("")
    }
    async function send(type: string, data?: any) {
        if (observe) {
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