const selectedCategory = {}
const $data = {
    profile: undefined,
    shop: undefined,
    EXP: [],
    MAX_LEVEL: 99
};
$data.EXP.push(getRequiredScore(1));
for(i=2; i<$data.MAX_LEVEL; i++){
    $data.EXP.push(getRequiredScore(i));
}
$data.EXP[$data.MAX_LEVEL - 1] = Infinity;
$data.EXP.push(Infinity);
const elements = {
    ws: document.getElementById("ws").innerText,
    profile: {
        nickname: document.getElementById("Nickname"),
        damBar: document.getElementById("Dam-bar"),
        damBarValue: document.getElementById("Dam-bar-value"),
        expBar: document.getElementById("Exp-bar"),
        expBarValue: document.getElementById("Exp-bar-value"),
        ziu: document.getElementById("Ziu")
    },
    board: {
        gameMenu: document.getElementById("Game-menu"),
        shop: document.getElementById("Shop")
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

const socket = io.connect(elements.ws)
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
    // console.log($data.profile)
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
socket.on("equipItem", async e => {
    const data = JSON.parse(e)
    if (data.code === 403) {
        return await swal.fire({
            title: "오류!",
            html: `아이템을 장착 중 오류가 발생했습니다.<br/>reason : ${data.value}`,
            icon: "error",
            confirmButtonText: "확인"
        })
    }
    return await swal.fire({
        title: "성공!",
        text: data.value,
        icon: "success",
        confirmButtonText: "확인"
    })
})
socket.on("unEquipItem", async e => {
    const data = JSON.parse(e)
    return await swal.fire({
        title: "성공!",
        text: data.value,
        icon: "success",
        confirmButtonText: "확인"
    })
})
async function gameMake() {
    send("generateRoom", {
        category: selectedCategory,
        option: {
            mode: document.getElementById("GameRule").value,
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
async function equipItem(itemId) {
    send("equipItem", {value: itemId})
}
async function unEquipItem(itemId) {
    send("unEquipItem", {value: itemId})
}
async function onClick_Menu(id, isDialog) {
    if (isDialog) {
        elements.dialog[id].main.style.display = "grid"
        setTimeout(() => elements.dialog[id].main.style.opacity = "1", 10)
    }
    else {
        for (const [key, value] of Object.entries(elements.board)) {
            value.style.display = "none"
        }
        elements.board[id].style.display = "grid"
    }
}
for (const item of document.getElementsByClassName("dialog-close")) {
    item.addEventListener("click", () => {
        document.getElementById('Profile-dialog').style.opacity = `0`
        setTimeout(() => document.getElementById('Profile-dialog').style.display = `none`, 500)
    })
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
function getRequiredScore(lv) {
    return Math.round((lv * Math.sqrt(lv)) * 500)
}
function getLevel(score){
	let i;

	for(i = 0; i < $data.EXP.length; i++) if(score < $data.EXP[i]) break;
	return i+1;
}
async function renderProfile() {
    //* set exp and dam
    elements.profile.damBarValue.innerText = `${$data.profile.money}━${$data.profile.money}`
    elements.profile.damBar.style.height = `100%`
    {
        const requiredScore = getRequiredScore(getLevel($data.profile.exp))
        console.log(getLevel($data.profile.exp))
        if ($data.EXP[getLevel($data.profile.exp) - 1] === Infinity) {
            elements.profile.expBarValue.innerText = `${$data.profile.exp}━만렙`
            elements.profile.expBar.style.height = `100%`
        }
        else {
            elements.profile.expBarValue.innerText = `${$data.profile.exp}━${requiredScore}`
            elements.profile.expBar.style.height = `${($data.profile.exp / requiredScore) * 100}%`
        }
    }
    //* set ziu
    elements.profile.nickname.innerText = `[${getLevel($data.profile.exp)}] 내 캐릭터`
    elements.profile.ziu.innerHTML = ""
    elements.dialog.profile.charactor.miniZiu.innerHTML = ""
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
    //* nickname
    elements.dialog.profile.charactor.nickname.value = $data.profile.nick
    //* inventory
    elements.dialog.profile.inventory.innerHTML = ""
    Object.entries($data.profile.item).forEach(([_, item]) => {
        Object.entries(item).forEach(([id, num]) => {
            elements.dialog.profile.inventory.innerHTML += `<dama-item data-invId="${id}" onclick="equipItem('${id}')">
                <img src="/ziu/${id}"/>
                <span>${num}</span>
            </dama-item>`
        })
    })
    Object.entries($data.profile.equip).forEach(([category, id]) => {
        if (id === "") return
        // console.log($data.profile.equip)
        // console.log($data.profile.item[category], id)
        if ($data.profile.item[category].hasOwnProperty(id)) {
            const item = document.querySelector(`[data-invId="${id}"]`)
            item.setAttribute("class", "eqiupedItem")
            item.setAttribute("onclick", `unEquipItem('${category}')`)
        }
        // ^ 갖고있는 아이템인데 장착까지 했을 때
        else {
            elements.dialog.profile.inventory.innerHTML += `<dama-item class="equipedItem" data-invId="${id}" onclick="unEquipItem('${category}')">
                <img src="/ziu/${id}"/>
                <span>0</span>
            </dama-item>`
        }
    })
}