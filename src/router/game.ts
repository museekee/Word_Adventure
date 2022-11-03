import express from "express"
import wsModule from "ws"
import config from "@lib/config.json"
import * as NLog from "@lib/NyLog"
import db from "@lib/db"
import Game from "@lib/types/game"
import ko_KR from "@lib/lang/ko_KR.json"

const wssv = new wsModule.Server({
    port: config.GAME_PORT
})
const rooms: Game.Rooms = {}
const ko_KR_category: {[x: string]: {name: string, description: string}} = ko_KR.category
wssv.on("connection", async (ws, req) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    NLog.Log("Connect game server", { ip: ip })
    
    ws.on("message", (e) => {
        const data = JSON.parse(e.toString())
        const myroom = rooms[data.id]
        // console.log(data)
        switch (data.type) {
            case "start": {
                db.query(`SELECT * FROM games WHERE ID = '${data.id}' LIMIT 1;`, (err, rows: Game.RoomsDB[], fields) => {
                    const row: Game.RoomsDB = JSON.parse(JSON.stringify(rows[0]))
                    const category: string = randomArray(JSON.parse(row.CATEGORY)).toString()
                    db.query(`SELECT WORD FROM words WHERE CATEGORY = '${category}' ORDER BY RAND() LIMIT 1;`, (errt, rows, fieldst) => {
                        const row = JSON.parse(JSON.stringify(rows[0]))
                        myroom.answer = row.WORD
                        myroom.category = ko_KR_category[category].name
                        send({
                            type: "start",
                            word: cho_hangul(row.WORD)
                        }, data.id)
                    })
                })
                break;
            }
            case "answer": {
                if (myroom.answer === data.value) {
                    myroom.exp + (data.value.length * 5 + rand(0, 10))
                    myroom.time -= (myroom.time - data.time)
                    console.log(data)
                    console.log(myroom)
                    if (myroom.now_round === myroom.max_round) {
                        send({
                            type: "finish"
                        }, data.id)
                    }
                    else {
                        myroom.now_round++
                        send({
                            type: "correct",
                            value: true
                        }, data.id)
                    }
                }
                else {
                    myroom.wrong++
                    send({
                        type: "correct",
                        value: false
                    }, data.id)
                }
                console.log(myroom.answer)
            }
        }
    })
    ws.on("error", (e) => {
        NLog.Error(e.message, { stack: e.stack })
    })
    ws.on("close", (code) => {
        NLog.Log("Disconnect game server", { ip: ip, code: code })
    })
    function send(data: Game.WsSend, id?: string) {
        if (id) {
            const myroom = rooms[id]
            data.category = myroom.category
            data.wrong = myroom.wrong
            data.now_round = myroom.now_round
            data.exp = myroom.exp
            data.max_round = myroom.max_round
            data.time = myroom.time
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

router.get("/:roomId", (req, res) => {
    db.query(`SELECT * FROM games WHERE ID = '${req.params.roomId}' LIMIT 1;`, (e, rows: Game.RoomsDB[]) => {
        if (rows.length === 0) return res.sendStatus(404)
        rooms[req.params.roomId] = {
            answer: undefined,
            category: undefined,
            exp: 0,
            wrong: 0,
            now_round: 1,
            max_round: rows[0].ROUND,
            time: rows[0].TIME
        }
        return res.render("game", {
            ko_KR,
            ws: `ws://${req.get("host")}:${config.GAME_PORT}`
        })
    })
})

function randomArray(arr: any[]): any {
    return arr[Math.floor(Math.random()*arr.length)]
}
function rand(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export = router