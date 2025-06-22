'use client'

import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

interface EarningsData {
  date: string
  amount: number
}

interface EarningsChartProps {
  data: EarningsData[]
}

export function EarningsChart({ data }: EarningsChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Initialize chart
    chartInstance.current = echarts.init(chartRef.current)

    // Prepare data for ECharts
    const dataAxis = data.map(item => 
      new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    )
    const dataValues = data.map(item => item.amount)
    const yMax = Math.max(...dataValues) * 1.2 // Add 20% padding

    const option = {
      title: {
        text: 'Earnings Over Time',
        subtext: 'Click bars to zoom in',
        textStyle: {
          color: '#333',
          fontSize: 16,
          fontWeight: 'bold'
        },
        subtextStyle: {
          color: '#666',
          fontSize: 12
        }
      },
      tooltip: {
        trigger: 'axis',
        formatter: function(params: any) {
          const data = params[0]
          return `${data.name}<br/>Earnings: ${data.value} ETH`
        }
      },
      xAxis: {
        data: dataAxis,
        axisLabel: {
          color: '#666',
          fontSize: 10
        },
        axisTick: {
          show: false
        },
        axisLine: {
          show: false
        },
        z: 10
      },
      yAxis: {
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#999',
          formatter: '{value} ETH'
        }
      },
      dataZoom: [
        {
          type: 'inside'
        }
      ],
      series: [
        {
          type: 'bar',
          showBackground: true,
          backgroundStyle: {
            color: 'rgba(180, 180, 180, 0.1)'
          },
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ]),
            borderRadius: [4, 4, 0, 0]
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#2378f7' },
                { offset: 0.7, color: '#2378f7' },
                { offset: 1, color: '#83bff6' }
              ])
            }
          },
          data: dataValues
        }
      ]
    }

    chartInstance.current.setOption(option)

    // Enable data zoom when user clicks bar
    const zoomSize = 6
    chartInstance.current.on('click', function (params) {
      console.log(dataAxis[Math.max(params.dataIndex - zoomSize / 2, 0)])
      chartInstance.current?.dispatchAction({
        type: 'dataZoom',
        startValue: dataAxis[Math.max(params.dataIndex - zoomSize / 2, 0)],
        endValue: dataAxis[Math.min(params.dataIndex + zoomSize / 2, data.length - 1)]
      })
    })

    // Handle resize
    const handleResize = () => {
      chartInstance.current?.resize()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chartInstance.current?.dispose()
    }
  }, [data])

  return (
    <div 
      ref={chartRef} 
      className="w-full h-80"
      style={{ minHeight: '320px' }}
    />
  )
} 