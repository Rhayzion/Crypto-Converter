// Toggle between Converter and Tracker tabs
function showTab(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');

    const tabButtons = document.querySelectorAll('.tab');
    tabButtons.forEach(button => button.classList.remove('active'));
    document.querySelector(`[onclick="showTab('${tabId}')"]`).classList.add('active');
}

// Toggle conversion direction
let conversionDirection = 'cryptoToFiat'; // Default direction
function toggleDirection() {
    conversionDirection = conversionDirection === 'cryptoToFiat' ? 'fiatToCrypto' : 'cryptoToFiat';
    updateConversionPlaceholders();
}

function updateConversionPlaceholders() {
    const cryptoAmount = document.getElementById('crypto-amount');
    const fiatAmount = document.getElementById('fiat-amount');

    if (conversionDirection === 'cryptoToFiat') {
        cryptoAmount.placeholder = 'Amount in Crypto';
        fiatAmount.placeholder = 'Converted Amount';
        fiatAmount.readOnly = true;
        cryptoAmount.readOnly = false;
    } else {
        cryptoAmount.placeholder = 'Converted Amount';
        fiatAmount.placeholder = 'Amount in Fiat';
        cryptoAmount.readOnly = true;
        fiatAmount.readOnly = false;
    }
}

// Convert function
async function convertCrypto() {
    const cryptoSelect = document.getElementById('crypto-select').value;
    const fiatSelect = document.getElementById('fiat-select').value;

    const cryptoAmount = parseFloat(document.getElementById('crypto-amount').value);
    const fiatAmount = parseFloat(document.getElementById('fiat-amount').value);

    if ((conversionDirection === 'cryptoToFiat' && isNaN(cryptoAmount)) ||
        (conversionDirection === 'fiatToCrypto' && isNaN(fiatAmount))) {
        alert('Please enter a valid amount.');
        return;
    }

    const exchangeRate = await fetchExchangeRate(cryptoSelect, fiatSelect);
    if (!exchangeRate) {
        alert('Failed to fetch exchange rate. Try again later.');
        return;
    }

    let result;
    if (conversionDirection === 'cryptoToFiat') {
        result = (cryptoAmount * exchangeRate).toFixed(2);
        document.getElementById('fiat-amount').value = result;
    } else {
        result = (fiatAmount / exchangeRate).toFixed(8);
        document.getElementById('crypto-amount').value = result;
    }

    document.getElementById('conversion-result').innerText = 
        `Conversion successful: ${conversionDirection === 'cryptoToFiat' ? cryptoAmount : fiatAmount} 
        ${conversionDirection === 'cryptoToFiat' ? cryptoSelect : fiatSelect.toUpperCase()} 
        is approximately ${result} ${conversionDirection === 'cryptoToFiat' ? fiatSelect.toUpperCase() : cryptoSelect}`;
}

// Fetch exchange rate from an API
async function fetchExchangeRate(crypto, fiat) {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${crypto}&vs_currencies=${fiat}`);
        const data = await response.json();
        return data[crypto]?.[fiat] || null;
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
        return null;
    }
}

// Load tracker data
async function loadTrackerData() {
    const trackerDataContainer = document.getElementById('tracker-data');
    trackerDataContainer.innerHTML = ''; // Clear existing rows

    const cryptos = ['bitcoin', 'ethereum', 'solana', 'cardano'];
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptos.join(',')}&vs_currencies=usd&include_24hr_change=true`);
        const data = await response.json();

        for (const crypto of cryptos) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${crypto.charAt(0).toUpperCase() + crypto.slice(1)} (${crypto.toUpperCase()})</td>
                <td>$${data[crypto].usd.toFixed(2)}</td>
                <td>${data[crypto].usd_24h_change.toFixed(2)}%</td>
            `;
            trackerDataContainer.appendChild(row);
        }
    } catch (error) {
        console.error('Error fetching tracker data:', error);
        trackerDataContainer.innerHTML = '<tr><td colspan="3">Failed to load data.</td></tr>';
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Load tracker data initially
    loadTrackerData();

    // Refresh tracker data every 5 minutes
    setInterval(loadTrackerData, 300000);
});


const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Check if the user has a saved theme preference
const savedTheme = localStorage.getItem('theme');

// If a preference is saved, apply it
if (savedTheme) {
  body.classList.add(savedTheme); // Apply saved theme (light-mode or dark-mode)
  const icon = themeToggle.querySelector('i');

  // Set the icon according to the saved theme
  if (savedTheme === 'light-mode') {
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
  } else {
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
  }
}

// Event listener for toggling the theme
themeToggle.addEventListener('click', () => {
  const icon = themeToggle.querySelector('i');
  
  // Toggle between light and dark modes
  if (body.classList.contains('light-mode')) {
    body.classList.remove('light-mode');
    localStorage.setItem('theme', 'dark-mode'); // Save dark mode preference
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
  } else {
    body.classList.add('light-mode');
    localStorage.setItem('theme', 'light-mode'); // Save light mode preference
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
  }
});






  const API_URL = "https://api.coingecko.com/api/v3/simple/price";
    const ALL_COINS_URL = "https://api.coingecko.com/api/v3/coins/list";
    const cryptoList = document.getElementById("crypto-list");
    const addCryptoButton = document.getElementById("add-crypto-button");
    const cryptoInput = document.getElementById("crypto-input");
    const suggestionsDiv = document.getElementById("suggestions");
    let trackedCryptos = JSON.parse(localStorage.getItem("trackedCryptos")) || [];
    let allCoins = [];

    const defaultCryptos = ['bitcoin', 'ethereum', 'litecoin']; // Default popular cryptos

    async function fetchAllCoins() {
      try {
        const response = await fetch(ALL_COINS_URL);
        allCoins = await response.json();
      } catch (error) {
        console.error("Error fetching coins:", error);
      }
    }

    async function fetchPrices() {
      if (trackedCryptos.length === 0) return;
      try {
        const response = await fetch(`${API_URL}?ids=${trackedCryptos.join(",")}&vs_currencies=usd&include_24hr_change=true`);
        const data = await response.json();
        cryptoList.innerHTML = "";
        trackedCryptos.forEach((id) => {
          if (data[id]) {
            const item = createCryptoItem(id, data[id].usd, data[id].usd_24h_change);
            cryptoList.appendChild(item);
          }
        });
      } catch (error) {
        console.error("Error fetching prices:", error);
      }
    }

 function createCryptoItem(name, price, change) {
  const li = document.createElement("li");
  li.dataset.id = name;

  // Create the crypto icon element
  const icon = document.createElement("i");
  icon.className = "crypto-icon"; // Base class for styling

  // Assign the correct Font Awesome class based on the crypto name
  switch (name.toLowerCase()) {
    case "bitcoin":
      icon.classList.add("fab", "fa-bitcoin"); // Font Awesome Bitcoin icon
      break;
    case "ethereum":
      icon.classList.add("fab", "fa-ethereum"); // Font Awesome Ethereum icon
      break;
    default:
      icon.classList.add("fas", "fa-coins"); // Generic icon for other cryptos
      break;
  }

  // Create a container for crypto info
  const infoDiv = document.createElement("div");
  infoDiv.className = "crypto-info";

  const nameDiv = document.createElement("div");
  nameDiv.className = "crypto-name";
  nameDiv.textContent = name.charAt(0).toUpperCase() + name.slice(1);

  const priceDiv = document.createElement("div");
  priceDiv.className = "price";
  priceDiv.textContent = `$${price.toFixed(2)}`;

  const changeDiv = document.createElement("div");
  changeDiv.className = `change ${change >= 0 ? "positive" : "negative"}`;
  changeDiv.textContent = `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;

  // Add a delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.innerHTML = '<i class="fas fa-trash"></i>'; // Font Awesome trash icon
  deleteBtn.addEventListener("click", () => {
    trackedCryptos = trackedCryptos.filter((crypto) => crypto !== name);
    localStorage.setItem("trackedCryptos", JSON.stringify(trackedCryptos));
    fetchPrices();
  });

  // Append elements to the list item
  li.appendChild(icon);
  infoDiv.appendChild(nameDiv);
  infoDiv.appendChild(priceDiv);
  infoDiv.appendChild(changeDiv);
  li.appendChild(infoDiv);
  li.appendChild(deleteBtn);

  return li;
}

      

    function enableSorting() {
      new Sortable(cryptoList, {
        animation: 150,
        onEnd: saveOrder,
      });
    }

    function saveOrder() {
      const order = Array.from(cryptoList.children).map((item) => item.dataset.id);
      localStorage.setItem("cryptoOrder", JSON.stringify(order));
    }

    function loadOrder() {
      const order = JSON.parse(localStorage.getItem("cryptoOrder"));
      if (order) {
        trackedCryptos = order;
      }
    }

    function addCrypto() {
      const cryptoName = cryptoInput.value.trim().toLowerCase();
      if (cryptoName && !trackedCryptos.includes(cryptoName)) {
        trackedCryptos.push(cryptoName);
        localStorage.setItem("trackedCryptos", JSON.stringify(trackedCryptos));
        cryptoInput.value = "";
        fetchPrices();
      }
    }

    function fetchSuggestions(query) {
      if (!query) {
        suggestionsDiv.style.display = "none";
        return;
      }
      const suggestions = allCoins.filter((coin) => coin.id.startsWith(query.toLowerCase()));
      suggestionsDiv.innerHTML = "";
      suggestions.forEach((suggestion) => {
        const div = document.createElement("div");
        div.className = "suggestion-item";
        div.textContent = suggestion.id.charAt(0).toUpperCase() + suggestion.id.slice(1);
        div.addEventListener("click", () => {
          cryptoInput.value = suggestion.id;
          suggestionsDiv.style.display = "none";
        });
        suggestionsDiv.appendChild(div);
      });
      suggestionsDiv.style.display = suggestions.length ? "block" : "none";
    }

    cryptoInput.addEventListener("input", (e) => {
      fetchSuggestions(e.target.value);
    });

    addCryptoButton.addEventListener("click", addCrypto);

    loadOrder();
    fetchAllCoins().then(() => {
      // Add default cryptos if not already added
      defaultCryptos.forEach((crypto) => {
        if (!trackedCryptos.includes(crypto)) {
          trackedCryptos.push(crypto);
        }
      });
      localStorage.setItem("trackedCryptos", JSON.stringify(trackedCryptos));
      fetchPrices();
    });

    enableSorting();

// Hamburger Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('show'); // Toggle the "show" class
});


window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.app-navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('sticky', 'blurred');
  } else {
    navbar.classList.remove('sticky', 'blurred');
  }
});




