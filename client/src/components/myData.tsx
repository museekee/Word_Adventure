import styles from "./../styles/myData.module.scss"

function MyData() {
  return (
    <div className={styles["main"]}>
      <button onClick={() => window.location.href = "/login/logout"}>로그아웃</button>
    </div>
  )
}

export default MyData