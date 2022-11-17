import { SessionSocket } from "@lib/types/app"
import crypto from "crypto"
import * as DB from "@lib/db"
import * as NLog from "@lib/NyLog"

export default async (socket: SessionSocket) => {
    const sessionId = socket.handshake.query.session
    if (!(typeof sessionId == "string")) return
    console.log(sessionId)
    const existSid = await DB.isExistSession(sessionId)
    if (!existSid) return
    const sess = await DB.getSessionDataBySessionId(sessionId)
    if (!sess.user) return
    const userId = sess.user.id
    
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
                round: number;
                time: number;
            }
        } = JSON.parse(e.toString())
        if (!existSid) return send("generateRoom", {code: 403, value: "No Login"}) 
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
        const sha1 = crypto.createHash("sha1")
        sha1.update(`${rand(0, 999)}${category[0]}`)
        const roomId = sha1.digest("hex")
        if (!sess.isLogin) return send("generateRoom", {code: 403, value: "No Login"}) 
        if (!sess.user?.id) return
        await DB.generateRoom(roomId, category, sess.user!.id, option.round, option.time * 1000)
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
    async function getProfile() {
        const profile = await DB.getUserById(userId)
        return {
            id: profile.ID,
            nick: profile.NICK,
            exp: profile.EXP,
            money: profile.MONEY,
            item: profile.ITEM,
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