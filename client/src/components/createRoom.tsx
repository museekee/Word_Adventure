import styles from "./../styles/createRoom.module.scss"

function CreateRoom() {
  return (
    <div className={styles["main"]}>
      <div className={styles["settings"]}>
        <h1 className={styles["title"]}>방 설정</h1>
        <div>
          <span>방 이름</span><input type="text" />
        </div>
      </div>
    </div>
  )
}

export default CreateRoom