import styles from "./../styles/lobby.module.scss"
import imgs from "../manager/imageManager"
import { useEffect, useState } from "react"
import CreateRoom from "../components/createRoom"
import axios from "axios"
import MyData from "../components/myData"
import Swal from "sweetalert2"
import BottomButton from "../components/bottomButton"
import { NLobby } from "../types/lobby"
import { useNavigate } from "react-router-dom"

function Lobby() {
  const navigate = useNavigate();
  const [user, setUser] = useState({id: null, nick: null, pfp: null, sessId: null, isLogin: false});
  useEffect(() => {
    async function get() {
      const result = await axios.get("/api/myData",  { validateStatus: (status) => {
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
    }
    get()
  }, [])

  const [crRoom, setCrRoom] = useState<NLobby.ICreateRoom>({title: "", subjects: [], rounds: 5, time: 150})
  useEffect(() => {
    setCrRoom(prevState => {
      return {...prevState, title: `${user.nick}님의 방`}
    })
  }, [user])
  const pages = [
    {
      name: "방 만들기",
      icon: imgs.bottomBar.Plus,
      page: <CreateRoom onChangeData={setCrRoom} />,
      onOk: async () => {
        console.log(crRoom)
        const res = await axios.post("/api/rooms/create", {
          data: crRoom
        },
        {
          validateStatus(status) {
            if (status !== 200) {
              if (status === 403) 
                return true
              else Swal.fire({
                icon: "error",
                title: "오류!",
                text: "방 만들기에 실패했습니다.",
                confirmButtonText: "확인"
              })
              return false
            }
            else return true
          }
        })
        if (res.status === 200)
          navigate(res.data.redirectUrl)
        if (res.status === 403) 
          Swal.fire({
            icon: "error",
            title: "오류!",
            text: `방 만들기에 실패했습니다.\n사유 : ${res.data.reason}`,
            confirmButtonText: "확인"
          })
      },
      use: user.isLogin
    }
  ]
  const bottomRights: {name: string, icon: string, page?: JSX.Element, onClick?: () => void, onOk?: () => void}[] = [
    {
      name: !user.isLogin ? "로그인" : "프로필",
      icon: user.pfp == null ? imgs.bottomBar.Login : user.pfp,
      onClick: !user.isLogin ? (() => window.location.href = "/login/google") : undefined,
      page: !user.isLogin ? undefined : <MyData />
    }
  ]
  const [pg, setPg] = useState({
    type: "center",
    idx: 0
  })
  
  return (
    <div id={styles["stage"]} style={{backgroundImage: `linear-gradient( 109.6deg,  rgba(61,245,167,1) 11.2%, rgba(9,111,224,1) 91.1% )`, backgroundSize: "cover"}}>
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
              return null
            })
          }
        </div>
        <div className={styles["right"]}>
          {
            bottomRights.map((item, idx) => {
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