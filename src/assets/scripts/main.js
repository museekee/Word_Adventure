const selectedCategory = {}
getShop("all")
/**
 * 
 * @param {HTMLElement} elem
 */
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
async function gameMake() {
    const res = await fetch("/trymakegame", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            category: selectedCategory,
            option: {
                round: document.getElementById("Round").value,
                time: document.getElementById("Time").value
            }
        })
    })
    if (res.redirected) window.location.href = res.url
    else {
        const data = JSON.parse(await res.text())
        await swal.fire({
            title: '오류!',
            html: `게임 접속에 실패했습니다.<br/>reason : ${data.reason}`,
            icon: 'error',
            confirmButtonText: '확인'
        })
    }
}
/**
 * 
 * @param {string} id 
 */
async function getShop(id) {
    const res = await fetch(`/shop/${id}`)
    /**
     * @type {[{
     *      ID: string,
     *      NAME: string,
     *      DESCRIPTION: string,
     *      CATEGORY: string,
     *      PRICE: number,
     *      IMG_TYPE: string
     * }]}
     */
    const data = await res.json()
    const shopItems = document.getElementById("Shop-items")
    shopItems.innerHTML = ""
    data.forEach(item => {
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
}
/**
 * 
 * @param {HTMLElement} elem 
 */
async function onMouseOver_ShopItem(elem) {
    const damBar = document.getElementById("Dam-bar")
    const damBarValue = document.getElementById("Dam-bar-value")
    const price = elem.dataset.price
    const my = await (await fetch("/profile")).json()
    damBarValue.innerText = `${my.money}━${price}`
    damBar.style.height = `${(my.money / price) * 100}%`
}
async function onMouseOut_ShopItem() {
    const damBar = document.getElementById("Dam-bar")
    const damBarValue = document.getElementById("Dam-bar-value")
    const my = await (await fetch("/profile")).json()
    damBarValue.innerText = `${my.money}━${my.money}`
    damBar.style.height = `100%`
}