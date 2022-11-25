const ELEMENTS = {
    passwordTbox: document.getElementById("passwordTbox"),
    userNameTbox: document.getElementById("userNameTbox"),
    userData: {
        main: document.getElementById("userData"),
        ID: document.getElementById("userData_ID"),
        NICK: document.getElementById("userData_Nick"),
        EXP: document.getElementById("userData_EXP"),
        MONEY: document.getElementById("userData_Money"),
        ITEM: document.getElementById("userData_Item"),
        EQUIP: document.getElementById("userData_Equip"),
        CREATED_AT: document.getElementById("userData_CreatedAt"),
        BAN: document.getElementById("userData_Ban")
    },
    wordLoad: {
        categorySelector: document.getElementById("wordLoadCategorySelector"),
        start: document.getElementById("wordLoadStart"),
        limit: document.getElementById("wordLoadLimit"),
        list: document.getElementById("wordLoadList")
    }
}
async function searchUser() {
    const data = await (new request(`user/${ELEMENTS.userNameTbox.value}`).post())
    if (data) {
        Object.entries(data).forEach(([key, value]) => {
            ELEMENTS.userData[key].value = value
        })
        ELEMENTS.userData.BAN.checked = data.BAN == 0 ? false : true
        ELEMENTS.userData.CREATED_AT.innerText = data.CREATED_AT
    }
}
async function applyUser() {
    const data = await (new request(`user/${ELEMENTS.userNameTbox.value}/apply`).post({
        id: ELEMENTS.userData.ID.value,
        nick: ELEMENTS.userData.NICK.value,
        exp: ELEMENTS.userData.EXP.value,
        money: ELEMENTS.userData.MONEY.value,
        item: ELEMENTS.userData.ITEM.value,
        equip: ELEMENTS.userData.EQUIP.value,
        ban: ELEMENTS.userData.BAN.checked
    }))
    if (data) {
        return await swal.fire({
            title: "성공!",
            text: `유저를 성공적으로 업데이트 하였습니다!`,
            icon: "success",
            confirmButtonText: '확인'
        })
    }
}

async function searchWord() {
    const res = await (new request("word").post({
        category: ELEMENTS.wordLoad.categorySelector.value,
        start: Number(ELEMENTS.wordLoad.start.value),
        limit: Number(ELEMENTS.wordLoad.limit.value)
    }))
    ELEMENTS.wordLoad.list.innerHTML = ""
    res.forEach(i => {
        const v = i["WORD"]
        const wordItem = document.createElement("word-item")
        wordItem.setAttribute("class", "inpbtn")
        const input = document.createElement("input")
        input.value = v
        input.setAttribute("class", "wordValue")
        const button = document.createElement("button")
        button.setAttribute("class", "wordDelete")
        button.setAttribute("onclick", "deleteWord(this)")
        wordItem.appendChild(input)
        wordItem.appendChild(button)
        ELEMENTS.wordLoad.list.appendChild(wordItem)
    })
}
/**
 * @param {HTMLElement} elem 
 */
async function deleteWord(elem) {
    elem.parentElement.remove()
}
async function addWord() {
    const wordItem = document.createElement("word-item")
    wordItem.setAttribute("class", "inpbtn")
    const input = document.createElement("input")
    input.setAttribute("class", "wordValue")
    const button = document.createElement("button")
    button.setAttribute("class", "wordDelete")
    button.setAttribute("onclick", "deleteWord(this)")
    wordItem.appendChild(input)
    wordItem.appendChild(button)
    ELEMENTS.wordLoad.list.appendChild(wordItem)
}
async function applyWord() {
    const words = []
    ELEMENTS.wordLoad.list.childNodes.forEach(wordItem => {
        words.push(wordItem.childNodes[0].value)
    })
    await (new request("word/apply").post({
        category: ELEMENTS.wordLoad.categorySelector.value,
        words: words
    }))
}

async function loadRooms() {
    const res = await (new request("room").post())
    console.log(res)
}

class request {
    constructor (url) {
        this.url = url
    }
    async get(data) {
        const res = await fetch(`${window.location.pathname}/${this.url}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                key: ELEMENTS.passwordTbox.value,
                data
            })
        })
        if (res.status !== 200) await swal.fire({
            title: "오류!",
            text: `${res.status} ${res.statusText}`,
            icon: "error",
            confirmButtonText: '확인'
        })
        else return await res.json()
    }
    async post(data) {
        console.log(JSON.stringify({
            key: ELEMENTS.passwordTbox.value,
            data: data ? data : undefined
        }))
        const res = await fetch(`${window.location.pathname}/${this.url}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                key: ELEMENTS.passwordTbox.value,
                data: data ? data : undefined
            })
        })
        if (res.status !== 200) await swal.fire({
            title: "오류!",
            text: `${res.status} ${res.statusText}`,
            icon: "error",
            confirmButtonText: '확인'
        })
        else return await res.json()
    }
}