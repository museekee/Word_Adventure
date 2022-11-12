import express from "express"
import wsModule from "ws"
import config from "@lib/config.json"
import * as NLog from "@lib/NyLog"
import * as DB from "@lib/db"
import Game from "@lib/types/game"
import Auth from "@lib/types/auth"
import session from "express-session"
const MySQLStore = require("express-mysql-session")(session)

// 디코 로그인 추가
const wssv = new wsModule.Server({
    port: config.GAME_PORT
})
const rooms: Game.Rooms = {}
wssv.on("connection", async (ws, req) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    NLog.Log("Connect game server", { ip: ip })
    
    ws.on("message", async (e) => {
        const data = JSON.parse(e.toString())
        const myroom = rooms[data.id]
        // console.log(data)
        switch (data.type) {
            case "start": {
                const room = await DB.getRoomById(data.id)
                const categories = JSON.parse(room.CATEGORY)
                myroom.categories = categories
                const category: string = randomArray(categories)
                const word = await DB.getRandomWordByCategory(category)
                myroom.answer = word
                myroom.category = await DB.getCategoryNameByCategoryId(category)
                await send({
                    type: "start",
                    word: cho_hangul(word)
                }, data.id)
                break;
            }
            case "answer": {
                if (myroom.answer === data.value) {
                    myroom.exp += (data.value.length * 5 + rand(0, 10))
                    myroom.time -= (myroom.time - data.time)
                    if (myroom.now_round === myroom.max_round) {
                        myroom.now_round++
                        await send({
                            type: "finish"
                        }, data.id)
                    }
                    else {
                        myroom.now_round++
                        await send({
                            type: "correct",
                            value: true
                        }, data.id)
                    }
                }
                else {
                    myroom.wrong++
                    await send({
                        type: "correct",
                        value: false
                    }, data.id)
                }
                console.log(myroom.answer)
                break
            }
            case "timeout":
                await send({
                    type: "finish"
                }, data.id)
                break
        }
    })
    ws.on("error", (e) => {
        NLog.Error(e.message, { stack: e.stack })
    })
    ws.on("close", (code) => {
        NLog.Log("Disconnect game server", { ip: ip, code: code })
    })
    async function send(data: Game.WsSend, id?: string) {
        if (id) {
            const myroom = rooms[id]
            data.category = myroom.category
            data.wrong = myroom.wrong
            data.now_round = myroom.now_round
            data.exp = myroom.exp
            data.max_round = myroom.max_round
            data.time = myroom.time
            const categories = await DB.getCategoriesNameByCategoriesId(myroom.categories!)
            data.categories = categories
            const accuracy = ((myroom.now_round - 1) / (myroom.wrong + myroom.max_round))
            data.dam = Math.round((9160 * accuracy) / myroom.def_time * (myroom.time === myroom.def_time ? 0 : myroom.time))
        }
        ws.send(JSON.stringify(data))
    }
    function cho_hangul(str: string) {
        const cho = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
        let result = "";
        for(let i=0; i<str.length; i++) {
          const code = str.charCodeAt(i)-44032;
          if(code>-1 && code<11172) result += cho[Math.floor(code/588)];
          else result += str.charAt(i);
        }
        return result;
    }
})
const router = express.Router()
const sessionStore = new MySQLStore({}, DB.pool)
router.use(session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore
}))
router.use((req, res, next) => {
    const sess: Auth.Session = req.session
    res.locals.session = sess
    console.log(sess)
    next()
})
router.get("/:roomId", async (req, res) => {
    const room = await DB.getRoomById(req.params.roomId)
    if (room.length === 0) return res.sendStatus(404)
    console.log(room)
    rooms[req.params.roomId] = {
        answer: undefined,
        category: undefined,
        exp: 0,
        wrong: 0,
        now_round: 1,
        max_round: room.ROUND,
        time: room.TIME,
        def_time: room.TIME,
        categories: undefined
    }
    return res.render("game", {
        ws: `ws://${req.get("host")}:${config.GAME_PORT}`
    })
})

function randomArray(arr: any[]): any {
    return arr[Math.floor(Math.random()*arr.length)]
}
function rand(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export = router