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
        name: string
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
    for (const [key, value] of Object.entries(subjects)) {
      result.push(
        <ThemeButton
          icon={imgs.bottomBar.Plus} 
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
    for (const item of subjects[nowTheme].subjects) {
      result.push(
        <SubjectButton
          icon={imgs.bottomBar.Plus}
          name={item.name}
          wordCount={40} />
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