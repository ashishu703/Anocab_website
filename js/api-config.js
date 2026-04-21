// Global API Configuration
// Auto-detects environment and sets correct API URL

(function() {
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  // Auto-detect API URL based on environment
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    window.API_BASE_URL = `http://${hostname}:${port || 3000}`;
  } else {
    window.API_BASE_URL = 'https://api.anocab.com';
  }
  
  console.log('🌐 API URL:', window.API_BASE_URL);
})();

// Backward compatibility - also set as const
const API_BASE_URL = window.API_BASE_URL;

