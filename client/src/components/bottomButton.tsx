import styles from "./../styles/bottomButton.module.scss"

function BottomButton({name, icon, onClick, myKey}: {name: string, icon: string, onClick: () => void, myKey: string}) {
  console.log(myKey)
  return (
    <button className={styles["container"]} onClick={onClick} key={myKey}>
      <img className={styles["icon"]} src={icon} />
      <span className={styles["desc"]}>{name}</span>
    </button>
  )
}

export default BottomButton