import audios from "../manager/audioManager"
import styles from "./../styles/themeButton.module.scss"

function ThemeButton({name, icon, width, onClick, selected}: {name: string, icon: string, width: number, onClick: () => void, selected : boolean}) {
  return (
    <div className={styles["container"]} onMouseEnter={() => {
      new Audio(audios.buttonHover).play()
    }} onClick={() => {
      new Audio(audios.buttonClick).play()
      onClick()
    }} style={{width: `${width}px`}}>
      <div className={styles["icon"]}>
        <div className={styles["realIcon"]} style={{backgroundImage: `url(${icon})`, filter: selected ? `grayscale(0%)` : `grayscale(100%)` }} />
      </div>
      <span className={styles["name"]}>{name}</span>
    </div>
  )
}

export default ThemeButton