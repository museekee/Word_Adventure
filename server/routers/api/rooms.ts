import express from "express"
import config from "./../../configs/config.json"
import session from "express-session"
import Api from "../../types/api"
import { ExistSubject, GetWordsBySubjectId } from "../../libs/DB"
import Choseong from "../../Games/choseong"
const MySQLStore = require("express-mysql-session")(session)
const sessionStore = new MySQLStore(config.DB)
const router = express()

router.use(session({
    secret: config.sessionSercet,
    store: sessionStore,
    resave: false,
    saveUninitialized: false
}))

router.use(express.json())

const rooms: Choseong[] = []

router.post("/create", async (req, res) => {
    if (!req.session.passport) return res.status(403).send({code: 403, reason: "로그인이 되지 않음"})
    const userId = req.session.passport.user
    const { title, subjects, rounds, time }: {title: string, subjects: string[], rounds: number, time: number} = req.body.data
    
    
    const newSubjects = await Promise.all(subjects.map(async (v: string) => {
        if (await ExistSubject(v)) return v
        else return undefined
    }))
    if (!newSubjects || newSubjects.length === 0) return res.status(403).send({code: 403, reason: "알 수 없는 주제"})

    let maxRounds = 0
    for (const v of subjects) maxRounds += (await GetWordsBySubjectId(v)).length
    if (Math.ceil(rounds) <= 0 || Math.ceil(rounds) > maxRounds) return res.status(403).send({code: 403, reason: `올바르지 않은 라운드.\n최대 라운드는 ${maxRounds}라운드 입니다.`})
    
    const data = {
        title: title,
        user: userId,
        subjects: newSubjects as string[],
        rounds: rounds,
        time: time < 10 ? 10 : (time > 200 ? 200 : time) * 1000 // 10초보다 작거나 200초보다 클 때
    }
    const game = new Choseong(data)

    rooms.push(game)
    game.startTimer()

    return res.status(200).send({
        success:true,
        redirectUrl: `/room/${rooms.length - 1}`
    })
})

router.get("/:rid/data", async (req, res) => {
    const rid = parseInt(req.params.rid)
    if (rid >= rooms.length) return res.status(404).send({code: 404})
    if (rooms[rid].data.user !== req.session.passport?.user) return res.status(403).send({code: 403})
    return res.send(rooms[rid].data)
})


export default router