const selectedCategory = {}
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
            category: selectedCategory
        })
    })
    console.log(res.status, res.statusText, res.text)
    if (res.redirected) window.location.href = res.url
    else {
        swal.fire({
            title: '오류!',
            text: '게임 접속에 실패했습니다.',
            icon: 'error',
            confirmButtonText: '확인'
        })
    }
}