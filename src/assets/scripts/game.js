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
    AllTimeValue: document.getElementById("All_time_value"),
    Result: {
        Main: document.getElementById("Result-main"),
        ForP: document.getElementById("ForP"),
        AccuracyValue: document.getElementById("Accuracy_value"),
        WrongValue: document.getElementById("Wrong_value"),
        CategoryValue: document.getElementById("Category_value"),
        RuleValue: document.getElementById("Rule_value"),
        ExpValue: document.getElementById("Exp_value"),
        DamValue: document.getElementById("Dam_value"),
        TimeValue: document.getElementById("Time_value")
    }
}
const _data = {
    AllTime: undefined,
    RoundTime: undefined,
    DefAllTime: undefined,
    DefRoundTime: undefined,
    TICK: 10
}
let nowquestion = ""
let myanswer = ""
const timer = setInterval(() => {
    _data.AllTime -= _data.TICK;
    _data.RoundTime -= _data.TICK;
    if (_data.RoundTime <= 0) {
        send({
            type: "timeout"
        })
        clearInterval(timer)
    }
    Elements.AllTimeValue.innerText = Math.round(_data.AllTime*0.001)
    Elements.AllTimeValue.style.height = `${_data.AllTime / _data.DefAllTime * 100}%`
    Elements.RoundTimeValue.innerText = Math.round(_data.RoundTime*0.001)
    Elements.RoundTimeValue.style.height = `${_data.RoundTime / _data.DefRoundTime * 100}%`
}, _data.TICK)
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
    const data = JSON.parse(e.data)
    changeDetailByData(data)
    switch (data.type) {
        case "start": 
            nowquestion = data.word
            Elements.Word.innerText = nowquestion
            Elements.WordWrite.setAttribute("placeholder", nowquestion)
            if (!_data.DefAllTime) _data.DefAllTime = data.time // 아무것도 안 되어있을 때
            _data.AllTime = data.time
            if (!_data.DefRoundTime) _data.DefRoundTime = _data.DefAllTime / 2 // 라운드 타임 안 정해졌을 때
            if (_data.DefRoundTime > _data.AllTime) _data.RoundTime = _data.AllTime // 남은 전체 타임이 라운드 타임보다 작을 때
            else _data.RoundTime = _data.DefRoundTime
            break
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
            clearInterval(timer)
            const ForP = _data.RoundTime <= 0 ? "fail" : "perfect"
            if (ForP === "fail") Elements.Result.ForP.style.width = "200px"
            else Elements.Result.ForP.style.width = "250px"
            Elements.Result.ForP.setAttribute("src", `/assets/images/${ForP}.svg`)
            const accuracy = (data.now_round / (data.wrong + data.max_round)) * 100
            Elements.Result.AccuracyValue.innerText = `${Math.round(accuracy * 100)/100}%`
            Elements.Result.AccuracyValue.style.width = `${accuracy}%`
            Elements.Result.WrongValue.innerText = `${data.wrong}개`
            Elements.Result.CategoryValue.innerText = data.categories.join("/")
            Elements.Result.RuleValue.innerText = "미구현"
            Elements.Result.ExpValue.innerText = `🟢 +${data.exp}`
            Elements.Result.DamValue.innerText = `+${data.dam}🟡`
            Elements.Result.TimeValue.innerText = `${data.time / 1000}초`
            Elements.Result.Main.style.display = "grid"
            const audio = new Audio(`/assets/audios/${ForP}.flac`)
            audio.play()
            break
        }
    }

}
/**
 * 
 * @param { object } data 
 */
function changeDetailByData(data) {
    Elements.Subject.innerText = data.category
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