import styles from "./../styles/lobby.module.scss"
import imgs from "../manager/imageManager"
import { useEffect, useState } from "react"
import CreateRoom from "../components/createRoom"
import axios from "axios"
import MyData from "../components/myData"

function Lobby() {
  const pages = [
    {
      name: "방 만들기",
      icon: imgs.Plus,
      page: <CreateRoom />,
      onOk: () => console.log("방 만들기")
    }
  ]
  const [user, setUser] = useState({id: null, nick: null, pfp: null});
  useEffect(() => {
    let completed = false
    async function get() {
      const result = await axios.get("/myData")
      if (!completed) setUser(result.data);
    }
    get()
    return () => {
      completed = true
    };
  }, [])
  console.log(user)
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
              return (
                <button key={idx} onClick={() => setPg({
                  type: "center",
                  idx: idx
                })}>
                  <img className={styles["icon"]} src={item.icon} />
                  <span className={styles["desc"]}>{item.name}</span>
                </button>
              )
            })
          }
        </div>
        <div className={styles["right"]}>
          {
            bottomRights.map((item, idx) => {
              return (
                <button key={idx} onClick={!item.onClick ? () => setPg({
                  type: "right",
                  idx: idx
                }): item.onClick}>
                  <img className={styles["icon"]} src={item.icon} />
                  <span className={styles["desc"]}>{item.name}</span>
                </button>
              )
            })
          }
        </div>
      </div>
    </div>
  )
}

export default Lobby