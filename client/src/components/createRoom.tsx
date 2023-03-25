import { NLobby } from "../types/lobby"
import styles from "./../styles/createRoom.module.scss"

function CreateRoom({data, onChangeData}: {data: NLobby.ICreateRoom, onChangeData: (value: NLobby.ICreateRoom) => void}) {
  const setData = (target: {[x: string]: string | number}) => {
    onChangeData(Object.assign(data, target))
  }
  return (
    <div className={styles["main"]}>
      <div className={styles["settings"]}>
        <h1 className={styles["title"]}>방 설정</h1>
        <div>
          <span>방 이름</span><input type="text" onChange={(e) => setData({title: e.target.value})} />
        </div>
      </div>
    </div>
  )
}

export default CreateRoom