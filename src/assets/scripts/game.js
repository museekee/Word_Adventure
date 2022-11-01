const wsurl = document.getElementById("wsurl").innerText
const myid = window.location.href.replace(window.location.origin, "").replace("/g/", "")
const ws = new WebSocket(wsurl)
const Word = document.getElementById("Word")
const WordWrite = document.getElementById("Word-write")
let nowquestion = ""
let myanswer = ""
ws.onopen = () => {
    console.log("connected ws server")
    send({
        type: "start"
    })
}
ws.onclose = () => {
    alert("서버와의 연결이 끊어졌습니다.");
}
ws.onerror = e => {
    alert("서버와 접속중 에러가 발생했습니다.", e);
}
ws.onmessage = async e => {
    data = JSON.parse(e.data)
    switch (data.type) {
        case "word": {
            nowquestion = data.value
            Word.innerText = nowquestion
            break;
        }
        case "correct": {
            WordWrite.value = ""
            if (data.value) {
                Word.style.color = "#ffffff"
                Word.innerText = myanswer
                await sleep(1000)
                send({
                    type: "start"
                })
            }
            else {
                Word.style.color = "#ff0000"
                Word.innerText = myanswer
                await sleep(1000)
                Word.style.color = "#ffffff"
                Word.innerText = nowquestion
            }
        }
    }

}
function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}
function answer() {
    myanswer = WordWrite.value
    send({
        type: "answer",
        value: myanswer
    })
}
function send(data) {
    data.id = myid
    ws.send(JSON.stringify(data))
}