import express from 'express'
import cors from 'cors'
import robotjs from 'robotjs'
import dotenv from 'dotenv'
dotenv.config()

const app = express()
const PORT = process.env.PORT
const SOCKET = process.env.SOCKET
const HOST = process.env.HOST

app.set('view engine', 'ejs')
app.use(cors())
app.use(express.json())
robotjs.setMouseDelay(0)

app.get("/", (req, res) => {
    res.render('home')
})

function moveMouse(data) {
    let size = 250
    let cp = robotjs.getMousePos()
    let { click_type, x, y } = data
    if (click_type === 'left') {
        robotjs.mouseClick()
        return 'left'
    }
    if (click_type === 'right') {
        robotjs.mouseClick("right")
        return 'right'
    }
    for (let i = 1; i <= size; ++i) {
        let [nx, ny] = [cp.x + (1.5 * i / size) * x, cp.y + (1.5 * i / size) * y]
        robotjs.moveMouse(nx, ny)
    }
    return 'ok'
}

// -------- socket --------

import http from "http"
import { Server } from "socket.io"


const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "*",
    }
})

io.on('connection', (socket) => {
    socket.on("connected", (_id) => {
        console.log(socket.id + ' : connection\n  key : ' + _id)
        socket.emit('done', socket.id)
    })
    socket.on("move", (data) => {
        moveMouse(data)
    })
    socket.on("disconnect", function () {
        console.log(socket.id + " : disconnected")
    })
})

// ------ socket end ------


app.listen(PORT, () => {
    console.log(`\n ----- server http://${HOST}:${PORT} -----`)
})
server.listen(SOCKET, () => {
    console.log(` ----- socket http://${HOST}:${SOCKET} -----\n`)
})
