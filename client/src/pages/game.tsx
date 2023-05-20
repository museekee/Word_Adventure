import { useParams } from "react-router-dom";
import styles from "./../styles/game.module.scss"
import GaugeX from "../components/gauges/X";
import { useEffect, useState } from "react";
import axios from "axios";
import Api from "./../../../common/types/api"

function Game() {
  const { rid } = useParams();
  const [roomData, setRoomData] = useState<Api.Rooms & {startTime: number}>({title: '', user: '', subjects: [], rounds: 0, time: 0, startTime: 0})
  const [commonRoundTime, setCommonRoundTime] = useState(0)
  const [roundTime, setRoundTime] = useState(0)
  useEffect(() => {
    (async () => {
      const result = await axios.get(`/api/rooms/${rid}/data`)
      console.log(result)
      setRoomData(result.data)
      setRoomData(prevstate => {return {...prevstate, startTime: performance.now()}})
    })()
  }, [])
  useEffect(() => {
    setCommonRoundTime(roomData.time)
    setRoundTime(roomData.time)
  }, [roomData])
  useEffect(() => {
    const countdown = setInterval(() => {
      setCommonRoundTime(commonRoundTime - 10)
    }, 10);
    return () => clearInterval(countdown);
  }, [commonRoundTime])

  return (
    <div>
      지금 방 id : {rid}
      <GaugeX id={styles["timeGauge"]} indiValue={75} indiMax={100} teamValue={commonRoundTime} teamMax={roomData.time} />
    </div>
  )
}

export default Game