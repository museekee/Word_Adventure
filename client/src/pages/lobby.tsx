import styles from "./../styles/lobby.module.scss"
import imgs from "../manager/imageManager"
import { useEffect, useState } from "react"
import CreateRoom from "../components/createRoom"
import axios from "axios"
import MyData from "../components/myData"
import io from 'socket.io-client'
import { Socket } from 'socket.io-client/build/esm/socket'
import Swal from "sweetalert2"
import BottomButton from "../components/bottomButton"

let socket: Socket

function Lobby() {
  const [user, setUser] = useState({id: null, nick: null, pfp: null, sessId: null, isLogin: false});
  useEffect(() => {(async () => {
    const result = await axios.get("/myData",  { validateStatus: (status) => {
      console.log(status)
      if (status !== 200) {
        if (status === 404) Swal.fire({
          icon: "warning",
          title: "로그인",
          text: "로그인을 먼저 해주세요.",
          confirmButtonText: "확인"
        })
        return false
      }
      else return true
    } })
    result.data.isLogin = true
    setUser(result.data)
    console.log(user)
    socket = io(`/`, {query: {session: result.data.sessId}})
    socket.emit('LBchat', {value: "안녕?"})
    socket.on("LBchat", (data) => {
      console.log(data)
    })
    socket.on("disconnect", (reason) => {
      alert("서버와의 접속이 끊어졌습니다!")
    })
  })()}, [])

  const pages = [
    {
      name: "방 만들기",
      icon: imgs.Plus,
      page: <CreateRoom />,
      onOk: () => console.log("방 만들기"),
      use: user.isLogin
    }
  ]
  const bottomRights: {name: string, icon: string, page?: JSX.Element, onClick?: () => void, onOk?: () => void}[] = [
    {
      name: user.nick == null ? "로그인" : "프로필",
      icon: user.pfp == null ? imgs.Login : user.pfp,
      onClick: !user.nick && (() => window.location.href = "/login/google"),
      page: user.nick == null ? undefined : <MyData />
    }
  ]
  const [pg, setPg] = useState({
    type: "center",
    idx: -1
  })
  
  return (
    <div id={styles["stage"]} style={{backgroundImage: `url(${imgs.bg})`, backgroundSize: "cover"}}>
      {pg.idx !== -1 ?
      <div id={styles["page"]}>
        <div className={styles["header"]}>{pg.type === "center" ? pages[pg.idx].name : bottomRights[pg.idx].name}</div>
        {(pg.type === "center" ? pages[pg.idx].page : bottomRights[pg.idx].page) ?? <></>}
        <div className={styles["YesOrNo"]}>
          <button className={styles["yes"]} onClick={pg.type === "center" ? pages[pg.idx].onOk : bottomRights[pg.idx].onOk}>확인</button>
          <button className={styles["no"]} onClick={() => setPg({ type: "center", idx: -1 })}>취소</button>
        </div>
      </div> :
      <>
      </>
      }
      <div id={styles["bottomBar"]}>
      <div className={styles["center"]}>
          {
            pages.map((item, idx) => {
              if (item.use === undefined || item.use === true)
                return (
                  <BottomButton name={item.name} icon={item.icon} myKey={idx.toString()} onClick={() => setPg({
                    type: "center",
                    idx: idx
                  })} />
                )
            })
          }
        </div>
        <div className={styles["right"]}>
          {
            bottomRights.map((item, idx) => {
              console.log(idx.toString())
              return (
                <BottomButton name={item.name} icon={item.icon} myKey={idx.toString()} onClick={!item.onClick ? () => setPg({
                  type: "right",
                  idx: idx
                }): item.onClick} />
              )
            })
          }
        </div>
      </div>
    </div>
  )
}

export default Lobby