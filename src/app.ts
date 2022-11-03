import express from "express"
import config from "@lib/config.json"
import path from "path"
import * as NyLog from "@lib/NyLog"
import db from "@lib/db"
import crypto from "crypto"

const app = express()

app.set("view engine", "pug")
app.set("views",  path.join(__dirname, "views"))
app.use(express.json())
app.use("/assets", express.static(path.join(__dirname, "assets")))
app.use("/g", require("@router/game"))


app.get("/", async (req, res) => {
    res.render("main", require("@lib/lang/ko_KR.json"))
})

app.post("/tryMakeGame", async (req, res) => {
    const category: string[] = []
    for (const key in req.body.category) {
        if (req.body.category[key]) category.push(key)
    }
    for (const key in req.body.option)
        if (!req.body.option[key]) 
            return res.status(403).send({reason: "No option"})
    if (category.length === 0) return res.status(403).send({reason: "No category"})
    const sha1 = crypto.createHash("sha1")
    sha1.update(`${rand(0, 999)}${category[0]}`)
    const roomId = sha1.digest("hex")
    db.query(`INSERT INTO games (
        ID,
        CATEGORY,
        ROUND,
        TIME
    )
    VALUES
    (
        '${roomId}',
        '${JSON.stringify(category)}',
        '${req.body.option.round}',
        '${req.body.option.time * 1000}'
    );`)
    res.redirect(`/g/${roomId}`)
})

app.listen(config.PORT, () => {
    NyLog.Success(`Express server launched on ${config.PORT}`)
})

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}