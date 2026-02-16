'use client'

interface UserStatsProps {
  totalXp: number
  currentStreak: number
  level: number
}

export default function UserStats({ totalXp, currentStreak, level }: UserStatsProps) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Your Stats</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <span className="text-gray-700">Level</span>
            </div>
            <span className="text-2xl font-bold text-blue-600">{level}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💎</span>
              <span className="text-gray-700">Total XP</span>
            </div>
            <span className="text-2xl font-bold text-blue-600">{totalXp}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              <span className="text-gray-700">Streak</span>
            </div>
            <span className="text-2xl font-bold text-orange-600">{currentStreak}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Daily Goal</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="text-gray-800 font-semibold">{Math.min(totalXp % 50, 50)}/50 XP</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${Math.min((totalXp % 50) / 50 * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}
