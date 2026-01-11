// Mobile navigation toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;

    // Toggle mobile menu
    function toggleMobileMenu() {
        if (mobileMenuToggle && navLinks) {
            mobileMenuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            body.classList.toggle('menu-open');
        }
    }

    // Handle toggle button click
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMobileMenu();
        });
    }

    // Close menu when clicking on a nav link
    const navLinksItems = document.querySelectorAll('.nav-links a');
    navLinksItems.forEach(link => {
        link.addEventListener('click', function() {
            if (navLinks && navLinks.classList.contains('active')) {
                toggleMobileMenu();
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (navLinks && navLinks.classList.contains('active') &&
            !navLinks.contains(e.target) &&
            mobileMenuToggle && !mobileMenuToggle.contains(e.target)) {
            toggleMobileMenu();
        }
    });

    // Setup form submission and selection
    setupFormHandler();
});

// Vote tracking system
const VOTED_KEY = 'eridanWorldPollVoted';

// Ranked selection state
let selectedWorlds = []; // Array to track selection order [world1, world2, world3]

// Check if user has already voted
function hasVoted() {
    return localStorage.getItem(VOTED_KEY) === 'true';
}

// Mark user as having voted
function markAsVoted() {
    localStorage.setItem(VOTED_KEY, 'true');
}

// Setup form submission and world selection handler
function setupFormHandler() {
    const form = document.getElementById('world-poll-form');
    const resultsDiv = document.getElementById('results');
    const worldOptions = document.querySelectorAll('.world-option');

    if (!form) return;

    // Check if user has already voted
    if (hasVoted()) {
        form.style.display = 'none';
        if (resultsDiv) {
            resultsDiv.classList.remove('hidden');
            const thankYouMessage = resultsDiv.querySelector('.thank-you-message');
            if (thankYouMessage) {
                thankYouMessage.textContent = 'You have already voted. Thank you for your participation!';
            }
        }
        return;
    }

    // Handle world selection clicks
    worldOptions.forEach(option => {
        option.addEventListener('click', function() {
            const world = this.getAttribute('data-world');

            // Check if already selected
            const currentIndex = selectedWorlds.indexOf(world);

            if (currentIndex !== -1) {
                // Already selected - remove it
                selectedWorlds.splice(currentIndex, 1);
            } else if (selectedWorlds.length < 3) {
                // Not selected and we have room - add it
                selectedWorlds.push(world);
            } else {
                // Already have 3 selections - do nothing (or could remove oldest)
                return;
            }

            // Update visual state
            updateSelectionDisplay();
        });
    });

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Check if at least one world is selected
        if (selectedWorlds.length === 0) {
            alert('Please select at least one world before submitting.');
            return;
        }

        // Check again if already voted (in case of race conditions)
        if (hasVoted()) {
            alert('You have already voted!');
            return;
        }

        // Mark as voted
        markAsVoted();

        // Hide form, show results
        form.style.display = 'none';
        if (resultsDiv) {
            resultsDiv.classList.remove('hidden');
            resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
}

// Update visual display of selections
function updateSelectionDisplay() {
    const worldOptions = document.querySelectorAll('.world-option');

    worldOptions.forEach(option => {
        const world = option.getAttribute('data-world');
        const rank = selectedWorlds.indexOf(world);

        // Remove all rank classes
        option.classList.remove('ranked-1', 'ranked-2', 'ranked-3');

        // Add appropriate rank class
        if (rank === 0) {
            option.classList.add('ranked-1');
        } else if (rank === 1) {
            option.classList.add('ranked-2');
        } else if (rank === 2) {
            option.classList.add('ranked-3');
        }
    });
}
