import axios from "axios"
import { useEffect, useState } from "react"
import imgs from "../manager/imageManager"
import { NLobby } from "../types/lobby"
import styles from "./../styles/createRoom.module.scss"
import SubjectButton from "./subjectButton"
import ThemeButton from "./themeButton"

function CreateRoom({onChangeData}: {onChangeData: React.Dispatch<React.SetStateAction<NLobby.ICreateRoom>>}) {
  const pageDown = (e: React.WheelEvent) => {
    const height = e.currentTarget.clientHeight
    if (e.deltaY > 0) e.currentTarget.scrollTop += height
    if (e.deltaY < 0) e.currentTarget.scrollTop -= height
  }
  const [subjects, setSubjects] = useState<{
    [x: string]: {
      name: string,
      subjects: {
        id: string,
        name: string,
        degree: number,
        bgColor: string,
        wordCount: number
      }[]
    }
  }>()
  const [nowTheme, setNowTheme] = useState<string>()
  useEffect(() => {
    (async () => {
      const result = await axios.get("/api/getSubjects")
      setSubjects(result.data)
      setNowTheme(Object.entries(result.data)[0][0])
    })()
  }, [])
  const themeListRendering = () => {
    const result = []
    if (!subjects) return null
    const TThemes: {[x: string]: string} = imgs.theme
    for (const [key, value] of Object.entries(subjects)) {
      result.push(
        <ThemeButton
          icon={TThemes[key] ?? imgs.theme.none} 
          name={value.name}
          width={120}
          onClick={() => setNowTheme(key)} />
      )
    }
    return result
  }
  const subjectListRendering = () => {
    const result = []
    if (!subjects || !nowTheme) return null
    const TSubjects: {[x: string]: string} = imgs.subject
    for (const item of subjects[nowTheme].subjects) {
      result.push(
        <SubjectButton
          icon={TSubjects[item.id] ?? imgs.subject.none}
          name={item.name}
          wordCount={item.wordCount}
          degree={item.degree}
          bgColor={item.bgColor} />
      )
    }
    return result
  }
  return (
    <div className={styles["main"]}>
      <div className={styles["subjects"]}>
        <div className={styles["themeList"]}>
          <div className={styles["list"]} onWheel={pageDown}>
            {themeListRendering()}
          </div>
        </div>
        <div className={styles["subjectList"]}>
          <div className={styles["header"]}>
            <div className={styles["search"]}>
              <span>전체 주제 검색</span>
              <input type={"text"} placeholder={"주제 이름을 입력하세요."}></input>
            </div>
          </div>
          <div className={styles["list"]}>
            {subjectListRendering()}  
          </div>
        </div>
      </div>
      <div className={styles["settings"]}>
        <h1 className={styles["title"]}>방 설정</h1>
        <div>
          <span>방 이름</span><input type="text" onChange={(e) => onChangeData(prevState => {return {...prevState, title: e.target.value}})} />
        </div>
      </div>
    </div>
  )
}

export default CreateRoom