import styles from "./../styles/lobby.module.scss"
import imgs from "../manager/imageManager"
import { useState } from "react"
import CreateRoom from "../components/createRoom"
import Login from "../components/login"

function Lobby() {
  const pages = [
    {
      name: "방 만들기",
      icon: imgs.Plus,
      page: <CreateRoom />,
      onclick: () => console.log("방 만들기")
    }
  ]
  const bottomRights = [
    {
      name: "로그인",
      icon: imgs.Login,
      page: <Login />,
      onclick: () => console.log("로그인")
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
        {pg.type === "center" ? pages[pg.idx].page : bottomRights[pg.idx].page}
        <div className={styles["YesOrNo"]}>
          <button className={styles["yes"]} onClick={pg.type === "center" ? pages[pg.idx].onclick : bottomRights[pg.idx].onclick}>확인</button>
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
                <button key={idx} onClick={() => setPg({
                  type: "right",
                  idx: idx
                })}>
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