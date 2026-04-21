/**
 * Global API Configuration
 * Include this file BEFORE any other scripts that use API_BASE_URL
 * Usage: <script src="/js/global-api.js"></script>
 */

// Auto-detect environment and set API URL
(function() {
  'use strict';
  
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  // Determine API URL based on environment
  let apiUrl;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Development environment
    apiUrl = `http://${hostname}:${port || 3000}`;
  } else {
    // Production environment
    apiUrl = 'https://api.anocab.com';
  }
  
  // Set as global constant
  window.API_BASE_URL = apiUrl;
  
  // Also define as const for backward compatibility
  // This allows existing code to work without changes
  Object.defineProperty(window, 'API_BASE_URL_CONST', {
    value: apiUrl,
    writable: false,
    configurable: false
  });
  
  console.log('🌐 API Environment:', hostname === 'localhost' || hostname === '127.0.0.1' ? 'Development' : 'Production');
  console.log('📡 API Base URL:', apiUrl);
})();
