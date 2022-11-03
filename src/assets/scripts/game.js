const wsurl = document.getElementById("wsurl").innerText
const myid = window.location.href.replace(window.location.origin, "").replace("/g/", "")
const ws = new WebSocket(wsurl)
const Elements = {
    Word: document.getElementById("Word"),
    WordWrite: document.getElementById("Word-write"),
    Subject: document.getElementById("Subject"),
    Wrong: document.getElementById("Wrong"),
    Round: document.getElementById("Round"),
    Exp: document.getElementById("Exp"),
    RoundTimeValue: document.getElementById("Round_time_value"),
    AllTimeValue: document.getElementById("All_time_value")
}
const _data = {
    AllTime: undefined,
    RoundTime: undefined,
    DefAllTime: undefined,
    DefRoundTime: undefined,
    TICK: 30
}
let nowquestion = ""
let myanswer = ""
ws.onopen = () => {
    console.log("connected ws server")
    send({
        type: "start"
    })
    timer()
}
ws.onclose = () => {
    alert("서버와의 연결이 끊어졌습니다.");
}
ws.onerror = e => {
    alert("서버와 접속중 에러가 발생했습니다.", e);
}
ws.onmessage = async e => {
    const data = JSON.parse(e.data)
    changeDetailByData(data)
    switch (data.type) {
        case "start": {
            nowquestion = data.word
            Elements.Word.innerText = nowquestion
            console.log(data.time)
            if (!_data.DefAllTime) _data.DefAllTime = data.time
            _data.AllTime = data.time
            if (!_data.DefRoundTime) _data.DefRoundTime = _data.DefAllTime / 2
            if (_data.RoundTime > _data.AllTime) _data.RoundTime = _data.AllTime
            _data.RoundTime = _data.DefRoundTime
            timer()
            break
        }
        case "correct": {
            Elements.WordWrite.value = ""
            if (data.value) {
                Elements.Word.style.color = "#ffffff"
                Elements.Word.innerText = myanswer
                await sleep(1000)
                send({
                    type: "start"
                })
            }
            else {
                Elements.Word.style.color = "#ff0000"
                Elements.Word.innerText = myanswer
                await sleep(1000)
                Elements.Word.style.color = "#ffffff"
                Elements.Word.innerText = nowquestion
            }
            break
        }
        case "finish": {

            break
        }
    }

}
/**
 * 
 * @param { object } data 
 */
function changeDetailByData(data) {
    Elements.Subject.innerTe
    xt = data.category
    Elements.Wrong.innerText = `${data.wrong}번`
    Elements.Round.innerText = `${data.now_round} / ${data.max_round}`
    Elements.Exp.innerText = data.exp
}
function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}
function answer() {
    myanswer = Elements.WordWrite.value
    send({
        type: "answer",
        value: myanswer,
        time: _data.AllTime
    })
}
function send(data) {
    data.id = myid
    ws.send(JSON.stringify(data))
}
function timer() {
    setInterval(() => {
        _data.AllTime -= _data.TICK;
        _data.RoundTime -= _data.TICK;
        Elements.AllTimeValue.innerText = Math.round(_data.AllTime*0.001)
        Elements.AllTimeValue.style.height = `${_data.AllTime / _data.DefAllTime * 100}%`
        console.log(_data.AllTime / _data.DefAllTime * 100)
        Elements.RoundTimeValue.innerText = Math.round(_data.RoundTime*0.001)
        Elements.RoundTimeValue.style.height = `${_data.RoundTime / _data.DefRoundTime * 100}%`
    }, _data.TICK*2)
}