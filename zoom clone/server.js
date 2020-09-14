const express = require('express');
const app = express();
const server = require('http').Server(app);
const router = express.Router();
const express_session = require('express-session');
const path = require('path');
const {
    v4: uuidv4
} = require('uuid');
const io = require('socket.io')(server);
const {
    ExpressPeerServer
} = require('peer');

app.use(
    express_session({
        resave : false,
        saveUninitialized :false,
        secret : "thisisthesecret"
    })
)

const peerServer = ExpressPeerServer(server, {
    debug: true,
})

app.use(express.static(path.join(__dirname, "public")))
app.use("/peerjs", peerServer);
app.set("view engine", "ejs");
app.set("views", "views");

router.get("/", (req, res) => {
    req.session.uuid = uuidv4();
    res.render("index", {
        uuid: req.session.uuid,
    });
})
router.post("/roomid", (req, res) => {
    res.render("roomid", {
        roomId : req.body.roomId,
    });
})
router.post("/:rooms", (req, res) => {
    res.redirect(`/${req.body.roomId}`)
})
router.get("/:id" ,(req,res)=>{
    res.render("room");
})


io.on("connection", socket => {
    socket.on("join-room", (roomid, userId) => {
        socket.join(roomid);
        socket.to(roomid).broadcast.emit("user-connected", userId);
        socket.on("message", message => {
            io.to(roomid).emit("createmessage", message);
        })
    })
})


app.use("/", router)
server.listen(process.env.PORT || 3400)

// function detectMob() {
//     const toMatch = [
//         /Android/i,
//         /webOS/i,
//         /iPhone/i,
//         /iPad/i,
//         /iPod/i,
//         /BlackBerry/i,
//         /Windows Phone/i
//     ];

//     return toMatch.some((toMatchItem) => {
//         return navigator.userAgent.match(toMatchItem);
//     });
// }
// alert(detectMob());