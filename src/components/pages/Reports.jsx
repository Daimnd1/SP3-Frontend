import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const activityData = [
  { month: 'Jan', 2020: 70, 2021: 85, 2022: 30 },
  { month: 'Feb', 2020: 45, 2021: 75, 2022: 90 },
  { month: 'Mar', 2020: 90, 2021: 50, 2022: 95 },
  { month: 'Apr', 2020: 60, 2021: 85, 2022: 50 },
  { month: 'May', 2020: 55, 2021: 95, 2022: 75 },
  { month: 'Jun', 2020: 30, 2021: 45, 2022: 85 },
  { month: 'Jul', 2020: 80, 2021: 70, 2022: 95 },
  { month: 'Aug', 2020: 75, 2021: 85, 2022: 30 },
  { month: 'Sep', 2020: 85, 2021: 55, 2022: 25 },
  { month: 'Oct', 2020: 35, 2021: 85, 2022: 90 },
  { month: 'Nov', 2020: 90, 2021: 45, 2022: 35 },
  { month: 'Dec', 2020: 25, 2021: 85, 2022: 50 },
];

export default function Reports() {
  return (
    <div className="space-y-6">
      {/* Activity Chart */}
      <div className="bg-zinc-800 border-2 border-zinc-700 rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-zinc-200 mb-6">Activity</h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={activityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8' }}
            />
            <YAxis 
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#e2e8f0'
              }}
            />
            <Legend 
              wrapperStyle={{ color: '#e2e8f0' }}
            />
            <Bar dataKey="2020" fill="#f87171" radius={[4, 4, 0, 0]} />
            <Bar dataKey="2021" fill="#a78bfa" radius={[4, 4, 0, 0]} />
            <Bar dataKey="2022" fill="#38bdf8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card 
          title="Habits"
          text="Stay consistent with your daily routines to build lasting habits."
        />
        <Card 
          title="Tips"
          text="touch grass"
        />
      </div>
    </div>
  )
}

function Card({ title, text }) {
  return (
    <div className="bg-sky-900/60 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="w-1 h-24 bg-sky-500 rounded-full"></div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-zinc-200 mb-2">Tips</h3>
              <p className="text-zinc-300 text-lg">
                touch grass
              </p>
            </div>
          </div>
        </div>
  )
}