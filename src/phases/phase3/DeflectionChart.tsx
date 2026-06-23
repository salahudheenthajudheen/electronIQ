import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DeflectionChartProps {
  data: { variable: string; deflection: number }[]
}

export function DeflectionChart({ data }: DeflectionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="variable" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip
          contentStyle={{ backgroundColor: '#111827', border: '1px solid #334155', borderRadius: '8px' }}
          labelStyle={{ color: '#f1f5f9' }}
        />
        <Line type="monotone" dataKey="deflection" stroke="#6C63FF" strokeWidth={2} dot={{ fill: '#6C63FF' }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
