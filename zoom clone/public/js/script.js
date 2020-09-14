const socket = io();
let video, sended;
let vid_cont = "unmuted",
    aud_cont = "unmuted";

let video_element = document.createElement("video");
var peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "3400",
});

video_element.muted = true;
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
}).then(stream => {
    // console.log(stream);
    video = stream;
    addVideo(video_element, stream);

    peer.on("call", call => {
        call.answer(stream)
        const video_html = document.createElement("video");
        call.on("stream", userVideo => {
            addVideo(video_html, userVideo);
        });
    })

    socket.on("user-connected", (userid) => {
        connect_new_user(userid, video);
    })

    const input = document.querySelector("[name=text]");

    const button = document.querySelector("button");

    button.addEventListener("click", (e) => {
        if (input.value != "") {
            socket.emit("message", input.value)
            input.value = "";
        }
    })

    document.querySelector("html").addEventListener("keypress", (evt) => {
        if (evt.keyCode == 13 && input.value != "") {
            socket.emit("message", input.value)
            input.value = ""
        }
    })

    socket.on("createmessage", message => {
        let li = document.createElement("li");
        li.className += "receiver";
        li.textContent = message;
        console.log(li);
        // senders_message = li;
        document.querySelector("ul").appendChild(li);
    })
}).catch(err => {
    console.log(err)
})


const connect_new_user = (userid, stream) => {
    const call = peer.call(userid, stream)
    const video = document.createElement("video");
    call.on("stream", userStream => {
        addVideo(video, userStream);
    })
}
const addVideo = (video_element, stream) => {
    video_element.srcObject = stream;
    video_element.addEventListener("loadedmetadata", () => {
        video_element.play();
    })
    let video_html = document.querySelector(".video-grid");
    console.log(video_html);
    video_html.append(video_element);
}
peer.on("open", id => {
    socket.emit("join-room", roomid, id, name);
})

document.querySelector(".menu-bar").addEventListener("click", () => {
    document.querySelector(".main-right").classList.add("main-right-trans")
})

document.querySelector(".end").addEventListener("click", () => {

})
document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".main-right").classList.remove("main-right-trans")
    document.querySelector(".main-right").classList.add("hide")
})

document.querySelector(".mic").addEventListener("click", (evt) => {
    if (evt.target.src == "http://localhost:3400/icons/mic_off-24px.svg") {
        evt.target.src = "icons/mic-24px.svg"
        aud_cont = "unmuted"
        console.log("unmuted");
        navigator.mediaDevices.getUserMedia({
            video: (vid_cont == "unmute") ? true : false,
            audio: true
        }).then((stream) => {
            addVideo(video_element, stream);
        }).catch((err) => {
            console.log(err);
        });
        return evt.target.classList.remove("mute");
    }
    console.log("mute");
    aud_cont = "mute"
    navigator.mediaDevices.getUserMedia({
        video: (vid_cont == "mute") ? true : false,
        audio: false
    }).then((stream) => {
        addVideo(video_element, stream);
    }).catch((err) => {
        console.log(err);
    });
    evt.target.src = "icons/mic_off-24px.svg";
    evt.target.classList.add("mute");
})
document.querySelector(".face").addEventListener("click", (evt) => {
    if (evt.target.src == "http://localhost:3400/icons/videocam_off-24px.svg") {
        evt.target.src = "icons/videocam-24px.svg"
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: (aud_cont == "mute") ? true : false,
        }).then(stream => {
            addVideo(video_element, stream);
        }).catch(err => {
            console.log(err);
        })
        vid_cont = "unmuted";
        console.log("on");
        return evt.target.classList.remove("mute");
    }
    console.log("off");
    vid_cont = "mute";
    navigator.mediaDevices.getUserMedia({
        video: false,
        audio: (vid_cont == "mute") ? true : false
    }).then(stream => {
        addVideo(video_element, stream);
    }).catch(err => {
        console.log(err);
    })
    evt.target.src = "icons/videocam_off-24px.svg";
    console.log(evt.target.src);
    evt.target.classList.add("mute");
})