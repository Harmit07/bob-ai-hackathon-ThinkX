'use client'
import dynamic from 'next/dynamic'
import { formatTs } from '../lib/utils'

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false })

interface Props { history: any[]; forecast: any[] }

export default function GridChart({ history, forecast }: Props) {
  const histTs   = history.map((r: any) => formatTs(r.timestamp))
  const foreTs   = forecast.map((r: any) => formatTs(r.timestamp))
  const allTs    = [...histTs, ...foreTs]
  const pad      = (arr: number[]) => ([...arr, ...Array(foreTs.length).fill(null)])
  const padFront = (arr: number[]) => ([...Array(histTs.length).fill(null), ...arr])

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      backgroundColor: '#1c2333',
      borderColor: '#30363d',
      textStyle: { color: '#e6edf3', fontSize: 12 },
    },
    legend: {
      data: ['Demand', 'Solar', 'Wind', 'Curtailment', 'Forecast Demand', 'Forecast Solar', 'Forecast Wind'],
      textStyle: { color: '#7d8590', fontSize: 11 },
      top: 4,
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
    },
    grid: { top: 52, left: 54, right: 20, bottom: 36 },
    xAxis: {
      type: 'category',
      data: allTs,
      axisLabel: { color: '#7d8590', fontSize: 10, rotate: 30 },
      axisLine: { lineStyle: { color: '#30363d' } },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      name: 'MW',
      nameTextStyle: { color: '#7d8590', fontSize: 11 },
      axisLabel: { color: '#7d8590', fontSize: 10 },
      splitLine: { lineStyle: { color: '#1c2333' } },
    },
    series: [
      { name: 'Demand',         type: 'line', data: pad(history.map((r:any)=>r.demand_mw)),   lineStyle:{color:'#2f81f7',width:2.5}, symbol:'none', smooth:true },
      { name: 'Solar',          type: 'line', data: pad(history.map((r:any)=>r.solar_mw)),    lineStyle:{color:'#d29922',width:1.5}, symbol:'none', smooth:true },
      { name: 'Wind',           type: 'line', data: pad(history.map((r:any)=>r.wind_mw)),     lineStyle:{color:'#22d3ee',width:1.5}, symbol:'none', smooth:true },
      { name: 'Curtailment',    type: 'bar',  data: pad(history.map((r:any)=>r.curtailment_mw)), itemStyle:{color:'#db6d28',opacity:0.7}, barMaxWidth:6 },
      { name: 'Forecast Demand',type: 'line', data: padFront(forecast.map((r:any)=>r.demand_mw)),  lineStyle:{color:'#2f81f7',width:2,type:'dashed'}, symbol:'none', smooth:true },
      { name: 'Forecast Solar', type: 'line', data: padFront(forecast.map((r:any)=>r.solar_mw)),   lineStyle:{color:'#d29922',width:1.5,type:'dashed'}, symbol:'none', smooth:true },
      { name: 'Forecast Wind',  type: 'line', data: padFront(forecast.map((r:any)=>r.wind_mw)),    lineStyle:{color:'#22d3ee',width:1.5,type:'dashed'}, symbol:'none', smooth:true },
    ],
  }

  return (
    <div className="card fade-in">
      <div className="card-title">📈 Grid Load & Renewable Output — History + 24h Forecast</div>
      <ReactECharts option={option} style={{ height: 300 }} />
      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
        Solid lines = actual history &nbsp;·&nbsp; Dashed lines = AI forecast &nbsp;·&nbsp; Orange bars = curtailed energy
      </div>
    </div>
  )
}
