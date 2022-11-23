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
        CATEGORIES,
        PLAYER,
        NOW_TIME,
        TIME,
        ROUND
    )
    VALUES
    (
        ${conn.escape(id)},
        ${conn.escape(JSON.stringify(categories))},
        ${conn.escape(player)},
        ${conn.escape(time)},
        ${conn.escape(time)},
        ${conn.escape(round)}
    );`)
    conn.release()
}
export async function updateRoomByNewRound(rid: string, nowCategory: string, nowAnswer: string) {
    const conn = await pool.getConnection()
    await conn.query(`UPDATE games
    SET
        NOW_CATEGORY = ${conn.escape(nowCategory)},
        ANSWER = ${conn.escape(nowAnswer)}
    WHERE
        ID = ${conn.escape(rid)}`)
    conn.release()
}
export async function updateRoomByRoomData(roomData: DB.Room) {
    const conn = await pool.getConnection()
    await conn.query(`UPDATE games
    SET
        NOW_ROUND = ${conn.escape(roomData.NOW_ROUND)},
        NOW_CATEGORY = ${conn.escape(roomData.NOW_CATEGORY)},
        NOW_TIME = ${conn.escape(roomData.NOW_TIME)},
        ANSWER = ${conn.escape(roomData.ANSWER)},
        WRONG = ${conn.escape(roomData.WRONG)},
        EXP = ${conn.escape(roomData.EXP)},
        MONEY = ${conn.escape(roomData.MONEY)}
    WHERE
        ID = ${conn.escape(roomData.ID)}`)
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
    if (!user_inv[item.CATEGORY][itemId]) user_inv[item.CATEGORY][itemId] = 0 // 카테고리는 있으나, 이 아이템은 처음 구매할 때
    user_inv[item.CATEGORY][itemId]++
    await conn.query(`UPDATE users
    SET
        MONEY = MONEY + ${conn.escape(-item.PRICE)},
        ITEM = ${conn.escape(JSON.stringify(user_inv))}
    WHERE ID = '${userId}';`)
}
/**
 * 
 * @param itemId 장착하기 윈하는 아이템
 * @param userId 유저의 아이디
 * @returns 결과
 */
export async function equipItem(itemId: string, userId: string): Promise<"Using" | "Shortage" | "Success"> {
    const item = await getShopItemById(itemId)
    {
        const user = await getUserById(userId)
        const equip: DB.UserEquip = JSON.parse(user.EQUIP)
        const userItem: DB.UserItem = JSON.parse(user.ITEM)
        for (const [key, value] of Object.entries(equip)) {
            if (value === itemId) return "Using"
        }
        // ^ 사용중(같은 것을 이미 착용 중)
        if (userItem[item.CATEGORY][itemId] <= 0) return "Shortage"
        // ^ 어떤 이유에서인지 아이템을 0개 갖고있을 때
        if (equip[item.CATEGORY])
            await unEquipItem(item.CATEGORY, userId, true)
            // ^ 아이템 장착 해제
        // ^ 장착한 아이템이 있으면
    }
    // ! 검사 완료
    const conn = await pool.getConnection()
    const user = await getUserById(userId)
    const userItem: DB.UserItem = JSON.parse(user.ITEM)
    const equip: DB.UserEquip = JSON.parse(user.EQUIP)
    userItem[item.CATEGORY][itemId]--
    // ^ 장착하고 싶은 아이템 뺏기(-1)
    equip[item.CATEGORY] = itemId
    // ^ 아이템 장착시키기
    conn.query(`UPDATE users
    SET
        EQUIP = ${conn.escape(JSON.stringify(equip))},
        ITEM = ${conn.escape(JSON.stringify(userItem))}
    WHERE ID = ${conn.escape(userId)}`)
    conn.release()
    return "Success"
}
export async function unEquipItem(category: string, userId: string, quetly?: boolean) {
    const conn = await pool.getConnection()
    const user = await getUserById(userId)
    const equip: DB.UserEquip = JSON.parse(user.EQUIP)
    const item: DB.UserItem = JSON.parse(user.ITEM)
    item[category][equip[category]]++
    // ^ 다시 돌려주기(+1)
    equip[category] = ""
    // ^ 돌려줬으니 없애기
    conn.query(`UPDATE users
    SET
        ITEM = ${conn.escape(JSON.stringify(item))},
        EQUIP = ${conn.escape(JSON.stringify(equip))}
    WHERE ID = ${conn.escape(userId)}`)
    conn.release()
    if (!quetly) return true
}
export {
    pool
}