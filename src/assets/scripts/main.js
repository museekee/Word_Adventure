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
        swal.fire({
            title: '오류!',
            html: `게임 접속에 실패했습니다.<br/>reason : ${data.reason}`,
            icon: 'error',
            confirmButtonText: '확인'
        })
    }
}