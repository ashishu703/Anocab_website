 <script>
            const API_BASE_URL = "https://api.anocab.com";
            // Function to update marquee prices
            function updateMarqueePrices() {
                fetch(`${API_BASE_URL}/api/prices`)
                    .then(response => response.json())
                    .then(prices => {
                        const priceText = `
                            <b>Aluminum EC (Balco) Rs: ${prices.aluminum_ec.toFixed(2)}</b>  | 
                            <b>Aluminum Alloy (Balco) Rs: ${prices.aluminum_alloy.toFixed(2)}</b>  | 
                            <b>Copper (LME) Rs: ${prices.copper.toFixed(2)}</b>  | 
                            <b>PVC - 67GER01F (Reliance) Rs: ${prices.pvc.toFixed(2)}</b>  | 
                            <b>LLDPE - X24065 (Reliance) Rs: ${prices.lldpe.toFixed(2)}</b>
                        `;
                        document.getElementById('dynamic-prices').innerHTML = priceText;
                    })
                    .catch(error => {
                        console.error('Error fetching prices:', error);
                        document.getElementById('dynamic-prices').innerHTML = 
                            'Current prices unavailable. Please check back later.';
                    });
            }
        
            // Update immediately
            updateMarqueePrices();
            
            // Update every 5 minutes (300000 ms)
            setInterval(updateMarqueePrices, 300000);
        
            // Marquee control functions
            function stopMarquee() {
                document.querySelector('.marquee-content').style.animationPlayState = 'paused';
            }
            
            function startMarquee() {
                document.querySelector('.marquee-content').style.animationPlayState = 'running';
            }
        </script>