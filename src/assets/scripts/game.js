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
        PlayerValue: document.getElementById("Player_value"),
        CategoryValue: document.getElementById("Category_value"),
        RuleValue: document.getElementById("Rule_value"),
        ExpValue: document.getElementById("Exp_value"),
        DamValue: document.getElementById("Dam_value"),
        TimeValue: document.getElementById("Time_value")
    }
}
const $data = {
    wsUrl: `${document.getElementById("ws").innerText}`,
    room: {
        nowRound: undefined,
        maxRound: undefined,
        maxTime: undefined,
        category: undefined,
        question: undefined,
        wrong: undefined,
        exp: undefined,
        money: undefined,
        time: {
            allTime: undefined,
            nowAllTime: undefined,
            roundTime: undefined,
            nowRoundTime: undefined
        }
    },
    TICK: 10,
    oldTick: new Date().getTime(),
    timer: undefined
}
const socket = io.connect(`${$data.wsUrl}`)

async function timerCb() {
    const nowTime = new Date().getTime()
    $data.room.time.nowAllTime -= nowTime - $data.oldTick;
    $data.room.time.nowRoundTime -= nowTime - $data.oldTick;
    if ($data.room.time.nowRoundTime <= 0) {
        await send("timeout")
        clearInterval($data.timer)
    }
    Elements.AllTimeValue.innerText = Math.round($data.room.time.nowAllTime*0.001)
    Elements.AllTimeValue.style.height = `${$data.room.time.nowAllTime / $data.room.time.allTime * 100}%`
    Elements.RoundTimeValue.innerText = Math.round($data.room.time.nowRoundTime*0.001)
    Elements.RoundTimeValue.style.height = `${$data.room.time.nowRoundTime / $data.room.time.roundTime * 100}%`
    $data.oldTick = nowTime
}
for (const elem of document.getElementsByClassName("GameItem")) {
    elem.addEventListener("click", () => {
        send("useItem", {
            value: elem.dataset.itemName
        })
    })
}

socket.on("init", async e => {
    const data = JSON.parse(e)
    $data.room.maxRound = data.maxRound
    $data.room.nowRound = data.nowRound
    $data.room.time.allTime = data.maxTime
    $data.room.time.nowAllTime = $data.room.time.allTime
    $data.timer = setInterval(timerCb, $data.TICK)
})
socket.on("newRound", async e => {
    const data = JSON.parse(e)
    $data.room.category = data.nowCategory
    $data.room.question = data.question
    Elements.Word.innerText = $data.room.question
    Elements.WordWrite.setAttribute("placeholder", $data.room.question)
    console.log($data)
    if (!$data.room.time.roundTime) $data.room.time.roundTime = $data.room.time.allTime / 2 // 라운드 타임 안 정해졌을 때
    if ($data.room.time.nowRoundTime > $data.room.time.nowAllTime) $data.room.time.nowRoundTime = $data.room.time.nowAllTime // 남은 전체 타임이 라운드 타임보다 작을 때
    else $data.room.time.nowRoundTime = $data.room.time.roundTime
})
socket.on("useItem", async e => {
    const data = JSON.parse(e)
    if (data.code === 403) {
        return swal.fire({
            title: "오류!",
            html: data.value,
            icon: 'error',
            confirmButtonText: '확인'
        })
    }
})
socket.on("hint", async e => {
    const data = JSON.parse(e)
    console.log(data)
    if (data.code === 200) {
        $data.room.question = data.value
        Elements.Word.innerText = $data.room.question
    }
    if (data.code === 403) {
        return swal.fire({
            title: "오류!",
            html: data.value,
            icon: 'error',
            confirmButtonText: '확인'
        }) 
    }
})
socket.on("room", async e => {
    const data = JSON.parse(e)
    $data.room.category = data.category
    $data.room.wrong = data.wrong
    $data.room.exp = data.exp
    $data.room.money = data.money
    $data.room.nowRound = data.nowRound
    $data.room.maxRound = data.maxRound
    $data.room.time.allTime = data.allTime
    $data.room.time.nowAllTime = data.nowAllTime
    renderDetail()
})
socket.on("correct", async e => {
    const data = JSON.parse(e)
    Elements.WordWrite.value = ""
    Elements.WordWrite.setAttribute("disabled", "")
    clearInterval($data.timer)
    Elements.Word.innerText = data.answer
    for (const elem of document.getElementsByClassName("GameItem")) {
        elem.setAttribute("disabled", "")
    }
    if (data.value) {
        Elements.Word.style.color = "#ffffff"
        await sleep(1000)
        $data.timer = setInterval(timerCb, $data.TICK)
        send("newRound")
    }
    else {
        Elements.Word.style.color = "#ff0000"
        await sleep(1000)
        $data.timer = setInterval(timerCb, $data.TICK)
        Elements.Word.style.color = "#ffffff"
        Elements.Word.innerText = $data.room.question
    }
    Elements.WordWrite.removeAttribute("disabled")
    Elements.WordWrite.focus()
    for (const elem of document.getElementsByClassName("GameItem")) {
        elem.removeAttribute("disabled")
    }
})
socket.on("finish", async e => {
    const data = JSON.parse(e)
    clearInterval($data.timer)
    renderFinishByData(data)
})

// * observer
socket.on("observe", async e => {
    const data = JSON.parse(e)
    swal.fire({
        title: "옵저버",
        text: data.value
    })
})

function renderDetail() {
    Elements.Subject.innerText = $data.room.category
    Elements.Wrong.innerText = `${$data.room.wrong}번`
    Elements.Round.innerText = `${$data.room.nowRound} / ${$data.room.maxRound}`
    Elements.Exp.innerText = $data.room.exp
}
function renderFinishByData(data) {
    clearInterval($data.timer)
    const ForP = $data.room.time.nowRoundTime <= 0 ? "fail" : "perfect"
    if (ForP === "fail") Elements.Result.ForP.style.width = "200px"
    else Elements.Result.ForP.style.width = "250px"
    Elements.Result.ForP.setAttribute("src", `/assets/images/${ForP}.svg`)
    const accuracy = ((data.NOW_ROUND) / (data.WRONG + data.ROUND)) * 100
    Elements.Result.AccuracyValue.innerText = `${Math.round(accuracy * 100)/100}%`
    Elements.Result.AccuracyValue.style.width = `${accuracy}%`
    Elements.Result.WrongValue.innerText = `${data.WRONG}개`
    Elements.Result.PlayerValue.innerText = data.PLAYER
    Elements.Result.CategoryValue.innerText = JSON.parse(data.CATEGORIES).join("/")
    Elements.Result.RuleValue.innerText = `${data.MODE}`
    Elements.Result.ExpValue.innerText = `🟢 +${data.EXP}`
    Elements.Result.DamValue.innerText = `+${data.MONEY}🟡`
    Elements.Result.TimeValue.innerText = `${data.NOW_TIME / 1000}초`
    Elements.Result.Main.style.display = "grid"
    const audio = new Audio(`/assets/audios/${ForP}.flac`)
    audio.play()
}
function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms))
}
function answer() {
    send("answer", {
        value: Elements.WordWrite.value,
        time: $data.room.time.nowAllTime
    })
}
function send(type, data) {
    if (!data) return socket.emit(type, null)
    return socket.emit(type, JSON.stringify(data))
}