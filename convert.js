const themeToggle = document.getElementById('themeToggle');
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const icon = themeToggle.querySelector('i');
            if (document.body.classList.contains('light-theme')) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        });
        
        // Particle Background
        function createParticles() {
            const particlesContainer = document.getElementById('particles');
            const particleCount = window.innerWidth < 768 ? 30 : 50;
            
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.classList.add('particle');
                
    
                const size = Math.random() * 2 + 1;
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                
                
                particle.style.left = `${Math.random() * 100}vw`;
                particle.style.top = `${Math.random() * 100}vh`;
                
        
                const duration = Math.random() * 10 + 10;
                particle.style.animationDuration = `${duration}s`;
                
                
                particle.style.animationDelay = `${Math.random() * 10}s`;
                
            
                const colors = ['#ffc700', '#f8ff00', '#ff5e00'];
                const color = colors[Math.floor(Math.random() * colors.length)];
                particle.style.background = color;
                
                particlesContainer.appendChild(particle);
            }
        }
        
        // init particles
        createParticles();
        
    
        function showTab(tabId) {
            const tabs = document.querySelectorAll('.tab-content');
            tabs.forEach(tab => tab.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            
            const tabButtons = document.querySelectorAll('.tab');
            tabButtons.forEach(button => button.classList.remove('active'));
            document.querySelector(`[onclick="showTab('${tabId}')"]`).classList.add('active');
            
        
            document.getElementById(tabId).classList.add('animate__animated', 'animate__fadeIn');
            setTimeout(() => {
                document.getElementById(tabId).classList.remove('animate__animated', 'animate__fadeIn');
            }, 1000);
        }
        
        // conversion direction
        let conversionDirection = 'cryptoToFiat'; // Default direction
        function toggleDirection() {
            conversionDirection = conversionDirection === 'cryptoToFiat' ? 'fiatToCrypto' : 'cryptoToFiat';
            updateConversionPlaceholders();
            
            
            const toggleBtn = document.getElementById('toggle-direction');
            toggleBtn.classList.add('animate__animated', 'animate__flipInY');
            setTimeout(() => {
                toggleBtn.classList.remove('animate__animated', 'animate__flipInY');
            }, 1000);
        }
        
        function updateConversionPlaceholders() {
            const cryptoAmount = document.getElementById('crypto-amount');
            const fiatAmount = document.getElementById('fiat-amount');
            
            if (conversionDirection === 'cryptoToFiat') {
                cryptoAmount.placeholder = '0.00';
                fiatAmount.placeholder = '0.00';
                fiatAmount.readOnly = true;
                cryptoAmount.readOnly = false;
                
                
                document.querySelector('.input-group:nth-child(1) label').textContent = 'From';
                document.querySelector('.input-group:nth-child(3) label').textContent = 'To';
            } else {
                cryptoAmount.placeholder = '0.00';
                fiatAmount.placeholder = '0.00';
                cryptoAmount.readOnly = true;
                fiatAmount.readOnly = false;
                
                
                document.querySelector('.input-group:nth-child(1) label').textContent = 'To';
                document.querySelector('.input-group:nth-child(3) label').textContent = 'From';
            }
            
            
            cryptoAmount.value = '';
            fiatAmount.value = '';
            document.getElementById('conversion-result').innerHTML = '';
        }
        
        //  function to convert 
        async function convertCrypto() {
            const cryptoSelect = document.getElementById('crypto-select').value;
            const fiatSelect = document.getElementById('fiat-select').value;
            
            const cryptoAmount = parseFloat(document.getElementById('crypto-amount').value);
            const fiatAmount = parseFloat(document.getElementById('fiat-amount').value);
            
            
            if ((conversionDirection === 'cryptoToFiat' && isNaN(cryptoAmount)) ||
                (conversionDirection === 'fiatToCrypto' && isNaN(fiatAmount))) {
                showNotification('Please enter a valid amount', 'error');
                return;
            }
            
            //  button animation
            const convertButton = document.getElementById('convert-button');
            const buttonText = document.getElementById('convert-button-text');
            convertButton.classList.add('loading');
            buttonText.textContent = 'Converting...';
            convertButton.disabled = true;
            
            try {
                const exchangeRate = await fetchExchangeRate(cryptoSelect, fiatSelect);
                if (!exchangeRate) {
                    throw new Error('Failed to fetch exchange rate');
                }
                
                let result;
                if (conversionDirection === 'cryptoToFiat') {
                    result = (cryptoAmount * exchangeRate).toFixed(2);
                    document.getElementById('fiat-amount').value = result;
                } else {
                    result = (fiatAmount / exchangeRate).toFixed(8);
                    document.getElementById('crypto-amount').value = result;
                }
                
                
                setTimeout(() => {
                    convertButton.classList.remove('loading');
                    buttonText.textContent = 'Convert';
                    convertButton.disabled = false;
                    
                    document.getElementById('conversion-result').innerHTML = `
                        <span class="conversion-success">Conversion successful</span>
                        <div style="margin-top: 1rem;">
                            <span class="conversion-amount">${conversionDirection === 'cryptoToFiat' ? cryptoAmount : fiatAmount}</span>
                            <span class="conversion-type">${conversionDirection === 'cryptoToFiat' ? cryptoSelect.toUpperCase() : fiatSelect.toUpperCase()}</span>
                            <span>=</span>
                            <span class="conversion-result-value">${result}</span>
                            <span class="conversion-result-currency">${conversionDirection === 'cryptoToFiat' ? fiatSelect.toUpperCase() : cryptoSelect.toUpperCase()}</span>
                        </div>
                    `;
                    
                    
                    const resultElement = document.getElementById('conversion-result');
                    resultElement.classList.add('animate__animated', 'animate__fadeInUp');
                    setTimeout(() => {
                        resultElement.classList.remove('animate__animated', 'animate__fadeInUp');
                    }, 1000);
                    
                }, 1500);
            } catch (error) {
                console.error('Conversion error:', error);
                convertButton.classList.remove('loading');
                buttonText.textContent = 'Convert';
                convertButton.disabled = false;
                showNotification('Failed to convert. Please try again.', 'error');
            }
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

        // Notification system
        function showNotification(message, type = 'success') {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            
            notification.classList.add('animate__animated', 'animate__fadeInRight');
            
            
            setTimeout(() => {
                notification.classList.remove('animate__animated', 'animate__fadeInRight');
                notification.classList.add('animate__animated', 'animate__fadeOutRight');
                setTimeout(() => {
                    notification.remove();
                }, 500);
            }, 3000);
        }

        
        const API_URL = "https://api.coingecko.com/api/v3/simple/price";
        const ALL_COINS_URL = "https://api.coingecko.com/api/v3/coins/list";
        const cryptoList = document.getElementById("crypto-list");
        const addCryptoButton = document.getElementById("add-crypto-button");
        const cryptoInput = document.getElementById("crypto-input");
        const suggestionsDiv = document.getElementById("suggestions");
        let trackedCryptos = JSON.parse(localStorage.getItem("trackedCryptos")) || [];
        let allCoins = [];

        
        const defaultCryptos = ['bitcoin', 'ethereum', 'solana'];

        
        async function fetchAllCoins() {
            try {
                const response = await fetch(ALL_COINS_URL);
                allCoins = await response.json();
            } catch (error) {
                console.error("Error fetching coins:", error);
                showNotification('Failed to load cryptocurrency list', 'error');
            }
        }

        // check prices for tracked cryptos
        async function fetchPrices() {
            if (trackedCryptos.length === 0) {
            
                trackedCryptos = [...defaultCryptos];
                localStorage.setItem("trackedCryptos", JSON.stringify(trackedCryptos));
            }

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
                
                // allow drag and drop
                enableSorting();
            } catch (error) {
                console.error("Error fetching prices:", error);
                showNotification('Failed to load price data', 'error');
            }
        }

        
        function createCryptoItem(id, price, change) {
            const li = document.createElement("li");
            li.dataset.id = id;
            
            
            const icon = document.createElement("div");
            icon.className = "crypto-icon";
            
        
            const iconElement = document.createElement("i");
            switch(id.toLowerCase()) {
                case 'bitcoin':
                    iconElement.className = "fab fa-bitcoin";
                    break;
                case 'ethereum':
                    iconElement.className = "fab fa-ethereum";
                    break;
                case 'solana':
                    iconElement.innerHTML = '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.5 15.5c0 1.38-1.12 2.5-2.5 2.5s-2.5-1.12-2.5-2.5 1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5z"/></svg>';
                    break;
                default:
                    iconElement.className = "fas fa-coins";
            }
            icon.appendChild(iconElement);
            
            // crypto info
            const infoDiv = document.createElement("div");
            infoDiv.className = "crypto-info";
            
            const nameDiv = document.createElement("div");
            nameDiv.className = "crypto-name";
            nameDiv.textContent = id.charAt(0).toUpperCase() + id.slice(1);
            
            // Adding symbol
            const coinData = allCoins.find(coin => coin.id === id);
            if (coinData) {
                const symbolSpan = document.createElement("span");
                symbolSpan.className = "crypto-symbol";
                symbolSpan.textContent = ` (${coinData.symbol.toUpperCase()})`;
                nameDiv.appendChild(symbolSpan);
            }
            
            //  price info
            const priceInfoDiv = document.createElement("div");
            priceInfoDiv.className = "price-info";
            
            const priceDiv = document.createElement("div");
            priceDiv.className = "price";
            priceDiv.textContent = `$${price.toFixed(2)}`;
            
            const changeDiv = document.createElement("div");
            changeDiv.className = `change ${change >= 0 ? "positive" : "negative"}`;
            changeDiv.textContent = `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;
            
            //  delete button
            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-btn";
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                trackedCryptos = trackedCryptos.filter((crypto) => crypto !== id);
                localStorage.setItem("trackedCryptos", JSON.stringify(trackedCryptos));
                fetchPrices();
                showNotification(`${id} removed from watchlist`, 'success');
            });
            
    
            li.addEventListener("click", () => {
                showCryptoDetails(id);
            });
            
            infoDiv.appendChild(nameDiv);
            priceInfoDiv.appendChild(priceDiv);
            priceInfoDiv.appendChild(changeDiv);
            
            li.appendChild(icon);
            li.appendChild(infoDiv);
            li.appendChild(priceInfoDiv);
            li.appendChild(deleteBtn);
            
            return li;
        }

        //  drag and drop 
        function enableSorting() {
            new Sortable(cryptoList, {
                animation: 150,
                ghostClass: 'sortable-ghost',
                onEnd: function() {
                    const order = Array.from(cryptoList.children).map((item) => item.dataset.id);
                    trackedCryptos = order;
                    localStorage.setItem("trackedCryptos", JSON.stringify(trackedCryptos));
                }
            });
        }

        // Adding crypto to watchlist
        function addCrypto() {
            const cryptoName = cryptoInput.value.trim().toLowerCase();
            
            if (!cryptoName) {
                showNotification('Please enter a cryptocurrency name', 'error');
                return;
            }
            
            // Check for coin on list
            const coinExists = allCoins.some(coin => coin.id.toLowerCase() === cryptoName.toLowerCase());
            
            if (!coinExists) {
                showNotification('Cryptocurrency not found', 'error');
                return;
            }
            
            if (!trackedCryptos.includes(cryptoName)) {
                trackedCryptos.push(cryptoName);
                localStorage.setItem("trackedCryptos", JSON.stringify(trackedCryptos));
                cryptoInput.value = "";
                suggestionsDiv.style.display = "none";
                fetchPrices();
                showNotification(`${cryptoName} added to watchlist`, 'success');
            } else {
                showNotification(`${cryptoName} is already in your watchlist`, 'error');
            }
        }

        
        function fetchSuggestions(query) {
            if (!query) {
                suggestionsDiv.style.display = "none";
                return;
            }
            
            const suggestions = allCoins
                .filter((coin) => 
                    coin.id.toLowerCase().includes(query.toLowerCase()) || 
                    coin.symbol.toLowerCase().includes(query.toLowerCase())
                )
                .slice(0, 10); 
            
            suggestionsDiv.innerHTML = "";
            
            if (suggestions.length === 0) {
                suggestionsDiv.style.display = "none";
                return;
            }
            
            suggestions.forEach((suggestion) => {
                const div = document.createElement("div");
                div.className = "suggestion-item";
                
                const nameSpan = document.createElement("span");
                nameSpan.textContent = suggestion.id.charAt(0).toUpperCase() + suggestion.id.slice(1);
                
                const symbolSpan = document.createElement("span");
                symbolSpan.style.marginLeft = "8px";
                symbolSpan.style.opacity = "0.7";
                symbolSpan.textContent = `(${suggestion.symbol.toUpperCase()})`;
                
                div.appendChild(nameSpan);
                div.appendChild(symbolSpan);
                
                div.addEventListener("click", () => {
                    cryptoInput.value = suggestion.id;
                    suggestionsDiv.style.display = "none";
                });
                
                suggestionsDiv.appendChild(div);
            });
            
            suggestionsDiv.style.display = "block";
        }

         function showCryptoDetails(id) {
         
            console.log(`Showing details for ${id}`);
            showNotification(`Showing details for ${id} (feature coming soon)`, 'success');
        }

        // adding crypto 
        cryptoInput.addEventListener("input", (e) => {
            fetchSuggestions(e.target.value);
        });

        cryptoInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                addCrypto();
            }
        });

        addCryptoButton.addEventListener("click", addCrypto);

        
        document.addEventListener("click", (e) => {
            if (!cryptoInput.contains(e.target) && !suggestionsDiv.contains(e.target)) {
                suggestionsDiv.style.display = "none";
            }
        });

        
        document.addEventListener("DOMContentLoaded", async () => {
        
            await fetchAllCoins();
            
            fetchPrices();
            
        
            setInterval(fetchPrices, 60000);
            
            
            document.querySelector('.app-container').classList.add('animate__animated', 'animate__fadeIn');
            setTimeout(() => {
                document.querySelector('.app-container').classList.remove('animate__animated', 'animate__fadeIn');
            }, 1000);
        });

        
        const notificationStyles = document.createElement('style');
        notificationStyles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 25px;
                border-radius: var(--border-radius-sm);
                color: var(--light);
                font-weight: 600;
                z-index: 1000;
                box-shadow: var(--shadow);
                backdrop-filter: blur(10px);
            }
            
            .notification.success {
                background: rgba(0, 255, 157, 0.2);
                border-left: 4px solid var(--primary);
            }
            
            .notification.error {
                background: rgba(255, 45, 117, 0.2);
                border-left: 4px solid var(--accent);
            }
            
            .sortable-ghost {
                opacity: 0.5;
                background: rgba(123, 45, 255, 0.2);
                border: 1px dashed var(--secondary);
            }
        `;
        document.head.appendChild(notificationStyles);
