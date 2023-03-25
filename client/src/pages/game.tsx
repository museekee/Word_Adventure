import { useParams } from "react-router-dom";

function Game() {
  const { rid } = useParams();
  return (
    <div>
      지금 방 id : {rid}
    </div>
  )
}

export default Game