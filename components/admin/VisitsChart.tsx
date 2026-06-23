'use client'

interface VisitData {
  date: string
  count: number
}

export function VisitsChart({ data }: { data: VisitData[] }) {
  // Find maximum visits count to scale chart correctly
  const maxVal = Math.max(...data.map(d => d.count), 1)

  return (
    <div className="space-y-6">
      {/* Bars Chart container */}
      <div className="h-64 flex items-end gap-2 sm:gap-4 pt-6 border-b border-zinc-800">
        {data.map((item, idx) => {
          const percentage = (item.count / maxVal) * 100
          return (
            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 bg-zinc-900 border border-zinc-800 text-white text-xs px-2 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-bold whitespace-nowrap">
                {item.count} {item.count === 1 ? 'visita' : 'visitas'}
              </div>

              {/* Animated Column Bar */}
              <div 
                className="w-full bg-gradient-to-t from-primary/50 to-primary rounded-t-lg group-hover:from-primary/75 group-hover:to-indigo-400 transition-all duration-500 ease-out shadow-[0_0_15px_rgba(99,102,241,0.2)] group-hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                style={{ height: `${percentage}%`, minHeight: item.count > 0 ? '8px' : '2px' }}
              />
            </div>
          )
        })}
      </div>

      {/* X Axis Labels */}
      <div className="flex gap-2 sm:gap-4 text-center">
        {data.map((item, idx) => (
          <div key={idx} className="flex-1 text-[10px] sm:text-xs text-zinc-500 font-medium truncate">
            {item.date}
          </div>
        ))}
      </div>
    </div>
  )
}
