import express from "express"
import wsModule from "ws"
import config from "@lib/config.json"
import * as NLog from "@lib/NyLog"
import db from "@lib/db"

const wssv = new wsModule.Server({
    port: config.GAME_PORT
})
const rooms: any = {}
wssv.on("connection", async (ws, req) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    NLog.Log("Connect game server", { ip: ip })
    
    ws.on("message", (e) => {
        const data = JSON.parse(e.toString())
        // console.log(data)
        switch (data.type) {
            case "start": {
                db.query(`SELECT * FROM games WHERE ID = '${data.id}' LIMIT 1;`, (err, rows, fields) => {
                    const row = JSON.parse(JSON.stringify(rows[0]))
                    const category = randomArray(JSON.parse(row.CATEGORY))
                    db.query(`SELECT WORD FROM words WHERE CATEGORY = '${category}' ORDER BY RAND() LIMIT 1;`, (errt, rows, fieldst) => {
                        const row = JSON.parse(JSON.stringify(rows[0]))
                        rooms[data.id].correct_answer = row.WORD
                        send({
                            type: "word",
                            value: cho_hangul(row.WORD)
                        })
                    })
                })
                break;
            }
            case "answer": {
                if (rooms[data.id].correct_answer === data.value) send({
                    type: "correct",
                    value: true
                })
                else send({
                    type: "correct",
                    value: false
                })
                console.log(rooms[data.id].correct_answer)
            }
        }
    })
    ws.on("error", (e) => {
        NLog.Error(e.message, { stack: e.stack })
    })
    ws.on("close", (code) => {
        NLog.Log("Disconnect game server", { ip: ip, code: code })
    })
    function send(data: object) {
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

router.get("/:roomId", (req, res) => {
    db.query(`SELECT * FROM games WHERE ID = '${req.params.roomId}' LIMIT 1;`, (e, rows) => {
        if (rows.length === 0) return res.sendStatus(404)
        const ko_KR = require("@lib/lang/ko_KR.json")
        ko_KR.ws = `ws://${req.get("host")}:${config.GAME_PORT}`
        rooms[req.params.roomId] = {}
        return res.render("game", ko_KR)
    })
})

function randomArray(arr: unknown[]): unknown {
    return arr[Math.floor(Math.random()*arr.length)]
}

export = router