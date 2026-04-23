/**
 * Global API Configuration
 * Auto-detects environment and sets correct API URL
 * 
 * Usage: Add this to your HTML files BEFORE any API calls
 * <script src="/config.js"></script>
 */

(function() {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  // Determine API Base URL based on environment
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Local development
    window.API_BASE_URL = `http://${hostname}:3000`;
  } else if (hostname === 'anocab.com' || hostname === 'www.anocab.com') {
    // Production - use same domain with HTTPS
    window.API_BASE_URL = `${protocol}//${hostname}`;
  } else {
    // Fallback for any other domain
    window.API_BASE_URL = `${protocol}//${hostname}`;
  }
  
  console.log('🌐 API Base URL:', window.API_BASE_URL);
  console.log('📍 Environment:', hostname === 'localhost' ? 'Development' : 'Production');
})();
