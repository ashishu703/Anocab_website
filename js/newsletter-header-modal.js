/**
 * Newsletter Modal - Compact square box with slide-down animation
 */
(function() {
  'use strict';
  
  const MODAL_DELAY = 2000; // Show after 2 seconds
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
  
  function createModal() {
    const modal = document.createElement('div');
    modal.id = 'newsletter-modal';
    modal.innerHTML = `
      <div class="newsletter-box">
        <button class="newsletter-close" onclick="closeNewsletterModal()" aria-label="Close">&times;</button>
        <div class="newsletter-logo">
          <img src="https://res.cloudinary.com/drpbrn2ax/image/upload/f_auto,q_auto/v1742800560/prealoader2_zqp42i.gif" alt="Anocab Logo">
        </div>
        <h3 class="newsletter-title">Subscribe to Our Newsletter</h3>
        <p class="newsletter-subtitle">Subscribe for expert insights, product updates, and the latest trends in the wire & cable industry.</p>
        <form id="newsletter-form" onsubmit="submitNewsletterModal(event)">
          <input type="email" id="newsletter-email" placeholder="Enter your email" required>
          <button type="submit">Subscribe</button>
        </form>
        <div class="newsletter-app">
          <span>Join ANOCAB Loyalty Program<br>Download Anocab App & Start Earning</span>
          <div class="app-icons">
            <a href="https://play.google.com/store/apps/details?id=com.company.anocab" target="_blank" class="anocab-app-link">
              <img src="https://res.cloudinary.com/dngojnptn/image/upload/v1776683252/Screenshot_2026-04-20_163707_tkvpph.png" alt="Anocab App">
              <span class="app-name">Anocab</span>
            </a>
            <a href="https://play.google.com/store/apps/details?id=com.company.anocab" target="_blank" class="playstore-link">
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play">
            </a>
          </div>
        </div>
      </div>
    `;
    
    // Insert at the very top of body
    document.body.insertBefore(modal, document.body.firstChild);
    
    const style = document.createElement('style');
    style.textContent = `
      #newsletter-modal {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        z-index: 99999 !important;
        display: none !important;
        padding: 0 !important;
        margin: 0 !important;
        overflow: hidden !important;
      }
      
      #newsletter-modal.show {
        display: block !important;
        animation: slideDown 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards !important;
      }
      
      @keyframes slideDown {
        from {
          transform: translateY(-100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      
      @keyframes slideUp {
        from {
          transform: translateY(0);
          opacity: 1;
        }
        to {
          transform: translateY(-100%);
          opacity: 0;
        }
      }
      
      .newsletter-box {
        position: relative !important;
        background: white !important;
        border-radius: 0 !important;
        padding: 20px 30px !important;
        max-width: 600px !important;
        width: 100% !important;
        box-shadow: none !important;
        text-align: center !important;
        margin: 0 auto !important;
        border-bottom: 3px solid #667eea !important;
      }
      
      .newsletter-close {
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        font-size: 28px;
        color: #999;
        cursor: pointer;
        width: 35px;
        height: 35px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.3s ease;
        line-height: 1;
        z-index: 10;
      }
      
      .newsletter-close:hover {
        background: #f0f0f0;
        color: #333;
        transform: rotate(90deg);
      }
      
      .newsletter-logo {
        margin-bottom: 8px;
      }
      
      .newsletter-logo img {
        width: 120px;
        height: auto;
      }
      
      .newsletter-title {
        color: #013A5B;
        font-size: 17px;
        font-weight: 700;
        margin: 0 0 5px 0;
      }
      
      .newsletter-subtitle {
        color: #000;
        font-size: 12px;
        margin: 0 0 12px 0;
        line-height: 1.3;
        font-weight: 500;
      }
      
      #newsletter-form {
        margin-bottom: 12px;
      }
      
      #newsletter-email {
        width: 100%;
        padding: 10px 15px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 14px;
        margin-bottom: 8px;
        transition: all 0.3s ease;
        box-sizing: border-box;
      }
      
      #newsletter-email:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }
      
      #newsletter-form button {
        width: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      #newsletter-form button:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
      }
      
      #newsletter-form button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
      }
      
      .newsletter-app {
        padding-top: 12px;
        border-top: 1px solid #e0e0e0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }
      
      .newsletter-app span {
        color: #000;
        font-size: 12px;
        font-weight: 700;
        line-height: 1.3;
        text-align: center;
      }
      
      .newsletter-app .app-icons {
        display: flex;
        align-items: center;
        gap: 20px;
        justify-content: center;
      }
      
      .newsletter-app .anocab-app-link {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
        transition: transform 0.3s ease;
        text-decoration: none;
      }
      
      .newsletter-app .anocab-app-link:hover {
        transform: scale(1.05);
      }
      
      .newsletter-app .anocab-app-link img {
        height: 50px;
        width: auto;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      
      .newsletter-app .app-name {
        color: #333;
        font-size: 12px;
        font-weight: 600;
      }
      
      .newsletter-app .playstore-link {
        display: inline-block;
        transition: transform 0.3s ease;
      }
      
      .newsletter-app .playstore-link:hover {
        transform: scale(1.05);
      }
      
      .newsletter-app .playstore-link img {
        height: 35px;
        width: auto;
      }
      
      @media (max-width: 768px) {
        .newsletter-box {
          padding: 18px 20px !important;
          max-width: 100% !important;
          width: 100% !important;
        }
        
        .newsletter-logo img {
          width: 100px !important;
        }
        
        .newsletter-subtitle {
          font-size: 11px !important;
        }
        
        .newsletter-app .anocab-app-link img {
          height: 45px !important;
        }
        
        .newsletter-app .playstore-link img {
          height: 32px !important;
        }
      }
        
        .newsletter-title {
          font-size: 16px !important;
        }
        
        .newsletter-subtitle {
          font-size: 12px !important;
        }
        
        .newsletter-app img {
          height: 35px !important;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  function showModal() {
    const modal = document.getElementById('newsletter-modal');
    if (modal) {
      modal.classList.add('show');
      console.log('✅ Newsletter modal displayed');
    }
  }
  
  window.closeNewsletterModal = function() {
    const modal = document.getElementById('newsletter-modal');
    if (modal) {
      modal.style.animation = 'slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards';
      setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('show');
      }, 500);
    }
  };
  
  window.submitNewsletterModal = async function(event) {
    event.preventDefault();
    const email = document.getElementById('newsletter-email').value;
    const button = event.target.querySelector('button');
    const originalText = button.textContent;
    
    button.textContent = 'Subscribing...';
    button.disabled = true;
    
    try {
      const apiUrl = window.API_BASE_URL || 'https://anocab.com';
      const response = await fetch(`${apiUrl}/api/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        button.textContent = '✓ Subscribed!';
        button.style.background = '#28a745';
        setCookie(COOKIE_NAME, 'true', COOKIE_DAYS);
        setTimeout(() => closeNewsletterModal(), 1500);
      } else {
        const data = await response.json();
        if (data.message === 'Already subscribed') {
          button.textContent = '✓ Already Subscribed!';
          button.style.background = '#ffc107';
          setCookie(COOKIE_NAME, 'true', COOKIE_DAYS);
          setTimeout(() => closeNewsletterModal(), 1500);
        } else {
          throw new Error('Subscription failed');
        }
      }
    } catch (error) {
      console.error('Newsletter error:', error);
      alert('Failed to subscribe. Please try again.');
      button.textContent = originalText;
      button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      button.disabled = false;
    }
  };
  
  function init() {
    // Check if user has already seen or subscribed to the newsletter
    const hasSeenModal = localStorage.getItem('newsletter_seen');
    const hasSubscribed = getCookie(COOKIE_NAME) === 'true';
    
    if (hasSeenModal || hasSubscribed) {
      console.log('Newsletter: Already seen or subscribed, skipping modal');
      return;
    }
    
    console.log('Newsletter: Initializing modal...');
    createModal();
    
    // Mark as seen immediately when modal is created
    localStorage.setItem('newsletter_seen', 'true');
    
    // Show modal after delay
    setTimeout(() => {
      console.log('Newsletter: Showing modal now');
      showModal();
    }, MODAL_DELAY);
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
