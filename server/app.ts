import express from "express"
import loginRouter from "./routers/login"

const app = express()

app.use('/login', loginRouter);

app.listen(3840)