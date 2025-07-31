let chart = null;

async function getStockInfo() {
    const stockCode = document.getElementById('stockCode').value.trim();
    const stockInfo = document.getElementById('stockInfo');
    
    if (!stockCode) {
        stockInfo.innerHTML = '<p class="error">Please enter a stock code</p>';
        return;
    }

    try {
        // Using Taiwan Stock Exchange API (TWSE)
        const response = await fetch(`https://www.twse.com.tw/en/exchangeReport/STOCK_DAY?response=json&date=${getFormattedDate()}&stockNo=${stockCode}`);
        const data = await response.json();

        if (data.stat !== 'OK') {
            throw new Error('Unable to fetch stock data');
        }

        // Process and display the data
        displayStockData(data);
    } catch (error) {
        stockInfo.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    }
}

function getFormattedDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

function displayStockData(data) {
    const stockInfo = document.getElementById('stockInfo');
    
    // Extract dates and closing prices for the chart
    const dates = data.data.map(row => row[0]);
    const prices = data.data.map(row => parseFloat(row[6].replace(/,/g, '')));

    // Update the chart
    updateChart(dates, prices);

    // Display additional information
    const latestData = data.data[data.data.length - 1];
    stockInfo.innerHTML = `
        <h2>Stock Information for ${data.title}</h2>
        <p>Latest Trading Date: ${latestData[0]}</p>
        <p>Opening Price: ${latestData[3]}</p>
        <p>Highest Price: ${latestData[4]}</p>
        <p>Lowest Price: ${latestData[5]}</p>
        <p>Closing Price: ${latestData[6]}</p>
        <p>Trading Volume: ${latestData[1]}</p>
    `;
}

function updateChart(dates, prices) {
    const ctx = document.getElementById('stockChart').getContext('2d');

    // Destroy previous chart if it exists
    if (chart) {
        chart.destroy();
    }

    // Create new chart
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Closing Price',
                data: prices,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}
