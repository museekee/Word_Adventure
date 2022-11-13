import maria, { FieldPacket } from "mysql2/promise"
import config from "@lib/config.json"
import DB from "./types/db"

const pool = maria.createPool({
    host: config.MARIA_HOST,
    user: config.MARIA_USER,
    password: config.MARIA_PASS,
    database: config.MARIA_DB,
})
export async function getCategories() {
    const conn = await pool.getConnection()
    const [rows]: [DB.Categories[], FieldPacket[]] = await conn.query(`SELECT * FROM categories`)
    conn.release()
    return rows
}
export async function generateRoom(id: string, categories: string[], player: string[], round: number, time: number) {
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
        ${conn.escape(JSON.stringify(player))},
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
export {
    pool
}