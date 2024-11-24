// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeToggleIcon(savedTheme);
}

function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeToggleIcon(newTheme);
}

function updateThemeToggleIcon(theme) {
    const icon = document.querySelector('.theme-toggle i');
    if (icon) {
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
}

// Tab Functionality
function initializeTabs() {
    const defaultTab = document.querySelector('.tab.active');
    if (defaultTab) {
        const tabId = defaultTab.getAttribute('data-tab');
        switchTab(tabId, defaultTab);
    }

    // Add click handlers to all tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId, this);
        });
    });
}

function switchTab(tabId, clickedTab) {
    // Update tab buttons
    const allTabs = document.querySelectorAll('.tab');
    allTabs.forEach(tab => {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
    });
    clickedTab.classList.add('active');
    clickedTab.setAttribute('aria-selected', 'true');

    // Update content sections
    const allContent = document.querySelectorAll('.tab-content');
    allContent.forEach(content => {
        content.style.display = 'none';
        content.classList.remove('active');
    });

    // Show selected content
    const selectedContent = document.getElementById(tabId);
    if (selectedContent) {
        selectedContent.style.display = 'block';
        selectedContent.classList.add('active');
    }
}

// Checklist and Progress Bar Functionality
function initializeChecklists() {
    document.querySelectorAll('.checklist-section').forEach(section => {
        const checkboxes = section.querySelectorAll('input[type="checkbox"]');
        
        checkboxes.forEach(checkbox => {
            // Load saved state
            const saved = localStorage.getItem(checkbox.id);
            if (saved === 'true') {
                checkbox.checked = true;
            }

            // Add change listener
            checkbox.addEventListener('change', function() {
                localStorage.setItem(this.id, this.checked);
                updateProgress(section);
            });
        });

        updateProgress(section);
    });
}

function updateProgress(section) {
    const total = section.querySelectorAll('input[type="checkbox"]').length;
    const checked = section.querySelectorAll('input[type="checkbox"]:checked').length;
    const progressBar = section.querySelector('.progress-bar');
    
    if (progressBar && total > 0) {
        const percentage = (checked / total) * 100;
        progressBar.style.width = `${percentage}%`;
        progressBar.setAttribute('aria-valuenow', percentage);
    }
}

// Search Functionality
function initializeSearch() {
    initializeCourseSearch();
    initializeFacultySearch();
    initializeFAQSearch();
}

function initializeCourseSearch() {
    const courseSearch = document.getElementById('courseSearch');
    const courseFilter = document.getElementById('courseFilter');
    const courses = document.querySelectorAll('#courseGrid .course-card');

    if (courseSearch && courseFilter) {
        function filterCourses() {
            const searchTerm = courseSearch.value.toLowerCase();
            const filterValue = courseFilter.value;

            courses.forEach(course => {
                const text = course.textContent.toLowerCase();
                const categories = course.dataset.categories.split(' ');
                
                const matchesSearch = text.includes(searchTerm);
                const matchesFilter = filterValue === 'all' || categories.includes(filterValue);

                course.style.display = matchesSearch && matchesFilter ? '' : 'none';
            });
        }

        courseSearch.addEventListener('input', filterCourses);
        courseFilter.addEventListener('change', filterCourses);
    }
}

function initializeFacultySearch() {
    const facultySearch = document.getElementById('facultySearch');
    const faculty = document.querySelectorAll('#facultyGrid .faculty-card');

    if (facultySearch) {
        facultySearch.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            faculty.forEach(member => {
                const text = member.textContent.toLowerCase();
                member.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
}

function initializeFAQSearch() {
    const searchInput = document.getElementById('faqSearch');
    if (!searchInput) return;

    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const faqItems = document.querySelectorAll('.faq-item');

        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question').textContent.toLowerCase();
            const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
            const matches = question.includes(searchTerm) || answer.includes(searchTerm);
            item.style.display = matches ? '' : 'none';
        });
    });
}

// FAQ Functionality
function initializeFAQ() {
    const faqButtons = document.querySelectorAll('.faq-question');
    faqButtons.forEach(button => {
        button.addEventListener('click', () => toggleFAQ(button));
    });
}

function toggleFAQ(button) {
    button.classList.toggle('active');
    const answer = button.nextElementSibling;
    answer.classList.toggle('active');
}

// Footer Functionality
function initializeFooterDates() {
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    const lastUpdatedElement = document.getElementById('lastUpdated');
    if (lastUpdatedElement) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const lastUpdated = new Date().toLocaleDateString('en-US', options);
        lastUpdatedElement.textContent = lastUpdated;
    }
}

function toggleMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navigation = document.querySelector('.navigation');
    hamburger.classList.toggle('active');
    navigation.classList.toggle('active');
}

// Mobile Navigation
function initializeMobileNav() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navList = document.querySelector('.nav-list');
    
    if (menuToggle && navList) {
        menuToggle.addEventListener('click', () => {
            navList.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', 
                navList.classList.contains('active'));
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
            if (!e.target.closest('.navigation')) {
                navList.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
}

// Add to your DOM loaded event listener
document.addEventListener('DOMContentLoaded', function() {
    // ... other initializations ...
    initializeMobileNav();
});
// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeTabs();
    initializeChecklists();
    initializeSearch();
    initializeFAQ();
    initializeFooterDates();
});

/* Sticky Search Container */
.search-container {
    position: sticky;
    top: 60px; /* Adjust based on your navigation height */
    z-index: 90;
    background: var(--bg-primary);
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    margin-bottom: 1.5rem;
}

/* Add padding to content below search to prevent jump */
#courseGrid,
#facultyGrid {
    padding-top: 1rem;
}

/* Ensure search container stays on top but below navigation */
.search-container {
    margin-top: -1rem; /* Compensate for section padding */
    margin-left: -1rem;
    margin-right: -1rem;
    width: calc(100% + 2rem);
}

/* Dark mode adjustments */
[data-theme="dark"] .search-container {
    background: var(--bg-primary);
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* Mobile adjustments */
@media (max-width: 768px) {
    .search-container {
        top: 50px; /* Adjust for smaller mobile header */
        padding: 0.75rem;
    }

    /* Prevent horizontal scroll on mobile */
    .section {
        overflow-x: hidden;
    }
}