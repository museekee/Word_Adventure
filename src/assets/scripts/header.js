/**
 * 
 * @param {string} id 
 */
function showDialog(id) {
    const dialog = document.getElementById(`__${id}Back__`)
    dialog.style.display = "flex"
}
function closeDialog(id) {
    const dialog = document.getElementById(`__${id}Back__`)
    dialog.style.display = "none"
}
async function join() {
    const res = await fetch("/account/join", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: document.getElementById("____Jid____").value,
            pw: document.getElementById("____Jpw____").value,
            pwC: document.getElementById("____JpwC____").value,
            nick: document.getElementById("____Jnick____").value
        })
    })
    if (res.status === 403) {
        const data = await res.json()
        await swal.fire({
            title: '오류!',
            html: `회원가입에 실패하였습니다.<br/>사유 : ${data.reason}`,
            icon: 'error',
            confirmButtonText: '확인'
        })
    }
    else {
        await swal.fire({
            title: '성공!',
            text: `회원가입에 성공하였습니다!`,
            icon: 'success',
            confirmButtonText: '확인 및 새로고침',
            allowOutsideClick: false,
            allowEscapeKey: false,
        })
        location.reload()
    }
}
async function login() {
    const res = await fetch("/account/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: document.getElementById("____Lid____").value,
            pw: document.getElementById("____Lpw____").value
        })
    })
    if (res.status === 403) {
        const data = await res.json()
        await swal.fire({
            title: '오류!',
            text: data.reason,
            icon: 'error',
            confirmButtonText: '확인'
        })
    }
    else {
        console.log(res)
        await swal.fire({
            title: '성공!',
            text: `로그인에 성공하였습니다!`,
            icon: 'success',
            confirmButtonText: '확인 및 새로고침',
            allowOutsideClick: false,
            allowEscapeKey: false,
        })
        location.reload()
    }
}
async function logout() {
    const result = await swal.fire({
        title: '로그아웃',
        text: `로그아웃을 하시겠습니까?`,
        icon: 'question',
        showDenyButton: true,
        confirmButtonText: '네',
        denyButtonText: '아니요'
    })
    if (result.value) {
        const res = await fetch("/account/logout", {
            method: "POST"
        })
        if (res.status === 200) {
            await swal.fire({
                title: '성공!',
                text: `로그아웃에 성공하였습니다!`,
                icon: 'success',
                confirmButtonText: '확인 및 새로고침'
            })
            location.reload()
        }
        else 
            await swal.fire({
                title: '오류!',
                text: `로그아웃을 시도 중, 서버에 오류가 발생하였습니다.`,
                icon: 'error',
                confirmButtonText: '확인'
            })
    }
}