import express from "express"
import config from "./../configs/config.json"
import session from "express-session"
import { GetSubjectsList, GetTheme, GetUser, GetWordsBySubject } from "../libs/DB"
const MySQLStore = require("express-mysql-session")(session)
const sessionStore = new MySQLStore(config.DB)
import app from "./../types/app"
import roomsRouter from "./api/rooms"

const router = express()

router.use(session({
    secret: config.sessionSercet,
    store: sessionStore,
    resave: false,
    saveUninitialized: false
}))

router.use(express.json())

router.use("/rooms", roomsRouter)

router.get("/myData", async (req, res) => {
    // console.log(req.session.passport?.user)
    if (!req.session.passport) return res.status(404).send({code: 404})
    const userId = req.session.passport.user
    if (userId) {
        const user = await GetUser(userId)
        console.log(user)
        if (!user) return res.status(404).send({code: 404})
        return res.send({
            id: user.ID,
            nick: user.NICK,
            pfp: user.PFP,
            sessId: req.session.id
        })
    }
    return res.status(404).send({code: 404})
})

router.get("/getSubjects", async (req, res) => {
    const result: {
        id: string,
        name: string,
        subjects: {
            id: string,
            name: string,
            degree: number,
            bgColor: string,
            wordCount: number
        }[]
    }[] = []
    for (const item of await GetSubjectsList()) {
        let pushed = false
        const subject = {
            id: item.ID,
            name: item.NAME,
            degree: item.BG_DEGREE,
            bgColor: item.BG_COLORS,
            wordCount: (await GetWordsBySubject(item.NO)).length
        }
        for (const theme of result) {
            if (item.THEME === theme.id) {
                theme.subjects.push(subject)
                pushed = true
            }
        }
        if (!pushed) {
            result.push({
                id: item.THEME,
                name: (await GetTheme(item.THEME))[0].NAME,
                subjects: [subject]
            })
        }
    }
    return res.send(result)
})

router.get("/ddd", (req, res) => {
    res.send({id: "dd", name: "ddddd"})
})

export default router