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
    id: string,
    name: string,
    subjects: {
        id: string,
        name: string,
        degree: number,
        bgColor: string,
        wordCount: number
    }[]
  }[]>([])
  const [nowTheme, setNowTheme] = useState<string>()
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [searchData, setSearchData] = useState<{
    theme: {
      id: string,
      name: string
    },
    subject: {
        id: string,
        name: string,
        degree: number,
        bgColor: string,
        wordCount: number
    }
  }[]>([])
  useEffect(() => {
    (async () => {
      const result = await axios.get("/api/getSubjects")
      setSubjects(result.data)
      setNowTheme("*")
    })()
  }, [])
  const themeListRendering = () => {
    const result = [
      <ThemeButton
        selected={nowTheme === "*"}
        icon={imgs.theme.All}
        name={"전체"}
        width={120}
        onClick={() => setNowTheme("*")} />
    ]
    if (!subjects) return null
    const TThemes: {[x: string]: string} = imgs.theme
    for (const theme of subjects) {
      result.push(
        <ThemeButton
          selected={nowTheme === theme.id}
          icon={TThemes[theme.id] ?? imgs.theme.none} 
          name={theme.name}
          width={120}
          onClick={() => setNowTheme(theme.id)} />
      )
    }
    return result
  }
  const subjectListRendering = () => {
    const result = []
    if (!subjects || !nowTheme) return null
    const TSubjects: {[x: string]: string} = imgs.subject
    for (const theme of subjects) {
      if (nowTheme !== "*" && theme.id !== nowTheme) continue
      for (const subject of theme.subjects) {
        result.push(
          <SubjectButton
            icon={TSubjects[subject.id] ?? imgs.subject.none}
            name={subject.name}
            wordCount={subject.wordCount}
            degree={subject.degree}
            bgColor={subject.bgColor}
            onClick={() => {
              if (!selectedSubjects.includes(subject.id))
                setSelectedSubjects((prevState) => {
                  return [...prevState, subject.id]
                })
              else
                setSelectedSubjects(selectedSubjects.filter(v => subject.id !== v))
            }}
            selected={selectedSubjects.includes(subject.id)} />
        )
      }
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
              <input type={"text"} placeholder={"주제 이름을 입력하세요."} onChange={(e) => {
                for (const theme of subjects) {
                  for (const subject of theme.subjects) {
                    if (subject.name.includes(e.target.value))
                      setSearchData(prevState => [...prevState, {
                        subject: subject,
                        theme: theme
                      }])
                  }
                }
              }}></input>
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