const selectedCategory = {}
const $data = {
    sessionId: document.getElementById("sessionId").innerText,
    profile: undefined,
    shop: undefined
};
const elements = {
    profile: {
        damBar: document.getElementById("Dam-bar"),
        damBarValue: document.getElementById("Dam-bar-value"),
        expBar: document.getElementById("Exp-bar"),
        expBarValue: document.getElementById("Exp-bar-value"),
        ziu: document.getElementById("Ziu")
    },
    dialog: {
        profile: {
            main: document.getElementById("Profile-dialog"),
            charactor: {
                miniZiu: document.getElementById("Mini-ziu"),
                nickname: document.getElementById("Set-nickname")
            },
            effect: {},
            inventory: document.getElementById("Inventory")
        }
    }
}

const socket = io.connect(`http://localhost/?session=${$data.sessionId}`)
/**
 * @param {HTMLElement} elem
 */

 socket.on("generateRoom", async e => {
    const data = JSON.parse(e)
    if (data.code === 403) {
        await swal.fire({
            title: '오류!',
            html: `게임 접속에 실패했습니다.<br/>reason : ${data.value}`,
            icon: 'error',
            confirmButtonText: '확인'
        })
    }
    else if (data.code === 200) {
        window.location.href = data.value
    }
})
socket.on("profile", async e => {
    $data.profile = JSON.parse(e)
    console.log($data.profile)
    renderProfile()
})
socket.on("getShop", async e => {
    /**
     * @type {{
     * shop: [
     *     {
     *       ID: string,
     *       NAME: string,
     *       DESCRIPTION: string,
     *       CATEGORY: string,
     *       PRICE: number,
     *       IMG_TYPE: string
     *     }
     *   ]
     * }}
     */
    const data = JSON.parse(e)
    $data.shop = data.shop
    const shopItems = document.getElementById("Shop-items")
    shopItems.innerHTML = ""
    data.shop.forEach(item => {
        const shopItem = document.createElement("shop-item")
        const img = document.createElement("img")
        img.src = `/assets/images/ziu/${item.CATEGORY}/${item.ID}.${item.IMG_TYPE}`
        const title = document.createElement("h2")
        title.innerHTML = item.NAME
        const description = document.createElement("h4")
        description.innerHTML = item.DESCRIPTION
        shopItem.appendChild(img)
        shopItem.appendChild(title)
        shopItem.appendChild(description)
        shopItem.dataset.price = item.PRICE
        shopItem.dataset.id = item.ID
        shopItem.setAttribute("onmouseover", "onMouseOver_ShopItem(this)")
        shopItem.setAttribute("onmouseout", "onMouseOut_ShopItem()")
        shopItem.setAttribute("onclick", "onClick_ShopItem(this)")
        shopItems.appendChild(shopItem)
    })
})
socket.on("buyShopItem", async e => {
    const data = JSON.parse(e)
    if (!data.result) {
        return await swal.fire({
            title: "오류!",
            html: `구매 중 오류가 발생하였습니다.<br/>reason : ${data.reason}`,
            icon: "error",
            confirmButtonText: '확인'
        })
    }
    await swal.fire({
        title: "성공!",
        text: "구매에 성공하였습니다!",
        icon: "success",
        confirmButtonText: '확인'
    })
})
async function gameMake() {
    send("generateRoom", {
        category: selectedCategory,
        option: {
            round: document.getElementById("Round").value,
            time: document.getElementById("Time").value
        }
    })
}
function category_click(elem) {
    if (!selectedCategory[elem.dataset.category]) {
        selectedCategory[elem.dataset.category] = true
        elem.classList.add("selected")
    }
    else {
        selectedCategory[elem.dataset.category] = false
        elem.classList.remove("selected");
    }
}
/**
 * @param {string} id 
 */
async function getShop(id) {
    send("getShop", { value: id })
}
function send(type, data) {
    if (!data) return socket.emit(type, null)
    return socket.emit(type, JSON.stringify(data))
}
/**
 * @param {HTMLElement} elem 
 */
 async function onMouseOver_ShopItem(elem) {
    const price = elem.dataset.price
    elements.profile.damBarValue.innerText = `${$data.profile.money}━${price}`
    elements.profile.damBar.style.height = `${($data.profile.money / price) * 100}%`
}
async function onMouseOut_ShopItem() {
    elements.profile.damBarValue.innerText = `${$data.profile.money}━${$data.profile.money}`
    elements.profile.damBar.style.height = `100%`
}
/**
 * @param {HTMLElement} elem 
 */
 async function onClick_ShopItem(elem) {
    const price = elem.dataset.price
    const id = elem.dataset.id
    if((await swal.fire({
        title: "상점",
        html: `정말로 구매하시겠습니까?<br/>
        상품 가격 : ${price} 현재 담 : ${$data.profile.money} 구매 후 : ${$data.profile.money - price}`,
        icon: 'question',
        showDenyButton: true,
        confirmButtonText: '예',
        denyButtonText: '아니요'
    })).value) {
        send("buyShopItem", {
            value: id
        })
    }
}
async function renderProfile() {
    elements.profile.damBarValue.innerText = `${$data.profile.money}━${$data.profile.money}`
    elements.profile.damBar.style.height = `100%`
    elements.profile.expBarValue.innerText = `${$data.profile.exp}`
    elements.profile.expBar.style.height = `100%`
    const ITEM_CATEGORIES = ["body", "eye", "mouth", "ear", "clothes", "glasses", "hat", "hand"]
    ITEM_CATEGORIES.forEach(category => {
        const equipItem = $data.profile.equip[category]
        if (equipItem) {
            elements.profile.ziu.innerHTML += `<img id="Ziu-${category}" class="Ziu" src="/ziu/${equipItem}"/>`
            elements.dialog.profile.charactor.miniZiu.innerHTML += `<img id="Ziu-${category}" class="Ziu MiniZiu" src="/ziu/${equipItem}"/>`
        }
        else {
            elements.profile.ziu.innerHTML += `<img id="Ziu-${category}" class="Ziu" src="/assets/images/ziu/${category}/def.svg"/>`
            elements.dialog.profile.charactor.miniZiu.innerHTML += `<img id="Ziu-${category}" class="Ziu MiniZiu" src="/assets/images/ziu/${category}/def.svg"/>`
        }
    })
    elements.dialog.profile.charactor.nickname.value = $data.profile.nick
    for (const category in $data.profile.item) {
        const item = $data.profile.item[category]
        if (item.num <= 0) continue
        
    }
    console.log($data.profile.item)
}