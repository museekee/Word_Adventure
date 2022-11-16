const selectedCategory = {}
const $data = {
    sessionId: document.getElementById("sessionId").innerText,
    profile: undefined
};

const socket = io.connect(`http://localhost/?session=${$data.sessionId}`)
/**
 * 
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
    console.log($data)
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
        shopItems.appendChild(shopItem)
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
 * 
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
 * 
 * @param {HTMLElement} elem 
 */
 async function onMouseOver_ShopItem(elem) {
    const damBar = document.getElementById("Dam-bar")
    const damBarValue = document.getElementById("Dam-bar-value")
    const price = elem.dataset.price
    damBarValue.innerText = `${$data.profile.money}━${price}`
    damBar.style.height = `${($data.profile.money / price) * 100}%`
}
async function onMouseOut_ShopItem() {
    const damBar = document.getElementById("Dam-bar")
    const damBarValue = document.getElementById("Dam-bar-value")
    damBarValue.innerText = `${$data.profile.money}━${$data.profile.money}`
    damBar.style.height = `100%`
}