// ========== STYLES ADDED FIRST ==========
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .fade-in {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .fade-in.visible {
        opacity: 1;
        transform: translateY(0);
    }
    
    .form-control.error {
        border-color: #e74c3c !important;
        box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2);
    }
    
    .rtl {
        direction: rtl;
        text-align: right;
    }
    
    .rtl .form-group label {
        text-align: right;
        display: block;
    }
    
    .rtl .service-features li,
    .rtl .footer-column ul li {
        text-align: right;
    }
    
    /* Fix for iOS zoom issue */
    input, select, textarea {
        font-size: 16px !important;
    }
    
    @media screen and (max-width: 768px) {
        input, select, textarea {
            font-size: 16px !important;
        }
    }
`;
document.head.appendChild(style);

// ========== MAIN SCRIPT ==========
document.addEventListener('DOMContentLoaded', function() {
    // Language switching functionality
    const langButtons = document.querySelectorAll('.lang-btn');
    const currentLang = localStorage.getItem('selectedLang') || 'en';
    
    // Set initial language
    setLanguage(currentLang);
    updateActiveLangButton(currentLang);
    
    // Add click event to language buttons
    langButtons.forEach(button => {
        button.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            setLanguage(lang);
            updateActiveLangButton(lang);
            localStorage.setItem('selectedLang', lang);
        });
    });
    
    // Function to set language
    function setLanguage(lang) {
        // Update data-lang attribute on body
        document.body.setAttribute('data-lang', lang);
        
        // Update all elements with data-en and data-ar attributes
        document.querySelectorAll('[data-en], [data-ar]').forEach(element => {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                const placeholder = element.getAttribute(`data-${lang}-placeholder`);
                if (placeholder) {
                    element.setAttribute('placeholder', placeholder);
                }
            } else {
                const text = element.getAttribute(`data-${lang}`);
                if (text) {
                    element.textContent = text;
                }
            }
        });
        
        // Update page direction for Arabic
        if (lang === 'ar') {
            document.body.setAttribute('dir', 'rtl');
            document.body.classList.add('rtl');
        } else {
            document.body.setAttribute('dir', 'ltr');
            document.body.classList.remove('rtl');
        }
    }
    
    // Function to update active language button
    function updateActiveLangButton(lang) {
        langButtons.forEach(button => {
            if (button.getAttribute('data-lang') === lang) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }
    
    // ========== MOBILE MENU TOGGLE ==========
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const nav = document.querySelector('nav');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            nav.classList.toggle('active');
            this.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('nav') && !event.target.closest('.mobile-menu')) {
                nav.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            }
        });
    }
    
    // ========== PHONE WIDGET FUNCTIONALITY ==========
    const phoneBtn = document.getElementById('simplePhoneBtn');
    const phonePopup = document.getElementById('phonePopup');
    
    if (phoneBtn && phonePopup) {
        let popupVisible = false;
        
        phoneBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            popupVisible = !popupVisible;
            phonePopup.style.display = popupVisible ? 'block' : 'none';
        });
        
        // Close popup when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.phone-icon-widget') && !event.target.closest('#phonePopup')) {
                phonePopup.style.display = 'none';
                popupVisible = false;
            }
        });
    }
    
    // Copy phone number function
    window.copyPhoneNumber = function() {
        const phoneNumber = '+966551234567';
        navigator.clipboard.writeText(phoneNumber).then(function() {
            showNotification('Phone number copied to clipboard!', 'success');
        }).catch(function(err) {
            console.error('Could not copy text: ', err);
            showNotification('Failed to copy phone number', 'error');
        });
    };
    
    // ========== FORM VALIDATION ==========
    // Contact form validation
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Basic validation
            const name = document.getElementById('name');
            const email = document.getElementById('email');
            const phone = document.getElementById('phone');
            const message = document.getElementById('message');
            
            if (!validateForm([name, email, phone, message])) {
                return;
            }
            
            // Show loading state
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            
            try {
                const formData = new FormData(contactForm);
                const data = Object.fromEntries(formData);
                
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });                // Simulate API call - replace with actual API endpoint
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Show success message
                showNotification('Message sent successfully! We will contact you within 2 hours.', 'success');
                contactForm.reset();
                
            } catch (error) {
                console.error('Error:', error);
                showNotification('Error sending message. Please try again.', 'error');
            } finally {
                // Reset button state
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Booking form validation and multi-step functionality
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        const steps = document.querySelectorAll('.step');
        const sections = document.querySelectorAll('.form-section');
        const nextButtons = document.querySelectorAll('.next-step');
        const prevButtons = document.querySelectorAll('.prev-step');
        const newBookingBtn = document.querySelector('.new-booking');
        
        let currentStep = 1;
        
        // Initialize first step
        goToStep(1);
        
        // Next button functionality
        nextButtons.forEach(button => {
            button.addEventListener('click', function() {
                if (validateSection(currentStep)) {
                    goToStep(currentStep + 1);
                }
            });
        });
        
        // Previous button functionality
        prevButtons.forEach(button => {
            button.addEventListener('click', function() {
                goToStep(currentStep - 1);
            });
        });
        
        // New booking button
        if (newBookingBtn) {
            newBookingBtn.addEventListener('click', function() {
                bookingForm.reset();
                goToStep(1);
                showNotification('New booking started', 'success');
            });
        }
        
        // Form submission
        bookingForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (validateSection(2)) {
                // Show loading state
                const submitBtn = bookingForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                submitBtn.disabled = true;
                
                try {
                    const formData = new FormData(bookingForm);
                    const data = Object.fromEntries(formData);
                    
                    // Simulate API call - replace with actual API endpoint
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    
                    // Update booking summary
                    updateBookingSummary(data);
                    // Go to confirmation step
                    goToStep(3);
                    
                    showNotification('Booking submitted successfully!', 'success');
                    
                } catch (error) {
                    console.error('Error:', error);
                    showNotification('Error submitting booking. Please try again.', 'error');
                } finally {
                    // Reset button state
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            }
        });
        
        // Function to go to specific step
        function goToStep(step) {
            // Update current step
            currentStep = step;
            
            // Update step indicators
            steps.forEach((stepElement, index) => {
                if (index < step - 1) {
                    stepElement.classList.add('completed');
                    stepElement.classList.remove('active');
                } else if (index === step - 1) {
                    stepElement.classList.add('active');
                    stepElement.classList.remove('completed');
                } else {
                    stepElement.classList.remove('active', 'completed');
                }
            });
            
            // Show/hide sections
            sections.forEach((section, index) => {
                if (index === step - 1) {
                    section.classList.add('active');
                } else {
                    section.classList.remove('active');
                }
            });
        }
        
        // Function to validate section
        function validateSection(sectionNumber) {
            const section = document.getElementById(`section${sectionNumber}`);
            const requiredFields = section.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.classList.add('error');
                    isValid = false;
                } else {
                    field.classList.remove('error');
                }
                
                // Email validation
                if (field.type === 'email' && field.value) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(field.value)) {
                        field.classList.add('error');
                        isValid = false;
                        showNotification('Please enter a valid email address.', 'error');
                    }
                }
                
                // Phone validation
                if (field.type === 'tel' && field.value) {
                    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
                    if (!phoneRegex.test(field.value.replace(/\s/g, ''))) {
                        field.classList.add('error');
                        isValid = false;
                        showNotification('Please enter a valid phone number (10-15 digits).', 'error');
                    }
                }
            });
            
            return isValid;
        }
        
        // Function to update booking summary
        function updateBookingSummary(data) {
            const summaryDiv = document.getElementById('bookingSummary');
            
            const summaryHTML = `
                <div class="summary-item">
                    <strong>Service:</strong> ${data.service || 'Not specified'}
                </div>
                <div class="summary-item">
                    <strong>Date:</strong> ${data.serviceDate || 'Not specified'}
                </div>
                <div class="summary-item">
                    <strong>Time:</strong> ${data.timeSlot || 'Not specified'}
                </div>
                <div class="summary-item">
                    <strong>Customer:</strong> ${data.fullName || 'Not specified'}
                </div>
                <div class="summary-item">
                    <strong>Phone:</strong> ${data.phone || 'Not specified'}
                </div>
                <div class="summary-item">
                    <strong>Area:</strong> ${data.area || 'Not specified'}
                </div>
            `;
            
            summaryDiv.innerHTML = summaryHTML;
        }
        
        // Remove error class on input
        bookingForm.querySelectorAll('input, textarea, select').forEach(field => {
            field.addEventListener('input', function() {
                this.classList.remove('error');
            });
        });
    }
    
    // ========== FORM VALIDATION HELPER ==========
    function validateForm(fields) {
        let isValid = true;
        
        fields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('error');
                isValid = false;
            } else {
                field.classList.remove('error');
            }
            
            // Email validation
            if (field.type === 'email' && field.value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(field.value)) {
                    field.classList.add('error');
                    isValid = false;
                    showNotification('Please enter a valid email address.', 'error');
                }
            }
            
            // Phone validation
            if (field.type === 'tel' && field.value) {
                const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
                if (!phoneRegex.test(field.value.replace(/\s/g, ''))) {
                    field.classList.add('error');
                    isValid = false;
                    showNotification('Please enter a valid phone number (10-15 digits).', 'error');
                }
            }
        });
        
        return isValid;
    }
    
    // ========== SMOOTH SCROLLING ==========
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            e.preventDefault();
            
            const targetElement = document.querySelector(href);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update URL hash without scrolling
                history.pushState(null, null, href);
            }
        });
    });
    
    // ========== FADE IN ANIMATIONS ==========
    // Add fade-in animation to elements
    const fadeElements = document.querySelectorAll('.fade-in');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });
    
    fadeElements.forEach(element => {
        observer.observe(element);
    });
    
    // ========== DATE INPUT MIN VALUE ==========
    // Set minimum date to today for date inputs
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    
    dateInputs.forEach(input => {
        input.setAttribute('min', today);
    });
    
    // ========== SCROLL TO TOP BUTTON ==========
    // Create scroll to top button
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    scrollToTopBtn.className = 'scroll-to-top';
    scrollToTopBtn.setAttribute('aria-label', 'Scroll to top');
    scrollToTopBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: #1a5f7a;
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: none;
        z-index: 1000;
        font-size: 20px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        transition: opacity 0.3s, transform 0.3s;
        align-items: center;
        justify-content: center;
    `;
    
    document.body.appendChild(scrollToTopBtn);
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.style.display = 'flex';
        } else {
            scrollToTopBtn.style.display = 'none';
        }
    });
    
    // Scroll to top on click
    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // ========== SERVICE BOOKING BUTTONS ==========
    // Add click event to all "Book This Service" buttons
    document.querySelectorAll('.btn-book-service').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const serviceName = this.closest('.service-card')?.querySelector('h3')?.textContent;
            if (serviceName) {
                localStorage.setItem('selectedService', serviceName);
            }
            window.location.href = '/booking';
        });
    });
    
    // ========== EMERGENCY CALL BUTTONS ==========
    // Add confirmation to emergency call buttons
    document.querySelectorAll('a[href^="tel:"].btn-emergency').forEach(button => {
        button.addEventListener('click', function(e) {
            if (!confirm('Are you sure you want to call the emergency number?')) {
                e.preventDefault();
            }
        });
    });
    
    // ========== FORM INPUT FORMATTING ==========
    // Phone number formatting
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            // Format for Saudi numbers
            if (value.length > 0) {
                if (value.startsWith('966')) {
                    value = '+' + value;
                } else if (!value.startsWith('+') && value.length >= 9) {
                    value = '+966' + value;
                }
                
                // Add spaces for readability
                if (value.length > 3) {
                    value = value.replace(/(\+\d{3})(\d{1})(\d{3})(\d{4})/, '$1 $2$3 $4');
                }
            }
            
            e.target.value = value.substring(0, 15); // Limit length
        });
    });
    
    // ========== FIX FOR iOS ZOOM ISSUE ==========
    // Instead of scrolling to top, we prevent zoom by ensuring proper font size
    // The CSS already handles this with font-size: 16px
    
    // Additional fix for mobile viewport
    function preventZoomOnFocus() {
        let viewport = document.querySelector("meta[name=viewport]");
        if (viewport) {
            viewport.setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no");
        }
    }
    
    // Call on load for mobile devices
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        preventZoomOnFocus();
    }
});

// ========== GLOBAL FUNCTIONS ==========

// Function to format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'SAR'
    }).format(amount);
}

// Function to show notification
function showNotification(message, type = 'success') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(notification => {
        notification.remove();
    });
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#2ecc71' : '#e74c3c'};
        color: white;
        border-radius: 5px;
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}