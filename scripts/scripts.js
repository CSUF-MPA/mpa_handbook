// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme); // Changed from body to documentElement
    updateThemeToggleIcon(savedTheme);
}

function toggleTheme() {
    const root = document.documentElement; // Changed from body
    const currentTheme = root.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeToggleIcon(newTheme);
}

function updateThemeToggleIcon(theme) {
    const icon = document.querySelector('.theme-toggle i');
    if (icon) {
        icon.className = `fas fa-${theme === 'light' ? 'moon' : 'sun'}`;
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
        tab.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default behavior
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId, this);
        });
    });
}

function switchTab(tabId, clickedTab) {
    if (!tabId || !clickedTab) return; // Add validation

    // Update tab buttons
    const allTabs = document.querySelectorAll('.tab');
    allTabs.forEach(tab => {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
        tab.setAttribute('tabindex', '-1'); // Improve accessibility
    });
    
    clickedTab.classList.add('active');
    clickedTab.setAttribute('aria-selected', 'true');
    clickedTab.setAttribute('tabindex', '0'); // Improve accessibility

    // Update content sections
    const allContent = document.querySelectorAll('.tab-content');
    allContent.forEach(content => {
        content.style.display = 'none';
        content.classList.remove('active');
        content.setAttribute('aria-hidden', 'true'); // Improve accessibility
    });

    // Show selected content
    const selectedContent = document.getElementById(tabId);
    if (selectedContent) {
        selectedContent.style.display = 'block';
        selectedContent.classList.add('active');
        selectedContent.setAttribute('aria-hidden', 'false'); // Improve accessibility
    }
}

// Checklist and Progress Bar Functionality
function initializeChecklists() {
    document.querySelectorAll('.checklist-section').forEach(section => {
        if (!section) return; // Add validation

        const checkboxes = section.querySelectorAll('input[type="checkbox"]');
        
        checkboxes.forEach(checkbox => {
            // Ensure checkbox has an ID
            if (!checkbox.id) {
                console.warn('Checkbox missing ID:', checkbox);
                return;
            }

            // Load saved state
            const saved = localStorage.getItem(checkbox.id);
            if (saved === 'true') {
                checkbox.checked = true;
                checkbox.setAttribute('aria-checked', 'true'); // Improve accessibility
            }

            // Add change listener
            checkbox.addEventListener('change', function() {
                localStorage.setItem(this.id, this.checked);
                this.setAttribute('aria-checked', this.checked.toString()); // Improve accessibility
                updateProgress(section);
            });
        });

        updateProgress(section);
    });
}

function updateProgress(section) {
    if (!section) return; // Add validation

    const total = section.querySelectorAll('input[type="checkbox"]').length;
    const checked = section.querySelectorAll('input[type="checkbox"]:checked').length;
    const progressBar = section.querySelector('.progress-bar');
    
    if (progressBar && total > 0) {
        const percentage = Math.round((checked / total) * 100);
        progressBar.style.width = `${percentage}%`;
        progressBar.setAttribute('aria-valuenow', percentage);
        progressBar.setAttribute('aria-valuetext', `${percentage}% complete`); // Improve accessibility
    }
}

// Search Functionality
function initializeSearch() {
    const throttledSearch = throttle(filterItems, 300); // Add throttling for performance

    initializeCourseSearch(throttledSearch);
    initializeFacultySearch(throttledSearch);
    initializeFAQSearch(throttledSearch);
}

function initializeCourseSearch(throttledSearch) {
    const courseSearch = document.getElementById('courseSearch');
    const courseFilter = document.getElementById('courseFilter');
    const courses = document.querySelectorAll('#courseGrid .course-card');

    if (courseSearch && courseFilter && courses.length) {
        function filterCourses() {
            const searchTerm = courseSearch.value.toLowerCase().trim();
            const filterValue = courseFilter.value;

            courses.forEach(course => {
                const text = course.textContent.toLowerCase();
                const categories = (course.dataset.categories || '').split(' ');
                
                const matchesSearch = text.includes(searchTerm);
                const matchesFilter = filterValue === 'all' || categories.includes(filterValue);

                course.style.display = matchesSearch && matchesFilter ? '' : 'none';
                course.setAttribute('aria-hidden', (!matchesSearch || !matchesFilter).toString());
            });

            // Update results count for screen readers
            announceSearchResults(courses);
        }

        courseSearch.addEventListener('input', () => throttledSearch(filterCourses));
        courseFilter.addEventListener('change', filterCourses);
    }
}

function initializeFacultySearch(throttledSearch) {
    const facultySearch = document.getElementById('facultySearch');
    const faculty = document.querySelectorAll('#facultyGrid .faculty-card');

    if (facultySearch && faculty.length) {
        facultySearch.addEventListener('input', (e) => {
            throttledSearch(() => {
                const searchTerm = e.target.value.toLowerCase().trim();
                faculty.forEach(member => {
                    const text = member.textContent.toLowerCase();
                    const isVisible = text.includes(searchTerm);
                    member.style.display = isVisible ? '' : 'none';
                    member.setAttribute('aria-hidden', (!isVisible).toString());
                });
                announceSearchResults(faculty);
            });
        });
    }
}

function initializeFAQSearch(throttledSearch) {
    const searchInput = document.getElementById('faqSearch');
    const faqItems = document.querySelectorAll('.faq-item');

    if (searchInput && faqItems.length) {
        searchInput.addEventListener('input', (e) => {
            throttledSearch(() => {
                const searchTerm = e.target.value.toLowerCase().trim();
                faqItems.forEach(item => {
                    const question = item.querySelector('.faq-question')?.textContent.toLowerCase() || '';
                    const answer = item.querySelector('.faq-answer')?.textContent.toLowerCase() || '';
                    const isVisible = question.includes(searchTerm) || answer.includes(searchTerm);
                    item.style.display = isVisible ? '' : 'none';
                    item.setAttribute('aria-hidden', (!isVisible).toString());
                });
                announceSearchResults(faqItems);
            });
        });
    }
}

// Helper function to announce search results to screen readers
function announceSearchResults(items) {
    const visibleItems = Array.from(items).filter(item => item.style.display !== 'none');
    const announcement = `${visibleItems.length} results found`;
    
    let announcer = document.getElementById('search-announcer');
    if (!announcer) {
        announcer = document.createElement('div');
        announcer.id = 'search-announcer';
        announcer.className = 'sr-only';
        announcer.setAttribute('aria-live', 'polite');
        document.body.appendChild(announcer);
    }
    announcer.textContent = announcement;
}

// Throttle function to improve performance
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// FAQ Functionality
function initializeFAQ() {
    const faqButtons = document.querySelectorAll('.faq-question');
    faqButtons.forEach(button => {
        if (!button.id) {
            button.id = `faq-${Math.random().toString(36).substr(2, 9)}`;
        }
        
        const answer = button.nextElementSibling;
        if (answer) {
            answer.id = `answer-${button.id}`;
            button.setAttribute('aria-controls', answer.id);
            button.setAttribute('aria-expanded', 'false');
        }
        
        button.addEventListener('click', () => toggleFAQ(button));
    });
}

function toggleFAQ(button) {
    if (!button) return;

    const isExpanded = button.classList.contains('active');
    button.classList.toggle('active');
    button.setAttribute('aria-expanded', (!isExpanded).toString());

    const answer = button.nextElementSibling;
    if (answer) {
        answer.classList.toggle('active');
        answer.style.maxHeight = answer.classList.contains('active') ? 
            `${answer.scrollHeight}px` : '0';
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

// Course filtering functionality
function initializeCourseFilters() {
    console.log('Initializing course filters...'); // Debug log

    // Get all necessary elements
    const courseSearch = document.getElementById('courseSearch');
    const courseFilter = document.getElementById('courseFilter');
    const courseGrid = document.getElementById('courseGrid');
    
    if (!courseGrid) {
        console.error('Course grid not found');
        return;
    }
    
    const courses = courseGrid.getElementsByClassName('course-card');
    console.log(`Found ${courses.length} courses`); // Debug log

    if (!courseFilter || !courses.length) {
        console.error('Required elements not found');
        return;
    }

    function filterCourses() {
        const searchTerm = courseSearch ? courseSearch.value.toLowerCase().trim() : '';
        const filterValue = courseFilter.value.toLowerCase();
        
        console.log(`Filtering - Search: "${searchTerm}", Filter: "${filterValue}"`); // Debug log

        let visibleCount = 0;

        Array.from(courses).forEach(course => {
            const categories = course.dataset.categories || '';
            const text = course.textContent.toLowerCase();
            console.log(`Course categories: ${categories}`); // Debug log

            const matchesSearch = !searchTerm || text.includes(searchTerm);
            const matchesFilter = filterValue === 'all' || categories.split(' ').includes(filterValue);
            const isVisible = matchesSearch && matchesFilter;

            course.style.display = isVisible ? 'block' : 'none';
            visibleCount += isVisible ? 1 : 0;
        });

        // Update counter
        const resultsCounter = document.getElementById('courseResults');
        if (resultsCounter) {
            resultsCounter.textContent = `${visibleCount} course${visibleCount !== 1 ? 's' : ''} found`;
        }
    }

    // Add event listeners
    courseFilter.addEventListener('change', function() {
        console.log('Filter changed:', this.value); // Debug log
        filterCourses();
    });

    if (courseSearch) {
        courseSearch.addEventListener('input', function() {
            console.log('Search input:', this.value); // Debug log
            filterCourses();
        });
    }

    // Initial filter
    filterCourses();
    console.log('Course filters initialized'); // Debug log
}

// Make sure to call the initialization when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing course filters...'); // Debug log
    initializeCourseFilters();
});

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded'); // Debug log
    try {
        initializeTheme();
        initializeTabs();
        initializeChecklists();
        initializeSearch();
        initializeFAQ();
        initializeMobileNav();
        initializeCourseFilters();
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});