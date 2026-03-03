// ========== BOOKING FORM FUNCTIONALITY ==========
document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('bookingForm');
    if (!bookingForm) return;

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
        button.addEventListener('click', function(e) {
            e.preventDefault();
            if (validateSection(currentStep)) {
                goToStep(currentStep + 1);
                // Scroll to top of form
                bookingForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
    
    // Previous button functionality
    prevButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            goToStep(currentStep - 1);
            bookingForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
    
    // New booking button
    if (newBookingBtn) {
        newBookingBtn.addEventListener('click', function(e) {
            e.preventDefault();
            bookingForm.reset();
            goToStep(1);
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
                
                // Send data to API endpoint
                const response = await fetch('/api/bookings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (!response.ok) {
                    throw new Error(result.message || 'Failed to submit booking');
                }
                
                // Update booking summary
                updateBookingSummary(data);
                
                // Go to confirmation step
                goToStep(3);
                
                // Show success message
                showNotification(result.message || 'Booking submitted successfully! We will contact you within 2 hours.', 'success');
                
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
            } catch (error) {
                console.error('Error:', error);
                showNotification('Error submitting booking. Please try again.', 'error');
                // Go back to step 2
                goToStep(2);
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
            const stepNumber = index + 1;
            stepElement.classList.remove('active', 'completed');
            
            if (stepNumber < step) {
                stepElement.classList.add('completed');
            } else if (stepNumber === step) {
                stepElement.classList.add('active');
            }
        });
        
        // Show/hide sections
        sections.forEach((section, index) => {
            const sectionNumber = index + 1;
            section.classList.remove('active');
            if (sectionNumber === step) {
                section.classList.add('active');
            }
        });
    }
    
    // Function to validate section
    function validateSection(sectionNumber) {
        const section = document.getElementById(`section${sectionNumber}`);
        const requiredFields = section.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            // Reset error state
            field.classList.remove('error');
            
            if (!field.value.trim()) {
                field.classList.add('error');
                isValid = false;
            }
            
            // Special validations
            if (field.type === 'email' && field.value.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(field.value)) {
                    field.classList.add('error');
                    isValid = false;
                    showNotification('Please enter a valid email address.', 'error');
                }
            }
            
            if (field.type === 'tel' && field.value.trim()) {
                // Remove all non-digits for validation
                const phoneDigits = field.value.replace(/\D/g, '');
                if (phoneDigits.length < 10 || phoneDigits.length > 15) {
                    field.classList.add('error');
                    isValid = false;
                    showNotification('Please enter a valid phone number (10-15 digits).', 'error');
                }
            }
            
            // Radio button validation
            if (field.type === 'radio' && sectionNumber === 1) {
                const serviceSelected = document.querySelector('input[name="service"]:checked');
                if (!serviceSelected) {
                    showNotification('Please select a service.', 'error');
                    isValid = false;
                }
            }
        });
        
        // Additional validation for date
        if (sectionNumber === 1) {
            const dateField = document.getElementById('serviceDate');
            if (dateField.value) {
                const selectedDate = new Date(dateField.value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                if (selectedDate < today) {
                    dateField.classList.add('error');
                    isValid = false;
                    showNotification('Please select a future date.', 'error');
                }
            }
        }
        
        return isValid;
    }
    
    // Function to update booking summary
    function updateBookingSummary(data) {
        const summaryDiv = document.getElementById('bookingSummary');
        const timeSlotText = getTimeSlotText(data.timeSlot);
        
        const summaryHTML = `
            <div class="summary-item">
                <span><strong>Service:</strong></span>
                <span>${data.service || 'Not specified'}</span>
            </div>
            <div class="summary-item">
                <span><strong>Date:</strong></span>
                <span>${data.serviceDate ? formatDate(data.serviceDate) : 'Not specified'}</span>
            </div>
            <div class="summary-item">
                <span><strong>Time:</strong></span>
                <span>${timeSlotText}</span>
            </div>
            <div class="summary-item">
                <span><strong>Customer:</strong></span>
                <span>${data.fullName || 'Not specified'}</span>
            </div>
            <div class="summary-item">
                <span><strong>Phone:</strong></span>
                <span>${data.phone || 'Not specified'}</span>
            </div>
            <div class="summary-item">
                <span><strong>Area:</strong></span>
                <span>${data.area || 'Not specified'}</span>
            </div>
            <div class="summary-item">
                <span><strong>Address:</strong></span>
                <span>${data.address || 'Not specified'}</span>
            </div>
            ${data.description ? `
            <div class="summary-item">
                <span><strong>Description:</strong></span>
                <span>${data.description}</span>
            </div>
            ` : ''}
        `;
        
        summaryDiv.innerHTML = summaryHTML;
    }
    
    // Helper function to get time slot text
    function getTimeSlotText(timeSlot) {
        const timeSlots = {
            '9AM-12PM': 'Morning (9 AM - 12 PM)',
            '12PM-3PM': 'Afternoon (12 PM - 3 PM)',
            '3PM-6PM': 'Evening (3 PM - 6 PM)',
            'emergency': 'Emergency Service'
        };
        return timeSlots[timeSlot] || timeSlot || 'Not specified';
    }
    
    // Helper function to format date
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
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
    
    // Add CSS for notifications
    const notificationStyle = document.createElement('style');
    notificationStyle.textContent = `
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
    `;
    document.head.appendChild(notificationStyle);
    
    // Remove error class on input
    bookingForm.querySelectorAll('input, textarea, select').forEach(field => {
        field.addEventListener('input', function() {
            this.classList.remove('error');
        });
    });
    
    // Set minimum date to today
    const dateInput = document.getElementById('serviceDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
        
        // Set default to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        dateInput.value = tomorrowStr;
    }
    
    // Format phone number
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
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
            
            e.target.value = value.substring(0, 17); // Limit length
        });
    }
    
    // Service option click handler
    document.querySelectorAll('.service-option label').forEach(label => {
        label.addEventListener('click', function() {
            const radio = this.previousElementSibling;
            radio.checked = true;
            
            // Add visual feedback
            document.querySelectorAll('.service-option label').forEach(l => {
                l.style.borderColor = '#e0e0e0';
                l.style.background = 'white';
            });
            
            this.style.borderColor = '#1a5f7a';
            this.style.background = 'rgba(26, 95, 122, 0.05)';
        });
    });
    
    // Time slot selection
    const timeSlotSelect = document.getElementById('timeSlot');
    if (timeSlotSelect) {
        timeSlotSelect.addEventListener('change', function() {
            // Remove any existing time slot options
            const existingOptions = document.querySelector('.time-slot-options');
            if (existingOptions) {
                existingOptions.remove();
            }
            
            if (this.value === 'emergency') {
                // Show emergency note
                const emergencyNote = document.createElement('div');
                emergencyNote.className = 'emergency-note';
                emergencyNote.style.cssText = `
                    background: #fff3cd;
                    border: 1px solid #ffc107;
                    color: #856404;
                    padding: 15px;
                    border-radius: 8px;
                    margin-top: 10px;
                    text-align: center;
                `;
                emergencyNote.innerHTML = `
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>Emergency Service:</strong> We will contact you immediately for urgent assistance.
                `;
                
                this.parentNode.appendChild(emergencyNote);
            }
        });
    }
    
    // Initialize service selection
    const firstService = document.querySelector('.service-option input[type="radio"]');
    if (firstService) {
        firstService.checked = true;
        firstService.nextElementSibling.style.borderColor = '#1a5f7a';
        firstService.nextElementSibling.style.background = 'rgba(26, 95, 122, 0.05)';
    }
});