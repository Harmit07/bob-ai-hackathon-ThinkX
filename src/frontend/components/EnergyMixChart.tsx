'use client'
import dynamic from 'next/dynamic'

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false })
interface Props { snapshot: any }

export default function EnergyMixChart({ snapshot }: Props) {
  const total = (snapshot?.demand_mw ?? 0) || 1
  const data = [
    { value: Math.round(snapshot?.solar_mw || 0),        name: 'Solar ☀️',        itemStyle: { color: '#d29922' } },
    { value: Math.round(snapshot?.wind_mw || 0),         name: 'Wind 💨',          itemStyle: { color: '#22d3ee' } },
    { value: Math.round(snapshot?.conventional_mw || 0), name: 'Conventional 🏭',  itemStyle: { color: '#7d8590' } },
    { value: Math.round(snapshot?.curtailment_mw || 0),  name: 'Curtailed 🚫',     itemStyle: { color: '#db6d28' } },
  ].filter(d => d.value > 0)

  const renewPct = Math.round((snapshot?.renewable_penetration_pct ?? 0))

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => `${p.name}<br/><b>${p.value} MW</b> (${p.percent}%)`,
      backgroundColor: '#1c2333',
      borderColor: '#30363d',
      textStyle: { color: '#e6edf3', fontSize: 12 },
    },
    legend: {
      orient: 'vertical', right: 4, top: 'middle',
      textStyle: { color: '#7d8590', fontSize: 11 },
      itemWidth: 10, itemHeight: 10,
    },
    series: [{
      type: 'pie', radius: ['42%', '68%'], center: ['38%', '50%'],
      data,
      label: { show: true, formatter: '{d}%', fontSize: 10, color: '#e6edf3' },
      labelLine: { lineStyle: { color: '#30363d' } },
      emphasis: { itemStyle: { shadowBlur: 8, shadowColor: 'rgba(0,0,0,0.4)' } },
    }],
  }

  return (
    <div className="card fade-in">
      <div className="card-title">🔋 Current Energy Mix</div>
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: '#3fb950' }}>{renewPct}%</span>
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>Renewable Share</div>
      </div>
      <ReactECharts option={option} style={{ height: 190 }} />
    </div>
  )
}
