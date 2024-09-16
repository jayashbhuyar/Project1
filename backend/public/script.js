async function fetchData() {
    try {
        const response = await fetch('/api/tickers');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        updateTable(data);
        updateMainPrice(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('crypto-data').innerHTML = '<tr><td colspan="6">Error fetching data. Please try again later.</td></tr>';
    }
}

function updateTable(tickers) {
    const tableBody = document.getElementById('crypto-data');
    tableBody.innerHTML = '';

    tickers.forEach((crypto, index) => {
        const row = document.createElement('tr');
        const difference = ((parseFloat(crypto.buy) - parseFloat(crypto.last)) / parseFloat(crypto.last) * 100).toFixed(2);
        const savings = (parseFloat(crypto.buy) - parseFloat(crypto.last)).toFixed(2);
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${crypto.name}</td>
            <td>₹ ${Number(crypto.last).toLocaleString()}</td>
            <td>₹ ${Number(crypto.buy).toLocaleString()} / ₹ ${Number(crypto.sell).toLocaleString()}</td>
            <td style="color: ${difference > 0 ? '#3dc6c1' : '#f44336'};">${difference}%</td>
            <td style="color: ${savings > 0 ? '#3dc6c1' : '#f44336'};">▲ ₹ ${Math.abs(savings).toLocaleString()}</td>
        `;
        tableBody.appendChild(row);
    });
}

function updateMainPrice(tickers) {
    const mainPriceElement = document.getElementById('average-price');
    const averagePrice = tickers.reduce((sum, ticker) => sum + parseFloat(ticker.last), 0) / tickers.length;
    mainPriceElement.textContent = `₹ ${averagePrice.toLocaleString(undefined, {maximumFractionDigits: 0})}`;
}

function updateTimer() {
    const timerElement = document.getElementById('timer');
    let seconds = 60;

    const countdown = setInterval(() => {
        seconds--;
        timerElement.textContent = seconds;

        if (seconds <= 0) {
            clearInterval(countdown);
            fetchData();
            updateTimer();
        }
    }, 1000);
}

function initThemeToggle() {
    const themeSwitch = document.getElementById('theme-switch');
    const body = document.body;

    // Check for saved theme preference or default to dark theme
    const currentTheme = localStorage.getItem('theme') || 'dark';
    body.classList.add(currentTheme + '-theme');
    themeSwitch.checked = currentTheme === 'light';

    themeSwitch.addEventListener('change', function() {
        if (this.checked) {
            body.classList.replace('dark-theme', 'light-theme');
            localStorage.setItem('theme', 'light');
        } else {
            body.classList.replace('light-theme', 'dark-theme');
            localStorage.setItem('theme', 'dark');
        }
    });
}

// Initialize the app
function init() {
    fetchData();
    updateTimer();
    initThemeToggle();
}

// Call init when the page loads
document.addEventListener('DOMContentLoaded', init);
