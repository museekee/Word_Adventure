import { useParams } from "react-router-dom";
import styles from "./../styles/game.module.scss"
import GaugeX from "../components/gauges/X";

function Game() {
  const { rid } = useParams();
  return (
    <div>
      지금 방 id : {rid}
      <GaugeX id={styles["timeGauge"]} indiPercent={20} teamPercent={75} />
    </div>
  )
}

export default Game