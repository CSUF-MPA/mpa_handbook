// Theme Management
// Theme Management
function initializeTheme() {
    // Get saved theme or use preferred color scheme as fallback
    const savedTheme = localStorage.getItem('theme') || 
                       (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Update toggle button icon
    updateThemeToggleIcon(savedTheme);
    
    console.log('Theme initialized:', savedTheme);
}

function toggleTheme() {
    const root = document.documentElement;
    const currentTheme = root.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Apply new theme
    root.setAttribute('data-theme', newTheme);
    
    // Save preference
    localStorage.setItem('theme', newTheme);
    
    // Update button icon
    updateThemeToggleIcon(newTheme);
    
    console.log('Theme toggled to:', newTheme);
}

function updateThemeToggleIcon(theme) {
    const icon = document.querySelector('.theme-toggle i');
    if (icon) {
        // Clear all existing classes first
        icon.className = '';
        // Add the appropriate icon class
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        console.log('Theme icon updated:', icon.className);
    } else {
        console.warn('Theme toggle icon not found. Looking for .theme-toggle i element.');
    }
}

// Initialize all functionality
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Setting up theme toggle');

    // Initialize theme first
    initializeTheme();
    
    // Add theme toggle event listener
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        console.log('Theme toggle button listener attached');
    } else {
        console.warn('Theme toggle button not found. Looking for .theme-toggle element.');
    }
    
    // Other initializations
    initializeTabs();
    initializeChecklists();
    
    // These functions might not exist or have errors
    try {
        if (typeof initializeFAQ === 'function') initializeFAQ();
        if (typeof initializeMobileNav === 'function') initializeMobileNav();
    } catch (error) {
        console.error('Error initializing optional components:', error);
    }
});

// For debugging - add to your HTML
function checkThemeToggle() {
    const button = document.querySelector('.theme-toggle');
    const icon = document.querySelector('.theme-toggle i');
    const theme = document.documentElement.getAttribute('data-theme');
    
    console.log({
        'Button exists': !!button,
        'Icon exists': !!icon,
        'Current theme': theme,
        'Button HTML': button ? button.outerHTML : 'Not found',
        'Current icon class': icon ? icon.className : 'Not found'
    });
}
// Concentration Tabs Functionality
function initializeTabs() {
    const tabs = document.querySelectorAll('.tab');
    const tabPanels = document.querySelectorAll('.tab-content');

    // Set initial state
    const defaultTab = document.querySelector('.tab.active');
    if (defaultTab) {
        const targetPanelId = defaultTab.getAttribute('aria-controls');
        const targetPanel = document.getElementById(targetPanelId);
        if (targetPanel) {
            targetPanel.hidden = false;
            targetPanel.classList.add('active');
        }
    }

    // Add event listeners to tabs
    tabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab));
        tab.addEventListener('keydown', (e) => handleTabKeydown(e, tab));
    });
}

function switchTab(newTab) {
    const targetPanelId = newTab.getAttribute('aria-controls');
    const targetPanel = document.getElementById(targetPanelId);

    if (!targetPanel) return;

    // Update tab buttons
    const allTabs = document.querySelectorAll('.tab');
    allTabs.forEach(tab => {
        tab.setAttribute('aria-selected', 'false');
        tab.setAttribute('tabindex', '-1');
        tab.classList.remove('active');
    });

    newTab.setAttribute('aria-selected', 'true');
    newTab.setAttribute('tabindex', '0');
    newTab.classList.add('active');
    newTab.focus();

    // Update content panels
    const allPanels = document.querySelectorAll('.tab-content');
    allPanels.forEach(panel => {
        panel.hidden = true;
        panel.classList.remove('active');
    });

    targetPanel.hidden = false;
    targetPanel.classList.add('active');
}

function handleTabKeydown(e, tab) {
    const tabs = Array.from(document.querySelectorAll('.tab'));
    const currentIndex = tabs.indexOf(tab);

    switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
            e.preventDefault();
            const nextTab = tabs[(currentIndex + 1) % tabs.length];
            switchTab(nextTab);
            break;
        case 'ArrowLeft':
        case 'ArrowUp':
            e.preventDefault();
            const prevTab = tabs[(currentIndex - 1 + tabs.length) % tabs.length];
            switchTab(prevTab);
            break;
        case 'Home':
            e.preventDefault();
            switchTab(tabs[0]);
            break;
        case 'End':
            e.preventDefault();
            switchTab(tabs[tabs.length - 1]);
            break;
    }
}

// Initialize checklists and progress bars
function initializeChecklists() {
    document.querySelectorAll('.checklist-section').forEach(section => {
        const checkboxes = section.querySelectorAll('input[type="checkbox"]');
        const progressBar = section.querySelector('.progress-bar');
        const progressLabel = section.querySelector('.progress-container label');

        // Load saved state
        checkboxes.forEach(checkbox => {
            const saved = localStorage.getItem(checkbox.id);
            if (saved === 'true') {
                checkbox.checked = true;
                checkbox.setAttribute('aria-checked', 'true');
            }

            // Add change listener
            checkbox.addEventListener('change', function() {
                localStorage.setItem(this.id, this.checked);
                this.setAttribute('aria-checked', this.checked.toString());
                updateProgress(section);
            });
        });

        // Initial progress update
        updateProgress(section);
    });
}

// Update progress bar and announce changes
function updateProgress(section) {
    const checkboxes = section.querySelectorAll('input[type="checkbox"]');
    const progressBar = section.querySelector('.progress-bar');
    const progressLabel = section.querySelector('.progress-container label');

    if (!progressBar || !progressLabel) return;

    const total = checkboxes.length;
    const checked = section.querySelectorAll('input[type="checkbox"]:checked').length;
    const percentage = Math.round((checked / total) * 100);

    // Update progress bar
    progressBar.style.width = `${percentage}%`;
    progressBar.setAttribute('aria-valuenow', percentage);
    progressBar.setAttribute('aria-valuetext', `${percentage}% complete`);

    // Announce progress to screen readers
    const announcement = `${percentage}% of ${section.querySelector('h3').textContent} completed`;
    announceToScreenReader(announcement);
}

// Announce changes to screen readers
function announceToScreenReader(message) {
    const announcer = document.getElementById('aria-announcer') || createAriaAnnouncer();
    announcer.textContent = message;
}

// Create an ARIA live region for announcements
function createAriaAnnouncer() {
    const announcer = document.createElement('div');
    announcer.id = 'aria-announcer';
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.classList.add('sr-only');
    document.body.appendChild(announcer);
    return announcer;
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initializeChecklists();
});

/**
 * Course Catalog - Filtering and Accordion Functionality
 * 
 * This script provides two main functionalities:
 * 1. Filtering courses by category (core, HR, finance, etc.)
 * 2. Expanding/collapsing course details with accordion behavior
 */

document.addEventListener('DOMContentLoaded', function() {
    // Course Filtering Logic
    const courseFilter = document.getElementById('courseFilter');
    const courses = document.querySelectorAll('.course-card');
    const courseGrid = document.getElementById('courseGrid');
    const resultsCount = document.getElementById('courseResults');
    
    if (courseFilter) {
        // Initial count display
        updateResultsCount('all');
        
        // Filter change event
        courseFilter.addEventListener('change', function() {
            const selectedCategory = this.value;
            filterCourses(selectedCategory);
        });
    }
    
    // Course Accordion Functionality
    courses.forEach(card => {
        // Only add click handler to cards with course-details
        if (card.querySelector('.course-details')) {
            // Make the whole card header clickable
            const cardHeader = card.querySelector('h3');
            if (cardHeader) {
                cardHeader.style.cursor = 'pointer';
                cardHeader.addEventListener('click', function(e) {
                    toggleCourseDetails(card);
                });
            }
            
            // Also make the course-header clickable
            const courseHeader = card.querySelector('.course-header');
            if (courseHeader) {
                courseHeader.style.cursor = 'pointer';
                courseHeader.addEventListener('click', function(e) {
                    toggleCourseDetails(card);
                });
            }
        }
    });
    
    /**
     * Filter courses based on selected category
     * @param {string} category - The category to filter by
     */
    function filterCourses(category) {
        let visibleCourses = 0;
        
        courses.forEach(course => {
            const categories = course.getAttribute('data-categories').split(' ');
            
            if (category === 'all' || categories.includes(category)) {
                course.style.display = 'flex';
                visibleCourses++;
            } else {
                course.style.display = 'none';
            }
            
            // Close any open course details when filtering
            if (course.classList.contains('active')) {
                course.classList.remove('active');
            }
        });
        
        // Update the results count display
        updateResultsCount(category, visibleCourses);
    }
    
    /**
     * Toggle the accordion state of a course card
     * @param {Element} card - The course card element
     */
    function toggleCourseDetails(card) {
        // Toggle active class for this card
        card.classList.toggle('active');
        
        // If we're opening this card, close any others that are open
        if (card.classList.contains('active')) {
            courses.forEach(otherCard => {
                if (otherCard !== card && otherCard.classList.contains('active')) {
                    otherCard.classList.remove('active');
                }
            });
        }
    }
    
    /**
     * Update the results count display
     * @param {string} category - The currently selected category
     * @param {number} count - The number of visible courses
     */
    function updateResultsCount(category, count) {
        if (!resultsCount) return;
        
        // If count is undefined (initial load), calculate it
        if (count === undefined) {
            count = 0;
            courses.forEach(course => {
                const categories = course.getAttribute('data-categories').split(' ');
                if (category === 'all' || categories.includes(category)) {
                    count++;
                }
            });
        }
        
        // Format the category name for display
        let categoryName = 'All Courses';
        if (category !== 'all') {
            // Convert category ID to display name
            const categoryMap = {
                'core': 'Core Requirements',
                'hr': 'Human Resources',
                'finance': 'Public Finance',
                'local': 'Local Government',
                'policy': 'Public Policy',
                'advisor': 'Advisor Electives'
            };
            categoryName = categoryMap[category] || category;
        }
        
        // Update the results count text
        resultsCount.textContent = `Showing ${count} ${categoryName} courses`;
    }
    
    // Add keyboard accessibility for accordion
    courses.forEach(card => {
        const clickableElements = [
            card.querySelector('h3'), 
            card.querySelector('.course-header')
        ];
        
        clickableElements.forEach(element => {
            if (element) {
                element.setAttribute('tabindex', '0');
                element.setAttribute('role', 'button');
                element.setAttribute('aria-expanded', 'false');
                
                element.addEventListener('keydown', function(e) {
                    // Activate on Enter or Space
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleCourseDetails(card);
                        this.setAttribute('aria-expanded', card.classList.contains('active').toString());
                    }
                });
            }
        });
    });
});

function initializeBackToTopButton() {
    const backToTopBtn = document.getElementById('backToTopBtn');

    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) { // Show button after scrolling 300px
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        console.log('Back to Top button initialized.');
    } else {
        console.warn('Back to Top button not found (ID: backToTopBtn).');
    }
}

// Mobile Navigation
function initializeMobileNav() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navList = document.querySelector('.nav-list');
    
    if (menuToggle && navList) {
        menuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            const isExpanded = navList.classList.contains('active');
            navList.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', (!isExpanded).toString());
        });

        // Close menu when clicking a link
        navList.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navList.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.navigation') && navList.classList.contains('active')) {
                navList.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Add keyboard navigation
        menuToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                menuToggle.click();
            }
        });
    }
}

// Initialize all functionality
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');

    initializeTheme();
    initializeTabs();
    initializeChecklists();
    initializeBackToTopButton(); // Added this line
    initializeFAQ();
    initializeMobileNav();

    // Add theme toggle event listener
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
});