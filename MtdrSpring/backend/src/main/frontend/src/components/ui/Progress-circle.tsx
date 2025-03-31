export interface ProgressCircleProps {
    value: number
    color: string
    label: string
  }
  
  export function ProgressCircle({ value, color, label }: ProgressCircleProps) {
    // Calculate the circumference of the circle
    const radius = 35
    const circumference = 2 * Math.PI * radius
  
    // Calculate the dash offset based on the percentage
    const dashOffset = circumference - (value / 100) * circumference
  
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
          {/* Background circle */}
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#f0f0f0" strokeWidth="8" />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke={color}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
            {/* Percentage text */}
            <text x="50" y="55" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#333">
              {value}%
            </text>
          </svg>
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
          <span className="text-sm text-gray-600">{label}</span>
        </div>
      </div>
    )
  }
  
  