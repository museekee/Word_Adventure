import audios from "../manager/audioManager"
import styles from "./../styles/subjectButton.module.scss"

function SubjectButton({name, icon, wordCount}: {name: string, icon: string, wordCount: number}) {
  return (
    <div className={styles["container"]} onMouseEnter={() => {
      new Audio(audios.buttonHover).play()
    }} onClick={() => {
      new Audio(audios.buttonClick).play()
    }}>
      <div className={styles["icon"]}>
        <img src={icon} />
        <div>단어 : {wordCount}개</div>
      </div>
      <span className={styles["name"]}>{name}</span>
    </div>
  )
}

export default SubjectButton