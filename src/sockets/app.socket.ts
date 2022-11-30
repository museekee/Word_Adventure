import { SessionSocket } from "@lib/types/app"
import crypto from "crypto"
import * as DB from "@lib/db"
import * as NLog from "@lib/NyLog"

export default async (socket: SessionSocket, userId: string) => {
    send("getShop", {
        shop: await DB.getShopItemsByCategory("all")
    })
    send("profile", await getProfile())
    socket.on('disconnect', () => {
        NLog.Log("disconnected client", {
            in: "lobby websocket",
            id: socket.id
        })
    });
    socket.on("generateRoom", async e => {
        const data: {
            category: {[x: string]: boolean};
            option: {
                [x: string]: string | number | boolean;
                mode: string;
                round: number;
                time: number;
            }
        } = JSON.parse(e.toString())
        const validMode = ["choQuiz", "jungjongQuiz"]
        const category: string[] = []
        for (const key in data.category) {
            if (data.category[key]) category.push(key)
        }
        const option = data.option
        for (const key in option)
            if (!option[key]) 
                return send("generateRoom", {code: 403, value: "No option"})
        if (option.round <= 0 || option.time <= 0) return send("generateRoom", {code: 403, value: "Do not use minus"})
        if (category.length === 0) return send("generateRoom", {code: 403, value: "No category"})
        if (!validMode.includes(data.option.mode)) return send("generateRoom", {code: 403, value: "Invalid mode"})

        const sha1 = crypto.createHash("sha1")
        sha1.update(`${rand(0, 999)}${category[0]}`)
        const roomId = sha1.digest("hex")
        if (!userId) return send("generateRoom", {code: 403, value: "No Login"}) 
        await DB.generateRoom(roomId, category, data.option.mode, userId, option.round, option.time * 1000)
        return send("generateRoom", {code: 200, value: `/g/${roomId}`})
    })
    socket.on("getShop", async e => {
        const data: { value: string } = JSON.parse(e)
        return send("getShop", {
            shop: await DB.getShopItemsByCategory(data.value)
        })
    })
    socket.on("buyShopItem", async e => {
        const data: { value: string } = JSON.parse(e)
        const item = await DB.getShopItemById(data.value)
        const profile = await getProfile()
        if (profile.money < item.PRICE) return send("buyShopItem", {
            result: false,
            reason: "잔액이 부족합니다."
        })
        await DB.buyItem(item.ID, userId)
        return send("buyShopItem", {
            result: true
        })
    })
    socket.on("getProfile", async () => {
        send("profile", getProfile())
    })
    socket.on("equipItem", async e => {
        const data: { value: string } = JSON.parse(e)
        switch (await DB.equipItem(data.value, userId)) {
            case "Using":
                return send("equipItem", {code: 403, value: "이미 장착중인 아이템입니다."})
            case "Shortage":
                return send("equipItem", {code: 403, value: "대체 어떤일을 벌이고 계시기에... 0개인 아이템을 갖고있는 것도 모자라, 사용까지 하려고 하시나요?"})
            case "Success":
                return send("equipItem", {code: 200, value: "성공적으로 장착하였습니다."})
        }
    })
    socket.on("unEquipItem", async e => {
        const data: { value: string } = JSON.parse(e)
        await DB.unEquipItem(data.value, userId)
        return send("unEquipItem", {code: 200, value: "성공적으로 장착 해제 하였습니다."})
    })
    async function getProfile() {
        const profile = await DB.getUserById(userId)
        return {
            id: profile.ID,
            nick: profile.NICK,
            exp: profile.EXP,
            money: profile.MONEY,
            item: JSON.parse(profile.ITEM),
            equip: JSON.parse(profile.EQUIP)
        }
    }
    async function send(type: string, data: any) {
        socket.emit("profile", JSON.stringify(await getProfile()))
        socket.emit(type, JSON.stringify(data))
    }
}
function rand(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
}