import maria from "mysql"
import config from "@lib/config.json"

const connection = maria.createConnection({
    host: config.MARIA_HOST,
    user: config.MARIA_USER,
    password: config.MARIA_PASS,
    database: config.MARIA_DB
})
connection.connect()
export default connection