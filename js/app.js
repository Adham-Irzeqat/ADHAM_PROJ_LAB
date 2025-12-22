/**
 * Main Application Entry Point
 * Initializes the application using MVC and Repository patterns
 */

// Initialize application components
const taskRepository = new TaskRepository();
const taskView = new TaskView();
const taskController = new TaskController(taskRepository, taskView);

// Make controller globally accessible for onclick handlers
window.taskController = taskController;

// Force English locale globally
(function() {
    // Override Intl.DateTimeFormat to always use English
    if (window.Intl && Intl.DateTimeFormat) {
        const OriginalDateTimeFormat = Intl.DateTimeFormat;
        window.Intl.DateTimeFormat = function(locales, options) {
            // Force en-US locale
            if (typeof locales === 'string' && !locales.startsWith('en')) {
                locales = 'en-US';
            } else if (Array.isArray(locales) && !locales.some(l => l.startsWith('en'))) {
                locales = ['en-US'];
            } else if (!locales) {
                locales = 'en-US';
            }
            return new OriginalDateTimeFormat(locales, options);
        };
    }
    
    // Override Date.prototype.toLocaleString to use English
    const originalToLocaleString = Date.prototype.toLocaleString;
    Date.prototype.toLocaleString = function(locales, options) {
        if (!locales || (typeof locales === 'string' && !locales.startsWith('en'))) {
            locales = 'en-US';
        }
        return originalToLocaleString.call(this, locales, options);
    };
    
    // Override Date.prototype.toLocaleDateString
    const originalToLocaleDateString = Date.prototype.toLocaleDateString;
    Date.prototype.toLocaleDateString = function(locales, options) {
        if (!locales || (typeof locales === 'string' && !locales.startsWith('en'))) {
            locales = 'en-US';
        }
        return originalToLocaleDateString.call(this, locales, options);
    };
    
    // Override Date.prototype.toLocaleTimeString
    const originalToLocaleTimeString = Date.prototype.toLocaleTimeString;
    Date.prototype.toLocaleTimeString = function(locales, options) {
        if (!locales || (typeof locales === 'string' && !locales.startsWith('en'))) {
            locales = 'en-US';
        }
        return originalToLocaleTimeString.call(this, locales, options);
    };
})();

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Set locale for date inputs to English with stronger enforcement
    const dateInputs = document.querySelectorAll('input[type="datetime-local"]');
    dateInputs.forEach(input => {
        // Set all language attributes
        input.setAttribute('lang', 'en');
        input.setAttribute('xml:lang', 'en');
        input.setAttribute('hreflang', 'en');
        
        // Force LTR direction
        input.style.direction = 'ltr';
        input.style.textAlign = 'left';
        input.style.unicodeBidi = 'embed';
        
        // Set input mode
        input.setAttribute('inputmode', 'none');
        
        // Add event listeners
        input.addEventListener('focus', function() {
            this.setAttribute('lang', 'en');
            this.setAttribute('xml:lang', 'en');
            this.style.direction = 'ltr';
        });
        
        input.addEventListener('click', function() {
            this.setAttribute('lang', 'en');
            this.setAttribute('xml:lang', 'en');
        });
        
        input.addEventListener('change', function() {
            if (this.value) {
                const date = new Date(this.value);
                if (!isNaN(date.getTime())) {
                    // Format as MM/DD/YYYY HH:MM
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    // Keep ISO format for value but ensure display is English
                    this.value = `${year}-${month}-${day}T${hours}:${minutes}`;
                }
            }
        });
    });
    
    // Load tasks on startup (FR9)
    taskController.init();
    
    console.log('Smart Task Organizer initialized successfully');
    console.log('Loaded tasks:', taskRepository.getAll().length);
    console.log('Date picker locale: en-US');
});

