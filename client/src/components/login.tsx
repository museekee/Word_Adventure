import styles from "./../styles/login.module.scss"

function Login() {
  return (
    <div className={styles["main"]}>
      <a href="/login/google">로그인</a>
    </div>
  )
}

export default Login