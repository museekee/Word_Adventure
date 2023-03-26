import audios from "../manager/audioManager"
import styles from "./../styles/bottomButton.module.scss"

function BottomButton({name, icon, onClick, myKey}: {name: string, icon: string, onClick: () => void, myKey: string}) {
  return (
    <button className={styles["container"]} onMouseEnter={() => {
      new Audio(audios.buttonHover).play()
    }} onClick={() => {
      new Audio(audios.buttonClick).play()
      onClick()
    }} key={myKey}>
      <img className={styles["icon"]} src={icon} />
      <span className={styles["desc"]}>{name}</span>
    </button>
  )
}

export default BottomButton