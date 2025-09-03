// curl -s "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=610" > bitcoin_recent.json
// node process_bitcoin_data.js

const fs = require('fs');

// Read the Bitcoin data
const data = JSON.parse(fs.readFileSync('bitcoin_recent.json', 'utf8'));

// Extract prices and convert timestamps to dates
const prices = data.prices.map(([timestamp, price]) => ({
    date: new Date(timestamp),
    price: price
}));

// Group by month and get the last price of each month
const monthlyPrices = {};
prices.forEach(({date, price}) => {
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyPrices[monthKey]) {
        monthlyPrices[monthKey] = [];
    }
    monthlyPrices[monthKey].push({date, price});
});

// Get the last price of each month
const monthlyClosingPrices = {};
Object.keys(monthlyPrices).forEach(month => {
    const monthData = monthlyPrices[month];
    const lastEntry = monthData[monthData.length - 1];
    monthlyClosingPrices[month] = {
        date: lastEntry.date,
        price: lastEntry.price
    };
});

// Filter for the requested period (Jan 2024 to Sep 2025)
const requestedMonths = [];
for (let year = 2024; year <= 2025; year++) {
    const startMonth = year === 2024 ? 1 : 1;
    const endMonth = year === 2025 ? 9 : 12;
    
    for (let month = startMonth; month <= endMonth; month++) {
        const monthKey = `${year}-${String(month).padStart(2, '0')}`;
        if (monthlyClosingPrices[monthKey]) {
            requestedMonths.push({
                month: monthKey,
                date: monthlyClosingPrices[monthKey].date,
                price: monthlyClosingPrices[monthKey].price
            });
        }
    }
}

// Sort by date
requestedMonths.sort((a, b) => a.date - b.date);

console.log('Bitcoin Monthly Closing Prices (Jan 2024 - Sep 2025):');
requestedMonths.forEach(({month, date, price}) => {
    console.log(`${month}: $${price.toFixed(2)} (${date.toLocaleDateString()})`);
});

// Create the updated JSON structure
const updatedData = {
    "token": "bitcoin",
    "startDate": "1/1/2024",
    "endDate": "09/01/2025",
    "monthPrices": requestedMonths.map(item => Math.round(item.price * 100) / 100)
};

// Write the updated data
fs.writeFileSync('../frontend/src/app/placeholder/bitcoin.json', JSON.stringify(updatedData, null, 4));
console.log('\nUpdated bitcoin.json file with real monthly prices!');