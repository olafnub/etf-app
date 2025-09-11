'use client';

import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

interface TradingGraphProps {
  title?: string;
}

interface BitcoinData {
  token: string;
  startDate: string;
  endDate: string;
  monthPrices: number[];
}

interface CMCData {
  token: string;
  startDate: string;
  endDate: string;
  monthPrices: number[];
}

export default function TradingGraph({ title = "Bitcoin & CMC100" }: TradingGraphProps) {
  const [labels, setLabels] = useState<string[]>([]);
  const [btcValues, setBtcValues] = useState<number[]>([]);
  const [cmcValues, setCmcValues] = useState<number[]>([]);
  const [currentBtcPrice, setCurrentBtcPrice] = useState<number>(0);
  const [previousBtcPrice, setPreviousBtcPrice] = useState<number>(0);
  const [currentCmcPrice, setCurrentCmcPrice] = useState<number>(0);
  const [previousCmcPrice, setPreviousCmcPrice] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        // Load Bitcoin data
        const btcRes = await fetch('/bitcoin.json');
        const btcJson: BitcoinData = await btcRes.json();

        // Load CMC data
        const cmcRes = await fetch('/cmc.json');
        const cmcJson: CMCData = await cmcRes.json();

        const start = new Date(btcJson.startDate);
        const count = btcJson.monthPrices.length;
        const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const lbs: string[] = [];
        for (let i = 0; i < count; i++) {
          const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
          lbs.push(`${monthNames[d.getMonth()]} ${d.getFullYear()}`);
        }

        setLabels(lbs);
        setBtcValues(btcJson.monthPrices);
        setCmcValues(cmcJson.monthPrices);
        setPreviousBtcPrice(btcJson.monthPrices[0]);
        setCurrentBtcPrice(btcJson.monthPrices[btcJson.monthPrices.length - 1]);
        setPreviousCmcPrice(cmcJson.monthPrices[0]);
        setCurrentCmcPrice(cmcJson.monthPrices[cmcJson.monthPrices.length - 1]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }
    if (labels.length === 0 || btcValues.length === 0 || cmcValues.length === 0) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'BTC (monthly close)',
            data: btcValues,
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            fill: false,
            borderWidth: 2,
            pointRadius: 2,
            tension: 0.25,
            yAxisID: 'y'
          },
          {
            label: 'CMC100 (monthly close)',
            data: cmcValues,
            borderColor: '#F59E0B',
            backgroundColor: 'rgba(245, 158, 11, 0.2)',
            fill: false,
            borderWidth: 2,
            pointRadius: 2,
            tension: 0.25,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index' as const,
          intersect: false,
        },
        plugins: {
          legend: { 
            display: true,
            labels: {
              color: '#9CA3AF',
              usePointStyle: true
            }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                if (ctx.datasetIndex === 0) {
                  return `BTC: $${Number(ctx.parsed.y).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
                } else {
                  return `CMC100: $${Number(ctx.parsed.y).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
                }
              }
            }
          }
        },
        scales: {
          x: {
            ticks: { color: '#9CA3AF' },
            grid: { color: 'rgba(55,65,81,0.3)' }
          },
          y: {
            type: 'linear' as const,
            display: true,
            position: 'left' as const,
            ticks: {
              color: '#9CA3AF',
              callback: (v) => `$${Number(v).toLocaleString('en-US')}`
            },
            grid: { color: 'rgba(55,65,81,0.3)' }
          },
          y1: {
            type: 'linear' as const,
            display: true,
            position: 'right' as const,
            ticks: {
              color: '#9CA3AF',
              callback: (v) => `$${Number(v).toLocaleString('en-US')}`
            },
            grid: {
              drawOnChartArea: false,
            },
          }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [labels, btcValues, cmcValues]);

  const btcChange = currentBtcPrice - previousBtcPrice;
  const btcPct = previousBtcPrice ? (btcChange / previousBtcPrice) * 100 : 0;
  
  const cmcChange = currentCmcPrice - previousCmcPrice;
  const cmcPct = previousCmcPrice ? (cmcChange / previousCmcPrice) * 100 : 0;

  const timeframes = [
    { label: '1 Year', active: true }
  ];

  if (loading) {
    return (
      <div className="w-full bg-gray-900 rounded-lg p-6 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-900 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-white bg-gray-800 px-4 py-2 rounded-lg">{title}</h2>
          <div className="flex items-center space-x-2">
            {timeframes.map((timeframe) => (
              <button
                key={timeframe.label}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  timeframe.active ? 'bg-white text-gray-900' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {timeframe.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          {/* Bitcoin Stats */}
          <div className="text-right">
            <div className="text-lg font-bold text-green-400">Bitcoin</div>
            <div className="text-2xl font-bold text-white">
              ${currentBtcPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`text-sm font-medium ${btcPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {btcPct >= 0 ? '+' : ''}{btcPct.toFixed(2)}% ({btcChange >= 0 ? '+' : ''}${Math.abs(btcChange).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
            </div>
          </div>
          
          {/* CMC100 Stats */}
          <div className="text-right">
            <div className="text-lg font-bold text-yellow-400">CMC100</div>
            <div className="text-2xl font-bold text-white">
              ${currentCmcPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`text-sm font-medium ${cmcPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {cmcPct >= 0 ? '+' : ''}{cmcPct.toFixed(2)}% ({cmcChange >= 0 ? '+' : ''}${Math.abs(cmcChange).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
            </div>
          </div>
          
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chart.js Line Chart */}
      <div className="relative h-96 mb-6">
        <canvas ref={chartRef} />
      </div>

      {/* Time labels */}
      <div className="flex justify-between text-sm text-gray-400 mt-4">
        <span>{labels[0]}</span>
        <span>{labels[Math.floor(labels.length / 2)]}</span>
        <span>{labels[labels.length - 1]}</span>
      </div>
    </div>
  );
}