const elems = {
    passwordTbox: document.getElementById("passwordTbox"),
    userNameTbox: document.getElementById("userNameTbox"),
    userData: {
        main: document.getElementById("userData"),
        userDataID: document.getElementById("userData_ID"),
        userDataNICK: document.getElementById("userData_Nick"),
        userDataEXP: document.getElementById("userData_EXP"),
        userDataMONEY: document.getElementById("userData_Money"),
        userDataITEM: document.getElementById("userData_Item"),
        userDataEQUIP: document.getElementById("userData_Equip"),
        userDataCREATED_AT: document.getElementById("userData_CreatedAt")
    }
}
async function searchUser() {
    const res = await fetch(`${window.location.pathname}/user/${elems.userNameTbox.value}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            key: passwordTbox.value
        })
    })
    switch (res.status) {
        case 200: {
            const data = await res.json()
            Object.entries(data).forEach(([key, value]) => {
                elems.userData[`userData${key}`].value = value
            })
            elems.userData.userDataCREATED_AT.innerText = data.CREATED_AT
            break
        }
        default:
            return await swal.fire({
                title: "오류!",
                text: `${res.status} ${res.statusText}`,
                icon: "error",
                confirmButtonText: '확인'
            })
    }
}
async function applyUser() {
    
}