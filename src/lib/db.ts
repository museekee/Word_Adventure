import maria, { FieldPacket } from "mysql2/promise"
import config from "@lib/config.json"
import DB from "./types/db"
import Auth from "./types/auth"

const pool = maria.createPool({
    host: config.MARIA_HOST,
    user: config.MARIA_USER,
    password: config.MARIA_PASS,
    database: config.MARIA_DB,
})
export async function isExistSession(sid: string) {
    const conn = await pool.getConnection()
    const [rows]: [DB.Session[], FieldPacket[]] = await conn.query(`SELECT session_id from sessions WHERE session_id = ${conn.escape(sid)}`)
    conn.release()
    return rows.length === 0 ? false : true
}
export async function getSessionDataBySessionId(sid: string) {
    const conn = await pool.getConnection()
    const [rows]: [DB.Session[], FieldPacket[]] = await conn.query(`SELECT data FROM sessions WHERE session_id = ${conn.escape(sid)}`)
    conn.release()
    const data: Auth.DB_SessionData = JSON.parse(rows[0].data)
    return data
}
export async function getCategories() {
    const conn = await pool.getConnection()
    const [rows]: [DB.Categories[], FieldPacket[]] = await conn.query(`SELECT * FROM categories`)
    conn.release()
    return rows
}
export async function generateRoom(id: string, categories: string[], player: string, round: number, time: number) {
    const conn = await pool.getConnection()
    await conn.query(`INSERT INTO games (
        ID,
        CATEGORY,
        PLAYER,
        ROUND,
        TIME
    )
    VALUES
    (
        ${conn.escape(id)},
        ${conn.escape(JSON.stringify(categories))},
        ${conn.escape(player)},
        ${conn.escape(round)},
        ${conn.escape(time)}
    );`)
    conn.release()
}
export async function getRoomById(id: string) {
    const conn = await pool.getConnection()
    const [rows]: [DB.Room[], FieldPacket[]] = await conn.query(`SELECT * FROM games WHERE ID = ${conn.escape(id)} LIMIT 1;`)
    conn.release()
    return rows[0]
}
export async function getRandomWordByCategory(category: string) {
    const conn = await pool.getConnection()
    const [rows]: [DB.Word[], FieldPacket[]] = await conn.query(`SELECT WORD FROM words WHERE CATEGORY = ${conn.escape(category)} ORDER BY RAND() LIMIT 1;`)
    conn.release()
    return rows[0].WORD
}
export async function getCategoryNameByCategoryId(category: string) {
    const conn = await pool.getConnection()
    const [rows]: [DB.Categories[], FieldPacket[]] = await conn.query(`SELECT NAME FROM categories WHERE ID = ${conn.escape(category)} LIMIT 1;`)
    conn.release()
    return rows[0].NAME
}
export async function getCategoriesNameByCategoriesId(categories: string[]) {
    const names: string[] = []
    for (const v of categories) {
        names.push(await getCategoryNameByCategoryId(v))
    }
    return names
}
export async function getUserById(id: string) {
    const conn = await pool.getConnection()
    const [rows]: [DB.Users[], FieldPacket[]] = await conn.query(`SELECT * FROM users WHERE ID = ${conn.escape(id)}`)
    conn.release()
    return rows[0]
}
export async function joinUser(id: string, pw: string, nick: string) {
    const conn = await pool.getConnection()
    await conn.query(`INSERT INTO users (
        ID,
        PW,
        NICK
    )
    VALUES
    (
        ${conn.escape(id)},
        ${conn.escape(pw)},
        ${conn.escape(nick)}
    )`)
    conn.release()
}
export async function isExistId(id: string) {
    const conn = await pool.getConnection()
    const [rows]: [DB.Users[], FieldPacket[]] = await conn.query(`SELECT * FROM users WHERE ID = ${conn.escape(id)}`)
    conn.release()
    if (rows.length === 0) return false
    else return true
}
export async function setUserExpAndMoney(id: string, exp: number, money: number) {
    const conn = await pool.getConnection()
    await conn.query(`UPDATE users
    SET 
        EXP = EXP + ${conn.escape(exp)},
        MONEY = MONEY + ${conn.escape(money)}
    WHERE ID = ${conn.escape(id)};`)
    conn.release()
}
export async function getShopItemsByCategory(category: string) {
    const conn = await pool.getConnection()
    if (category === "all") {
        const [rows]: [DB.Shop[], FieldPacket[]] = await conn.query(`SELECT * FROM shop;`)
        conn.release()
        return rows
    }
    else {
        const [rows]: [DB.Shop[], FieldPacket[]] = await conn.query(`SELECT * FROM shop WHERE CATEGORY = ${conn.escape(category)};`)
        conn.release()
        return rows
    }
}
export async function getShopItemById(id: string) {
    const conn = await pool.getConnection()
    const [rows]: [DB.Shop[], FieldPacket[]] = await conn.query(`SELECT * FROM shop WHERE ID = ${conn.escape(id)}`)
    conn.release()
    return rows[0]
}
export async function buyItem(itemId: string, userId: string) {
    const conn = await pool.getConnection()
    const item = await getShopItemById(itemId)
    const user_inv: DB.UserItem = JSON.parse((await getUserById(userId)).ITEM)
    if (!user_inv[item.CATEGORY]) user_inv[item.CATEGORY] = {} // 카테고리도 없는 쌩 초보 계정일 때
    if (!user_inv[item.CATEGORY][itemId]) user_inv[item.CATEGORY][itemId] = {
        num: 0
    } // 카테고리는 있으나, 이 아이템은 처음 구매할 때
    user_inv[item.CATEGORY][itemId].num++
    await conn.query(`UPDATE users
    SET
        MONEY = MONEY + ${conn.escape(-item.PRICE)},
        ITEM = ${conn.escape(JSON.stringify(user_inv))}
    WHERE ID = '${userId}';`)
}
export {
    pool
}