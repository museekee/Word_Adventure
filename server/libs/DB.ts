import knexModule from "knex";
import { DB } from "../types/DB";
import config from "./../configs/config.json"

const knex = knexModule({
    client: "mysql",
    connection: config.DB
})

export const GetUser = async (id: string) => {
    const data: DB.User[] = await knex
        .select("*")
        .where("id", id)
        .from("users")
    if (data.length == 0) return null
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