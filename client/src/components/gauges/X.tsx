import { useEffect, useState } from "react"

function GaugeX({
  size,strokeWidth, percent
}: {
  size: number, strokeWidth: number, percent: number
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent * 0.75 / 100) * circumference

  const [style, setStyle] = useState({})

  useEffect(() => {
    const progress = {
      stroke: "url(#gauge-gradient)",
      strokeLinecap: 'round',
      strokeWidth: strokeWidth,
      strokeDasharray: circumference,
      strokeDashoffset: offset,
    }
    setStyle(progress);
  }, [setStyle, strokeWidth, circumference, offset])

  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{
      transform: `rotate(135deg)`
    }}>
      <defs>
        <linearGradient id="gauge-gradient" x2="0.75" y2="1">
          <stop offset="22%" stop-color="#ff0000" />
          <stop offset="66%" stop-color="#ffff00" />
          <stop offset="100%" stop-color="#ffffff" />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e9e9e9"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        style={style}
      />
    </svg>
  )
}

export default GaugeX