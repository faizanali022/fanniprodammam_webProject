/**
 * Professional Floating Contact Widget
 * Features: Call, WhatsApp, Clipboard Copy, Language Sync
 */

const ContactWidget = (() => {
    // --- Configuration & Selectors ---
    const CONFIG = {
        phoneNumber: "+966551234567",
        langButtonID: "language-switcher", // Apne header button ki ID yahan check karein
        activeClass: "active",
        langClass: "lang-ar"
    };

    const elements = {
        body: document.body,
        widget: document.querySelector('.floating-call-widget'),
        callBtn: document.getElementById('callBtn'),
        menu: document.querySelector('.call-menu'),
        closeBtn: document.querySelector('.close-menu'),
        overlay: document.querySelector('.menu-overlay'),
        copyBtn: document.getElementById('copyBtn'),
        copyMsg: document.querySelector('.copy-success'),
        langBtn: document.getElementById(CONFIG.langButtonID)
    };

    // --- Core Functions ---

    // 1. Menu Toggle Logic
    const toggleMenu = () => {
        const isOpen = elements.menu.classList.toggle(CONFIG.activeClass);
        // Menu khulne par button ko thora chota effect dena
        elements.callBtn.style.transform = isOpen ? "scale(0.9)" : "";
    };

    // 2. Copy Number Logic
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(CONFIG.phoneNumber);
            
            // Feedback show karna
            elements.copyMsg.classList.add('show');
            
            // 2 seconds baad hide karna
            setTimeout(() => {
                elements.copyMsg.classList.remove('show');
            }, 2000);

        } catch (err) {
            console.error('Copy failed:', err);
            // Fallback for older browsers
            alert("Phone number: " + CONFIG.phoneNumber);
        }
    };

    // 3. Language Sync Logic
    const syncLanguage = () => {
        // Check if Arabic is already active in body or localStorage
        const savedLang = localStorage.getItem('site-lang');
        if (savedLang === 'ar' || elements.body.classList.contains(CONFIG.langClass)) {
            elements.body.classList.add(CONFIG.langClass);
        }
    };

    // --- Event Listeners ---
    const initEventListeners = () => {
        // Toggle menu clicks
        elements.callBtn?.addEventListener('click', toggleMenu);
        elements.closeBtn?.addEventListener('click', toggleMenu);
        elements.overlay?.addEventListener('click', toggleMenu);

        // Copy button click
        elements.copyBtn?.addEventListener('click', (e) => {
            e.stopPropagation(); // Menu band hone se rokne ke liye
            handleCopy();
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === "Escape" && elements.menu.classList.contains(CONFIG.activeClass)) {
                toggleMenu();
            }
        });

        // Outside click close
        document.addEventListener('click', (e) => {
            if (elements.menu.classList.contains(CONFIG.activeClass) && 
                !elements.widget.contains(e.target)) {
                toggleMenu();
            }
        });

        // Header Language Button Sync
        elements.langBtn?.addEventListener('click', () => {
            // Hum thora delay dete hain taake main site ki language script pehle chal jaye
            setTimeout(() => {
                if (elements.body.classList.contains(CONFIG.langClass)) {
                    localStorage.setItem('site-lang', 'ar');
                } else {
                    localStorage.setItem('site-lang', 'en');
                }
            }, 50);
        });
    };

    // --- Initialize ---
    const init = () => {
        if (!elements.widget) return; // Error handling
        syncLanguage();
        initEventListeners();
        console.log("Widget Initialized Successfully");
    };

    return { init };
})();

// Execute
document.addEventListener('DOMContentLoaded', ContactWidget.init);