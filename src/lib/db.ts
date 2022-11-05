import maria, { FieldPacket } from "mysql2/promise"
import config from "@lib/config.json"
import DB from "./types/db"

const pool = maria.createPool({
    host: config.MARIA_HOST,
    user: config.MARIA_USER,
    password: config.MARIA_PASS,
    database: config.MARIA_DB,
})
const getCategories = async () => {
    const conn = await pool.getConnection()
    const [rows, fields]: [DB.Categories[], FieldPacket[]] = await conn.query(`SELECT * FROM categories`)
    conn.release()
    return rows
}
const generateRoom = async (id: string, categories: string[], round: number, time: number) => {
    const conn = await pool.getConnection()
    await conn.query(`INSERT INTO games (
        ID,
        CATEGORY,
        ROUND,
        TIME
    )
    VALUES
    (
        '${id}',
        '${JSON.stringify(categories)}',
        '${round}',
        '${time}'
    );`)
    conn.release()
}
const getRoomById = async (id: string) => {
    const conn = await pool.getConnection()
    const [rows, fields]: [DB.Room[], FieldPacket[]] = await conn.query(`SELECT * FROM games WHERE ID = '${id}' LIMIT 1;`)
    conn.release()
    return rows[0]
}
const getRandomWordByCategory = async (category: string) => {
    const conn = await pool.getConnection()
    const [rows, fields]: [DB.Word[], FieldPacket[]] = await conn.query(`SELECT WORD FROM words WHERE CATEGORY = '${category}' ORDER BY RAND() LIMIT 1;`)
    conn.release()
    return rows[0].WORD
}
const getCategoryNameByCategoryId = async (category: string) => {
    const conn = await pool.getConnection()
    const [rows, fields]: [DB.Categories[], FieldPacket[]] = await conn.query(`SELECT NAME FROM categories WHERE ID = '${category}' LIMIT 1;`)
    conn.release()
    return rows[0].NAME
}
const getCategoriesNameByCategoriesId = async (categories: string[]) => {
    const names: string[] = []
    for (const v of categories) {
        names.push(await getCategoryNameByCategoryId(v))
    }
    return names
}
export = {
    getCategories,
    generateRoom,
    getRoomById,
    getRandomWordByCategory,
    getCategoryNameByCategoryId,
    getCategoriesNameByCategoriesId
}