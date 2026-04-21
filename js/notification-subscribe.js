/**
 * Newsletter Popup with Anocab App Promotion
 */
(function() {
  'use strict';
  
  const POPUP_DELAY = 5000;
  const COOKIE_NAME = 'newsletter_subscribed';
  const COOKIE_DAYS = 365;
  
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }
  
  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
  }
  
  function createPopup() {
    const popup = document.createElement('div');
    popup.id = 'newsletter-popup';
    popup.innerHTML = `
      <div class="newsletter-overlay" onclick="closeNewsletterPopup()"></div>
      <div class="newsletter-modal">
        <button class="newsletter-close" onclick="closeNewsletterPopup()">&times;</button>
        <div class="newsletter-content">
          <img src="https://res.cloudinary.com/dngojnptn/image/upload/v1776765224/WhatsApp_Image_2026-04-21_at_3.09.29_PM-removebg-preview_yj9ryu.png" alt="Anocab" class="newsletter-logo">
          <h2>Subscribe to Our Newsletter</h2>
          <p>Get the latest updates on products, prices, and special offers!</p>
          <form id="newsletter-form" onsubmit="submitNewsletter(event)">
            <input type="email" id="newsletter-email" placeholder="Enter your email" required>
            <button type="submit">Subscribe</button>
          </form>
          <p class="newsletter-privacy">We respect your privacy. Unsubscribe anytime.</p>
          
          <div class="app-promotion">
            <div class="app-divider"><span>Also Available On</span></div>
            <a href="https://play.google.com/store/apps/details?id=com.anocab" target="_blank" class="app-link">
              <img src="https://res.cloudinary.com/dngojnptn/image/upload/v1776765224/WhatsApp_Image_2026-04-21_at_3.09.29_PM-removebg-preview_yj9ryu.png" alt="Anocab App" class="app-icon">
              <div class="app-text">
                <span class="app-title">Anocab App</span>
                <span class="app-subtitle">Available on Google Play Store</span>
              </div>
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" class="playstore-badge">
            </a>
          </div>
        </div>
      </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      #newsletter-popup{position:fixed;top:0;left:0;width:100%;height:100%;z-index:99999;display:none;animation:fadeIn 0.3s ease}
      #newsletter-popup.show{display:block}
      .newsletter-overlay{position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);backdrop-filter:blur(5px);cursor:pointer}
      .newsletter-modal{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:white;border-radius:20px;padding:40px;max-width:500px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.3);animation:slideUp 0.4s ease;cursor:default}
      @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      @keyframes slideUp{from{opacity:0;transform:translate(-50%,-40%)}to{opacity:1;transform:translate(-50%,-50%)}}
      .newsletter-close{position:absolute;top:15px;right:15px;background:none;border:none;font-size:32px;color:#999;cursor:pointer;width:40px;height:40px;display:flex;align-items:center;justify-content:center;border-radius:50%;transition:all 0.3s ease}
      .newsletter-close:hover{background:#f0f0f0;color:#333}
      .newsletter-content{text-align:center}
      .newsletter-logo{width:180px;height:auto;margin-bottom:7px;object-fit:contain}
      .newsletter-content h2{color:#333;font-size:28px;margin-bottom:5px;font-weight:700}
      .newsletter-content p{color:#666;font-size:16px;margin-bottom:14px;line-height:1.6}
      #newsletter-form{display:flex;gap:10px;margin-bottom:15px}
      #newsletter-email{flex:1;padding:14px 20px;border:2px solid #e0e0e0;border-radius:10px;font-size:16px;transition:all 0.3s ease}
      #newsletter-email:focus{outline:none;border-color:#667eea;box-shadow:0 0 0 4px rgba(102,126,234,0.1)}
      #newsletter-form button{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;border:none;padding:14px 30px;border-radius:10px;font-size:16px;font-weight:600;cursor:pointer;transition:all 0.3s ease;white-space:nowrap}
      #newsletter-form button:hover{transform:translateY(-2px);box-shadow:0 10px 25px rgba(102,126,234,0.4)}
      #newsletter-form button:disabled{opacity:0.6;cursor:not-allowed;transform:none}
      .newsletter-privacy{font-size:12px!important;color:#999!important;margin:0 0 20px 0!important}
      .app-promotion{margin-top:20px;padding-top:20px;border-top:1px solid #e0e0e0}
      .app-divider{text-align:center;margin-bottom:15px}
      .app-divider span{color:#999;font-size:12px;text-transform:uppercase;letter-spacing:1px}
      .app-link{display:flex;align-items:center;gap:12px;padding:15px;background:#f8f9fa;border-radius:12px;text-decoration:none;transition:all 0.3s ease;border:2px solid transparent}
      .app-link:hover{background:#fff;border-color:#667eea;transform:translateY(-2px);box-shadow:0 5px 15px rgba(102,126,234,0.2)}
      .app-icon{width:80px;height:80px;border-radius:10px;object-fit:contain;background:white;padding:5px}
      .app-text{flex:1;display:flex;flex-direction:column;gap:4px;text-align:left}
      .app-title{color:#333;font-size:16px;font-weight:600}
      .app-subtitle{color:#666;font-size:12px}
      .playstore-badge{height:40px;width:auto}
      @media (max-width:600px){
        .newsletter-modal{padding:30px 20px}
        .newsletter-content h2{font-size:24px}
        .newsletter-logo{width:140px}
        #newsletter-form{flex-direction:column}
        #newsletter-form button{width:100%}
        .app-link{flex-direction:column;text-align:center}
        .app-text{text-align:center}
        .playstore-badge{height:35px}
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(popup);
  }
  
  function showPopup() {
    const popup = document.getElementById('newsletter-popup');
    if (popup) {
      popup.classList.add('show');
      console.log('✅ Newsletter popup displayed');
    }
  }
  
  window.closeNewsletterPopup = function() {
    const popup = document.getElementById('newsletter-popup');
    if (popup) popup.classList.remove('show');
  };
  
  window.submitNewsletter = async function(event) {
    event.preventDefault();
    const email = document.getElementById('newsletter-email').value;
    const button = event.target.querySelector('button');
    const originalText = button.textContent;
    
    button.textContent = 'Subscribing...';
    button.disabled = true;
    
    try {
      const apiUrl = window.API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        button.textContent = '✓ Subscribed!';
        setCookie(COOKIE_NAME, 'true', COOKIE_DAYS);
        setTimeout(() => closeNewsletterPopup(), 1500);
      } else {
        const data = await response.json();
        if (data.message === 'Already subscribed') {
          button.textContent = '✓ Already Subscribed!';
          setCookie(COOKIE_NAME, 'true', COOKIE_DAYS);
          setTimeout(() => closeNewsletterPopup(), 1500);
        } else {
          throw new Error('Subscription failed');
        }
      }
    } catch (error) {
      console.error('Newsletter error:', error);
      alert('Failed to subscribe. Please try again.');
      button.textContent = originalText;
      button.disabled = false;
    }
  };
  
  function init() {
    // In development mode (localhost), always show popup for testing
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (!isDevelopment && getCookie(COOKIE_NAME) === 'true') {
      console.log('Newsletter: Already subscribed, skipping popup');
      return;
    }
    
    console.log('Newsletter: Initializing popup...');
    createPopup();
    setTimeout(() => {
      console.log('Newsletter: Showing popup now');
      showPopup();
    }, POPUP_DELAY);
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
