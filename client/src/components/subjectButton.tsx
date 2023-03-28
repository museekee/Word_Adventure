import audios from "../manager/audioManager"
import styles from "./../styles/subjectButton.module.scss"

function SubjectButton(
  {name, icon, wordCount, degree, bgColor, onClick, selected}:
  {name: string, icon: string, wordCount: number, degree: number, bgColor: string, onClick: () => void, selected: boolean}
) {
  return (
    <div className={styles["container"]} onMouseEnter={() => {
      new Audio(audios.buttonHover).play()
    }} onClick={() => {
      new Audio(audios.buttonClick).play()
      onClick()
    }}
    style={{borderColor: selected ? `#ffff00` : "#444444"}}>
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