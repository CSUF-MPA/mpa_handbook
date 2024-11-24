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
// Tab Switching
function switchTab(tabId, clickedTab) {
    console.log('Switching to tab:', tabId); // Debug line
    
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

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tabs
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

    // Other initializations...
    initializeTheme();
    initializeSearch();
    initializeChecklists();
});

// Checklist and Progress Bar Functionality
function initializeChecklists() {
    document.querySelectorAll('.checklist-section').forEach(section => {
        const checkboxes = section.querySelectorAll('input[type="checkbox"]');
        
        // Load saved state for each checkbox
        checkboxes.forEach(checkbox => {
            const saved = localStorage.getItem(checkbox.id);
            if (saved === 'true') {
                checkbox.checked = true;
            }

            // Add change listener
            checkbox.addEventListener('change', function() {
                // Save state
                localStorage.setItem(this.id, this.checked);
                // Update progress bar
                updateProgress(section);
            });
        });

        // Initialize progress bar
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

// FAQ Functionality
function toggleFAQ(button) {
    // Toggle active class on button
    button.classList.toggle('active');
    
    // Toggle answer visibility
    const answer = button.nextElementSibling;
    answer.classList.toggle('active');
}

// FAQ Search Functionality
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

// Add to your DOM loaded event listener
document.addEventListener('DOMContentLoaded', function() {
    initializeFAQSearch();
});

// Search and Filter Functionality
function initializeSearch() {
    // Course search
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

    // Faculty search
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

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeSearch();
});