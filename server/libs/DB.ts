import knexModule from "knex";
import { DB } from "../types/DB";
import config from "./../configs/config.json"
// import kart from "./charactor.json"

const knex = knexModule({
    client: "mysql",
    connection: config.DB
})

export const GetUser = async (id: string) => {
    const data: DB.User[] = await knex
        .select("*")
        .where("id", id)
        .from("users")
    if (data.length === 0) return null
    return data[0]
}
export const ExistUser = async (id: string) => {
    return (await GetUser(id)) == null ? false : true
}
export const PushUser = async ({id, nick, email, pfp, provider}: {id: string, nick: string, email: string, pfp: string, provider: string}) => {
    !(await ExistUser(id)) && await knex("users")
        .insert({
            ID: id,
            NICK: nick,
            EMAIL: email,
            PFP: pfp,
            PROVIDER: provider
        })
}

export const LoginedBySession = async (sid: string) => {
    const data: DB.Session[] = await knex
        .select("*")
        .where("session_id", sid)
        .from("sessions")
    if (data.length === 0) return false
    else return true
}

export const GetTheme = async (tid: string) => {
    const data: DB.Theme[] = await knex
        .select("*")
        .where("ID", tid)
        .from("themes")
    return data
}
export const GetSubjectsList = async () => {
    const data: DB.Subjects[] = await knex
        .select("*")
        .from("subjects")
    return data
}
export const GetWordsBySubject = async (sid: string) => {
    const data: DB.Word[] = await knex
        .select("WORD")
        .where("SUBJECT", sid)
        .from("words")
    return data
}

// export const TEST = async () => {
//     for (const item of kart) {
//         if (item.id.includes("[R") || item.id.includes("[r")) continue
//         await knex("words")
//             .insert({
//                 WORD: item.name,
//                 SUBJECT: 3
//             })
//     }
// }