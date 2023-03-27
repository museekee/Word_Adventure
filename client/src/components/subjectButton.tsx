import audios from "../manager/audioManager"
import styles from "./../styles/subjectButton.module.scss"

function SubjectButton(
  {name, icon, wordCount, degree, bgColor}:
  {name: string, icon: string, wordCount: number, degree: number, bgColor: string}
) {
  return (
    <div className={styles["container"]} onMouseEnter={() => {
      new Audio(audios.buttonHover).play()
    }} onClick={() => {
      new Audio(audios.buttonClick).play()
    }}>
      <div 
        className={styles["icon"]}
        style={{background: `linear-gradient(${degree}deg, ${bgColor.split("/").join(", ")} )`}}
        >
        <div className={styles["icon"]} style={{backgroundImage: `url(${icon})`}} />
        <div className={styles["wordCount"]}>단어 : {wordCount}개</div>
      </div>
      <span className={styles["name"]}>{name}</span>
    </div>
  )
}

export default SubjectButton