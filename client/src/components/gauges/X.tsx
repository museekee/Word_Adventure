import { useEffect, useState } from "react"
import imgs from "../../manager/imageManager"

function GaugeX({
  indiValue, indiMax, teamValue, teamMax, id
}: {
  indiValue: number, indiMax: number, teamValue: number, teamMax: number, id?: string
}) {
  const indiPercent = (indiValue / indiMax) * 100
  const teamPercent = (teamValue / teamMax) * 100
  
  const size = 100
  const teamSize = size
  const indiStrokeWidth = 10
  const teamStrokeWidth = 5
  const indiRadius = (size - indiStrokeWidth) / 2 // 개인전 반지름
  const teamRadius = (teamSize - indiStrokeWidth - teamStrokeWidth) / 2.25 // 팀전 반지름
  const indiCircumference = 2 * Math.PI * indiRadius // 개인전 원주
  const teamCircumference = 2 * Math.PI * teamRadius // 팀전 원주
  
  const indiOffset = indiCircumference - ((indiPercent * 0.75) / 100) * indiCircumference
  const teamOffset = teamCircumference - ((teamPercent * 0.75) / 100) * teamCircumference

  const [style, setStyle] = useState({indi: {}, team: {}})

  useEffect(() => {
    console.log(indiOffset, teamOffset)
    setStyle({
      indi: {
        stroke: "url(#gauge-gradient)",
        strokeWidth: indiStrokeWidth,
        strokeDasharray: indiCircumference,
        strokeDashoffset: indiOffset,
        transform: `rotate(135deg)`,
        transformOrigin: "50%"
      },
      team: {
        stroke: "#00aaff",
        strokeWidth: teamStrokeWidth,
        strokeDasharray: teamCircumference,
        strokeDashoffset: teamOffset,
        transform: `rotate(135deg)`,
        transformOrigin: "50%"
      }
    });
  }, [setStyle, indiStrokeWidth, indiCircumference, teamCircumference, indiOffset, teamOffset, teamStrokeWidth, teamSize])

  return (
    <div style={{
      backgroundImage: `url(${imgs.gauges.x})`,
      backgroundRepeat: "no-repeat",
      backgroundSize: "contain",
      aspectRatio: "1 / 1"
    }} id={id}>
      <span style={{
        position: "absolute", top: "47.5%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "90px", color: "#ffffff"
        }}>{indiValue}</span>
      <svg viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="gauge-gradient" x2="0.75" y2="1">
            <stop offset="22%" stopColor="#ff0000" />
            <stop offset="66%" stopColor="#ffff00" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
        </defs>
        {/* 개인전 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={indiRadius}
          fill="none"
          style={style.indi}
        />
        {/* 팀전 */}
        <circle
          cx={teamSize / 2}
          cy={teamSize / 2}
          r={teamRadius}
          fill="none"
          style={style.team}
        />
      </svg>
    </div>
  )
}

export default GaugeX