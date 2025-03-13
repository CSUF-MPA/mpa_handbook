// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeToggleIcon(savedTheme);
}

function toggleTheme() {
    const root = document.documentElement;
    const currentTheme = root.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeToggleIcon(newTheme);
}

function updateThemeToggleIcon(theme) {
    const icon = document.querySelector('.theme-toggle i');
    if (icon) {
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    } else {
        console.warn('Theme toggle icon not found.');
    }
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

// Course Filtering and Accordion Functionality
document.addEventListener('DOMContentLoaded', function () {
    // Dropdown Filtering Logic
    const courseFilter = document.getElementById('courseFilter');
    const courses = document.querySelectorAll('.course-card');
    const courseGrid = document.getElementById('courseGrid');

    if (courseFilter) {
        courseFilter.addEventListener('change', function () {
            const selectedCategory = this.value;
            let visibleCourses = 0;

            courses.forEach(course => {
                const categories = course.getAttribute('data-categories').split(' ');
                
                if (selectedCategory === 'all' || categories.includes(selectedCategory)) {
                    course.style.display = 'block';
                    visibleCourses++;
                } else {
                    course.style.display = 'none';
                }
            });
            
            // Adjust section height dynamically
            if (visibleCourses > 0) {
                courseGrid.style.minHeight = (visibleCourses * 100) + 'px';
            } else {
                courseGrid.style.minHeight = 'auto';
            }
        });
    }

    // Accordion Functionality
    const accordions = document.querySelectorAll('.accordion-header');

    if (accordions.length > 0) {
        accordions.forEach(header => {
            header.addEventListener('click', function () {
                const content = this.nextElementSibling;
                
                if (!content.classList.contains('active')) {
                    // Close all open accordions
                    document.querySelectorAll('.accordion-content').forEach(item => {
                        item.style.maxHeight = null;
                        item.classList.remove('active');
                    });
                    
                    // Open clicked accordion
                    content.style.maxHeight = content.scrollHeight + 'px';
                    content.classList.add('active');
                    content.style.overflow = 'visible'; // Ensure content is fully shown
                } else {
                    content.style.maxHeight = null;
                    content.classList.remove('active');
                    content.style.overflow = 'hidden';
                }
            });
        });
    }
});


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
    initializeFAQ();
    initializeMobileNav();

    // Add theme toggle event listener
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
});