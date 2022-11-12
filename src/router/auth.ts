import express from "express"
import * as DB from "@lib/db"
import crypto from "crypto"
import session from "express-session"
const MySQLStore = require("express-mysql-session")(session)
import config from "@lib/config.json"
import Auth from "@lib/types/auth"
import * as NLog from "@lib/NyLog"

const sessionStore = new MySQLStore({}, DB.pool)
const router = express.Router()

router.use(session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore
}))
router.use(express.json())

router.post("/login", async (req, res) => {
    const body: {
        id: string,
        pw: string
    } = req.body
    const sess: Auth.Session = req.session
    const user = await DB.getUserById(body.id)
    if (!user || user.PW !== createHashedPassword(body.pw)) {
        return res.status(403).send({reason: "아이디 또는 비밀번호가 틀립니다."})
    }
    else {
        sess.isLogin = true
        sess.user = {
            id: user.ID,
            nick: user.NICK
        }
        sess.save()
        console.log("dd")
        return res.sendStatus(200)
    }
})
router.post("/join", async (req, res) => {
    const { id, nick, pw, pwC } = req.body
    const regs = {
        ID: /^(?:\w){1,30}$/g,
        PW: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,128}$/g,
        Nick: /^[\wㄱ-ㅎㅏ-ㅣ가-힣]{2,20}$/
    }
    if (!regs.ID.test(id)) return res.status(403).send({reason: "아이디가 조건에 맞지 않습니다."})
    else if (!regs.PW.test(pw)) return res.status(403).send({reason: "비밀번호가 조건에 맞지 않습니다."})
    else if (!regs.Nick.test(nick)) return res.status(403).send({reason: "닉네임이 조건에 맞지 않습니다."})
    else if (pw !== pwC) return res.status(403).send({reason: "비밀번호와 비밀번호 확인이 다릅니다."})
    else if (await DB.isExistId(id)) return res.status(403).send({reason: "중복된 아이디입니다."})
    else {
        await DB.joinUser(id, createHashedPassword(pw), nick)
        return res.sendStatus(200)
    }
})
router.post("/logout", async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(`dd" ${err}`)
            return res.sendStatus(500)
        }
        else return res.sendStatus(200)
    })
})
function createHashedPassword(text: string) {
    return crypto.createHash("sha512").update(text).digest("base64");
}
export = router