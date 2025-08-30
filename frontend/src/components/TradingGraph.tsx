'use client';

import { useState } from 'react';

interface PricePoint {
  time: string;
  price: number;
}

interface TradingGraphProps {
  title?: string;
  data?: PricePoint[];
}

// Sample data for demonstration
const sampleData: PricePoint[] = [
  { time: '09:00', price: 43000 },
  { time: '10:00', price: 43150 },
  { time: '11:00', price: 42980 },
  { time: '12:00', price: 43250 },
  { time: '13:00', price: 43180 },
  { time: '14:00', price: 43420 },
  { time: '15:00', price: 43380 },
  { time: '16:00', price: 43500 },
  { time: '17:00', price: 43280 },
  { time: '18:00', price: 43350 },
];

export default function TradingGraph({ title = "CMC100", data = sampleData }: TradingGraphProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('All');
  
  // Calculate min and max prices for scaling
  const prices = data.map(point => point.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;
  
  // Current price and change
  const currentPrice = prices[prices.length - 1];
  const previousPrice = prices[0];
  const priceChange = currentPrice - previousPrice;
  const percentChange = (priceChange / previousPrice) * 100;
  
  // Generate SVG path for the line chart
  const generatePath = () => {
    const width = 100; // percentage
    const height = 100; // percentage
    
    return data.map((point, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((point.price - minPrice) / priceRange) * height;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const timeframes = [
    { label: 'Constituent Weights', active: false },
    { label: '24h', active: false },
    { label: '7d', active: false },
    { label: '30d', active: false },
    { label: '1y', active: false },
    { label: 'All', active: true }
  ];

  return (
    <div className="w-full h-full bg-gray-900 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-white bg-gray-800 px-4 py-2 rounded-lg">{title}</h2>
          <div className="flex items-center space-x-2">
            {timeframes.map((timeframe) => (
              <button
                key={timeframe.label}
                onClick={() => setSelectedTimeframe(timeframe.label)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  timeframe.active || selectedTimeframe === timeframe.label
                    ? 'bg-white text-gray-900'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {timeframe.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-3xl font-bold text-white">
              ${currentPrice.toFixed(2)}
            </div>
          </div>
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-96 mb-6">
        {/* Price labels on the right */}
        <div className="absolute right-0 top-0 h-full flex flex-col justify-between text-sm text-gray-400 pr-4 z-10">
          <span>${(maxPrice * 1.2).toFixed(2)}</span>
          <span>${maxPrice.toFixed(2)}</span>
          <span>${((maxPrice + minPrice) / 2).toFixed(2)}</span>
          <span>${minPrice.toFixed(2)}</span>
          <span>${(minPrice * 0.8).toFixed(2)}</span>
        </div>
        
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Horizontal grid lines */}
          <defs>
            <pattern
              id="grid"
              width="100"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 0 20 L 100 20"
                fill="none"
                stroke="#374151"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          
          {/* Area fill */}
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor: '#10B981', stopOpacity: 0.3}} />
              <stop offset="100%" style={{stopColor: '#10B981', stopOpacity: 0}} />
            </linearGradient>
          </defs>
          
          <path
            d={`${generatePath()} L 100 100 L 0 100 Z`}
            fill="url(#areaGradient)"
          />
          
          {/* Price line */}
          <path
            d={generatePath()}
            fill="none"
            stroke="#10B981"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
          
          {/* Current price indicator */}
          <circle
            cx="100"
            cy={100 - ((currentPrice - minPrice) / priceRange) * 100}
            r="3"
            fill="#10B981"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        
        {/* Current price tooltip */}
        <div className="absolute top-4 right-16 bg-green-500 text-white px-3 py-1 rounded text-sm font-medium">
          ${currentPrice.toFixed(2)}
        </div>
      </div>

      {/* Time labels */}
      <div className="flex justify-between text-sm text-gray-400 mt-4">
        <span>31 Dec 2023</span>
        <span>20 Jul 2024</span>
        <span>07 Feb 2025</span>
      </div>
    </div>
  );
}