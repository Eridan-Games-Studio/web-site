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

    // Initialize poll results display
    displayPollResults();

    // Setup form submission and selection
    setupFormHandler();
});

// Poll Results Tracking System
const POLL_STORAGE_KEY = 'eridanWorldPollResults';
const VOTED_KEY = 'eridanWorldPollVoted';

// Ranked selection state
let selectedWorlds = []; // Array to track selection order [world1, world2, world3]

// Get poll results from localStorage
function getPollResults() {
    const stored = localStorage.getItem(POLL_STORAGE_KEY);
    if (stored) {
        try {
            const parsed = JSON.parse(stored);

            // Validate the structure
            if (typeof parsed === 'object' && parsed !== null) {
                const validWorlds = ['atomic-horizon', 'haven', 'rule-of-rika'];
                const validated = {};

                validWorlds.forEach(world => {
                    const worldData = parsed[world];
                    if (worldData && typeof worldData === 'object') {
                        validated[world] = {
                            first: (typeof worldData.first === 'number' && worldData.first >= 0) ? worldData.first : 0,
                            second: (typeof worldData.second === 'number' && worldData.second >= 0) ? worldData.second : 0,
                            third: (typeof worldData.third === 'number' && worldData.third >= 0) ? worldData.third : 0
                        };
                    } else {
                        validated[world] = { first: 0, second: 0, third: 0 };
                    }
                });

                return validated;
            }
        } catch (e) {
            console.error('Error parsing poll results:', e);
            localStorage.removeItem(POLL_STORAGE_KEY);
        }
    }

    // Initialize with default structure
    return {
        'atomic-horizon': { first: 0, second: 0, third: 0 },
        'haven': { first: 0, second: 0, third: 0 },
        'rule-of-rika': { first: 0, second: 0, third: 0 }
    };
}

// Save poll results to localStorage
function savePollResults(results) {
    try {
        const validWorlds = ['atomic-horizon', 'haven', 'rule-of-rika'];
        const validated = {};

        validWorlds.forEach(world => {
            const worldData = results[world];
            if (worldData && typeof worldData === 'object') {
                validated[world] = {
                    first: (typeof worldData.first === 'number' && worldData.first >= 0) ? worldData.first : 0,
                    second: (typeof worldData.second === 'number' && worldData.second >= 0) ? worldData.second : 0,
                    third: (typeof worldData.third === 'number' && worldData.third >= 0) ? worldData.third : 0
                };
            } else {
                validated[world] = { first: 0, second: 0, third: 0 };
            }
        });

        localStorage.setItem(POLL_STORAGE_KEY, JSON.stringify(validated));
    } catch (e) {
        console.error('Error saving poll results:', e);
    }
}

// Check if user has already voted
function hasVoted() {
    return localStorage.getItem(VOTED_KEY) === 'true';
}

// Mark user as having voted
function markAsVoted() {
    localStorage.setItem(VOTED_KEY, 'true');
}

// Record votes for selected worlds
function recordVotes(selections) {
    const results = getPollResults();

    // selections is an array like ['haven', 'atomic-horizon', 'rule-of-rika']
    // Index 0 = 1st choice, Index 1 = 2nd choice, Index 2 = 3rd choice

    const validWorlds = ['atomic-horizon', 'haven', 'rule-of-rika'];

    if (selections[0] && validWorlds.includes(selections[0])) {
        results[selections[0]].first++;
    }

    if (selections[1] && validWorlds.includes(selections[1])) {
        results[selections[1]].second++;
    }

    if (selections[2] && validWorlds.includes(selections[2])) {
        results[selections[2]].third++;
    }

    savePollResults(results);
    markAsVoted();
}

// Display poll results in the table
function displayPollResults() {
    const results = getPollResults();
    const tbody = document.getElementById('poll-results-body');

    if (!tbody) return;

    // Calculate total points (3 points for 1st, 2 for 2nd, 1 for 3rd)
    const validWorlds = ['atomic-horizon', 'haven', 'rule-of-rika'];
    const worldNames = {
        'atomic-horizon': 'Atomic Horizon',
        'haven': 'H.A.V.E.N',
        'rule-of-rika': 'Rule of Rika'
    };

    const worldStats = validWorlds.map(world => {
        const data = results[world];
        const points = (data.first * 3) + (data.second * 2) + (data.third * 1);
        return {
            world,
            name: worldNames[world],
            first: data.first,
            second: data.second,
            third: data.third,
            points
        };
    });

    // Sort by points (descending)
    worldStats.sort((a, b) => b.points - a.points);

    // Clear existing content
    tbody.innerHTML = '';

    const totalVotes = worldStats.reduce((sum, w) => sum + w.first + w.second + w.third, 0);

    if (totalVotes === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 5;
        cell.className = 'loading';
        cell.textContent = 'No votes recorded yet. Be the first to vote!';
        row.appendChild(cell);
        tbody.appendChild(row);
    } else {
        worldStats.forEach(stat => {
            const row = document.createElement('tr');

            // World name cell
            const nameCell = document.createElement('td');
            nameCell.className = 'world-name';
            nameCell.textContent = stat.name;
            row.appendChild(nameCell);

            // 1st choice cell
            const firstCell = document.createElement('td');
            firstCell.className = 'rank-count first-choice';
            firstCell.textContent = stat.first;
            row.appendChild(firstCell);

            // 2nd choice cell
            const secondCell = document.createElement('td');
            secondCell.className = 'rank-count second-choice';
            secondCell.textContent = stat.second;
            row.appendChild(secondCell);

            // 3rd choice cell
            const thirdCell = document.createElement('td');
            thirdCell.className = 'rank-count third-choice';
            thirdCell.textContent = stat.third;
            row.appendChild(thirdCell);

            // Total points cell
            const pointsCell = document.createElement('td');
            pointsCell.className = 'total-points';
            pointsCell.textContent = stat.points;
            row.appendChild(pointsCell);

            tbody.appendChild(row);
        });
    }
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

        // Record the votes
        recordVotes(selectedWorlds);

        // Update poll results display
        displayPollResults();

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
