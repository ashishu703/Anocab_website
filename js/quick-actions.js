// Quick Actions Floating Button - Enhanced Version with Backend Integration
(function() {
    'use strict';

    // 26 Product Types List
    const productsList = [
        "House Wire (FR)",
        "House Wire (FRLS)",
        "Submersible Flat Cable",
        "Submersible Round Cable",
        "Flexible Cable",
        "LT Power Cable (Armoured)",
        "LT Power Cable (Unarmoured)",
        "HT Power Cable (Armoured)",
        "HT Power Cable (Unarmoured)",
        "Control Cable (Armoured)",
        "Control Cable (Unarmoured)",
        "Aerial Bunched Cable (ABC)",
        "ACSR Conductor",
        "AAC Conductor",
        "AAAC Conductor",
        "LAN Cable (Cat 5e)",
        "LAN Cable (Cat 6)",
        "LAN Cable (Cat 6A)",
        "CCTV Cable (RG59)",
        "CCTV Cable (RG6)",
        "Coaxial Cable",
        "Solar DC Cable",
        "Speaker Cable",
        "Telephone Cable",
        "Optical Fiber Cable",
        "Welding Cable"
    ];

    // Create Quick Actions HTML
    const quickActionsHTML = `
        <div class="quick-actions-floating">
            <button class="quick-actions-toggle" id="quickActionsToggle">
                <i class="fa fa-plus quick-icon"></i>
                <span class="quick-text">Quick Actions</span>
            </button>
            
            <div class="quick-actions-menu" id="quickActionsMenu">
                <a href="https://wa.me/916262002185?text=Hi, I'm interested in your products" 
                   target="_blank" 
                   class="quick-action-btn whatsapp-btn"
                   title="Chat on WhatsApp">
                    <i class="fab fa-whatsapp"></i>
                    <span>WhatsApp</span>
                </a>
                
                <a href="tel:+916262002185" 
                   class="quick-action-btn call-btn"
                   title="Call Us">
                    <i class="fa fa-phone"></i>
                    <span>Call Now</span>
                </a>
                
                <button class="quick-action-btn enquiry-btn" 
                        id="openEnquiryForm"
                        title="Send Enquiry">
                    <i class="fa fa-envelope"></i>
                    <span>Enquire Now</span>
                </button>
            </div>
        </div>

        <!-- Enhanced Enquiry Form Modal -->
        <div class="enquiry-modal" id="enquiryModal">
            <div class="enquiry-modal-overlay" id="enquiryOverlay"></div>
            <div class="enquiry-modal-content">
                <button class="enquiry-close" id="closeEnquiry">
                    <i class="fa fa-times"></i>
                </button>
                
                <div class="enquiry-header">
                    <i class="fa fa-envelope-open"></i>
                    <h3>Send Us An Enquiry</h3>
                    <p>We'll get back to you within 24 hours</p>
                </div>
                
                <form class="enquiry-form" id="enquiryForm">
                    <div class="form-row">
                        <div class="form-group full-width">
                            <label><i class="fa fa-user"></i> Full Name *</label>
                            <input type="text" name="name" placeholder="Enter your full name" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label><i class="fa fa-phone"></i> Mobile Number *</label>
                            <input type="tel" name="mobile" placeholder="+91 XXXXX XXXXX" pattern="[0-9]{10}" required>
                        </div>
                        <div class="form-group">
                            <label><i class="fa fa-envelope"></i> Email (Optional)</label>
                            <input type="email" name="email" placeholder="your@email.com">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label><i class="fa fa-box"></i> Product Type *</label>
                        <select name="product" id="productSelect" required>
                            <option value="">-- Select Product Type --</option>
                            ${productsList.map(product => `<option value="${product}">${product}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label><i class="fa fa-comment"></i> Your Requirements *</label>
                        <textarea name="requirements" rows="4" placeholder="Please describe your requirements in detail..." required></textarea>
                    </div>
                    
                    <button type="submit" class="submit-btn">
                        <i class="fa fa-paper-plane"></i> Submit Enquiry
                    </button>
                </form>
                
                <div class="enquiry-success" id="enquirySuccess" style="display:none;">
                    <i class="fa fa-check-circle"></i>
                    <h3>Thank You!</h3>
                    <p>Your enquiry has been submitted successfully. Our team will contact you soon.</p>
                    <button class="close-success-btn" onclick="closeEnquiryModal()">Close</button>
                </div>
            </div>
        </div>
    `;

    // Inject HTML into page
    document.addEventListener('DOMContentLoaded', function() {
        document.body.insertAdjacentHTML('beforeend', quickActionsHTML);
        initQuickActions();
    });

    // Initialize Quick Actions
    function initQuickActions() {
        const toggle = document.getElementById('quickActionsToggle');
        const menu = document.getElementById('quickActionsMenu');
        const openEnquiry = document.getElementById('openEnquiryForm');
        const modal = document.getElementById('enquiryModal');
        const overlay = document.getElementById('enquiryOverlay');
        const closeBtn = document.getElementById('closeEnquiry');
        const form = document.getElementById('enquiryForm');
        const successDiv = document.getElementById('enquirySuccess');

        let isOpen = false;

        // Toggle menu
        toggle.addEventListener('click', function() {
            isOpen = !isOpen;
            menu.classList.toggle('active', isOpen);
            toggle.classList.toggle('active', isOpen);
            
            const icon = toggle.querySelector('.quick-icon');
            icon.style.transform = isOpen ? 'rotate(45deg)' : 'rotate(0deg)';
        });

        // Open modal
        openEnquiry.addEventListener('click', function() {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        // Close modal
        function closeEnquiryModal() {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
            form.style.display = 'block';
            successDiv.style.display = 'none';
            form.reset();
        }

        closeBtn.addEventListener('click', closeEnquiryModal);
        overlay.addEventListener('click', closeEnquiryModal);

        // Make closeEnquiryModal global
        window.closeEnquiryModal = closeEnquiryModal;

        // Handle form submission
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            // Show loading state
            const submitBtn = form.querySelector('.submit-btn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Submitting...';
            submitBtn.disabled = true;

            // Send to backend API
            const apiUrl = window.API_BASE_URL || 'http://localhost:3000';
            
            fetch(`${apiUrl}/api/enquiries`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(result => {
                console.log('Enquiry submitted:', result);
                
                // Show success message
                form.style.display = 'none';
                successDiv.style.display = 'block';
                
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            })
            .catch(error => {
                console.error('Error submitting enquiry:', error);
                alert('Failed to submit enquiry. Please try again or contact us directly.');
                
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
        });

        // Close on ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeEnquiryModal();
            }
        });
    }
})();
