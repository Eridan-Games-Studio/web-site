// ===== GAME PAGE FUNCTIONALITY =====
(function() {
    'use strict';
    
    // Local constants to avoid conflicts

// Get URL parameters
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Load game data from JSON
async function loadGameData() {
    const gameSlug = getUrlParameter('game');
    
    if (!gameSlug) {
        showError('No game specified. Please select a game from the <a href="games.html">games page</a>.');
        return;
    }
    
    try {
        const gamesUrl = await window.domainConfig.getContentUrl('games.json');
        const response = await fetch(gamesUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const games = await response.json();
        
        // Find the game with matching slug
        const game = games.find(g => g.slug === gameSlug);
        
        if (!game) {
            showError(`Game "${gameSlug}" not found. Please check the URL or visit the <a href="games.html">games page</a>.`);
            return;
        }
        
        populateGamePage(game);
        
    } catch (error) {
        console.error('Error loading game data:', error);
        showError('Unable to load game data. Please try again later.');
    }
}

// Populate the game page with data
async function populateGamePage(game) {
    // Update page title
    document.getElementById('page-title').textContent = `${game.title} - Eridan Games`;
    
    // Update hero section
    const gameBannerImage = document.getElementById('game-banner-image');
    const gameDescription = document.getElementById('game-description');
    
    // Set banner image
    const imagePath = game.image.startsWith('/') ? game.image : `content/images/${game.image}`;
    gameBannerImage.src = imagePath;
    gameBannerImage.alt = game.title;
    
    // Set description - use innerHTML to render any HTML content and convert newlines to breaks
    gameDescription.innerHTML = game.description.replace(/\n/g, '<br>');
    
    // Only update wiki link if there's an actual URL
    const gameWikiLink = document.getElementById('game-wiki-link');
    if (game.wiki_url) {
        gameWikiLink.href = game.wiki_url;
        gameWikiLink.target = '_blank';
    } else {
        gameWikiLink.href = 'https://eridan-games-studio.github.io/eridan-wiki/#/';
        gameWikiLink.target = '_blank';
    }
    
    // Populate screenshots
    populateGameScreenshots(game.gallery || []);
    
    // Populate game details
    populateGameDetails(game);
    
}

// Populate game screenshots
function populateGameScreenshots(gallery) {
    const screenshotsGrid = document.getElementById('screenshots-grid');
    const screenshotsCard = screenshotsGrid.closest('.screenshots-card');

    // Clear existing content
    screenshotsGrid.innerHTML = '';

    // If no gallery exists or is empty, hide the entire screenshots section
    if (!gallery || gallery.length === 0) {
        if (screenshotsCard) {
            screenshotsCard.style.display = 'none';
        }
        return;
    }

    // Show the screenshots section if it was hidden
    if (screenshotsCard) {
        screenshotsCard.style.display = '';
    }

    // If all images are placeholders, show placeholder screenshots
    if (gallery.every(img => img.includes('placeholder.svg'))) {
        for (let i = 0; i < 3; i++) {
            const screenshot = document.createElement('img');
            screenshot.src = 'content/images/placeholder.svg';
            screenshot.alt = `Screenshot placeholder ${i + 1}`;

            screenshotsGrid.appendChild(screenshot);
        }
        return;
    }

    // Create screenshot images
    gallery.forEach((imagePath, index) => {
        const screenshot = document.createElement('img');

        const fullImagePath = `content/images/${imagePath}`;

        screenshot.src = fullImagePath;
        screenshot.alt = `Game screenshot ${index + 1}`;

        screenshotsGrid.appendChild(screenshot);
    });
}


// Populate game details section
function populateGameDetails(game) {
    // Populate features list
    const featuresList = document.getElementById('features-list');
    if (game.features && game.features.length > 0) {
        featuresList.innerHTML = game.features.map(feature => `<li>${feature}</li>`).join('');
    } else {
        featuresList.innerHTML = '<li>No features listed</li>';
    }
    
    // Populate mechanics list
    const mechanicsList = document.getElementById('mechanics-list');
    if (game.mechanics && game.mechanics.length > 0) {
        mechanicsList.innerHTML = game.mechanics.map(mechanic => `<li>${mechanic}</li>`).join('');
    } else {
        mechanicsList.innerHTML = '<li>No mechanics listed</li>';
    }
    
    // Populate game info content
    const gameInfoContent = document.getElementById('game-info-content');
    const gameInfoHTML = `
        <div class="info-section">
            <h3>Genre</h3>
            <div class="tags-list">
                ${game.genre.map(genre => `<span class="tag">${genre}</span>`).join('')}
            </div>
        </div>
        
        <div class="info-section">
            <h3>Platforms</h3>
            <div class="platforms-list">
                ${game.platforms.map(platform => `<span class="platform-tag">${platform}</span>`).join('')}
            </div>
        </div>
        
        <div class="info-section">
            <h3>Release Date</h3>
            <p>${game.releaseDate}</p>
        </div>
    `;
    gameInfoContent.innerHTML = gameInfoHTML;
    
    // Populate synopsis - use innerHTML to parse HTML content
    const gameSynopsis = document.getElementById('game-synopsis');
    if (game.synopsis) {
        gameSynopsis.innerHTML = game.synopsis;
    } else {
        gameSynopsis.innerHTML = 'No synopsis available.';
    }
    
    // Populate developers
    const developersList = document.getElementById('developers-list');
    if (game.developers && Object.keys(game.developers).length > 0) {
        developersList.innerHTML = Object.entries(game.developers).map(([role, name]) => 
            `<div class="developer-row">
                <span class="developer-role">${role.replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase())}</span>
                <span class="developer-name">${name}</span>
            </div>`
        ).join('');
    } else {
        developersList.innerHTML = '<div class="developer-row"><span class="developer-role">No developer information available</span></div>';
    }
    
    // Populate world section
    populateWorldSection(game);
}

// Populate world section
async function populateWorldSection(game) {
    if (!game.world) {
        document.querySelector('.world-section-card').style.display = 'none';
        return;
    }
    
    try {
        // Load worlds data
        const worldsUrl = await window.domainConfig.getContentUrl('worlds.json');
        const response = await fetch(worldsUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const worlds = await response.json();
        
        // Find the world
        const world = worlds.find(w => w.id === game.world);
        if (!world) {
            document.querySelector('.world-section-card').style.display = 'none';
            return;
        }
        
        // Update world section title
        document.getElementById('world-section-title').textContent = `Part of ${world.name}`;
        
        // Set world image
        const worldImage = document.getElementById('world-section-image');
        const imagePath = world.image.startsWith('/') ? world.image : `content/images/${world.image}`;
        worldImage.src = imagePath;
        worldImage.alt = world.title;
        
        // Set world description
        const worldDescription = document.getElementById('world-description');
        worldDescription.innerHTML = world.description.replace(/\n/g, '<br>');
        
        // Set explore link
        const exploreLink = document.getElementById('world-explore-link');
        exploreLink.href = `world.html?world=${world.slug}`;
        exploreLink.textContent = `Explore ${world.name}`;
        
        // Update "More from" heading
        document.querySelector('.other-games h3').textContent = `More from ${world.name}`;
        
        // Find other games in this world
        const gamesUrl = await window.domainConfig.getContentUrl('games.json');
        const gamesResponse = await fetch(gamesUrl);
        if (!gamesResponse.ok) {
            throw new Error(`HTTP error! status: ${gamesResponse.status}`);
        }
        const allGames = await gamesResponse.json();
        
        const otherGames = allGames.filter(g => g.world === game.world && g.slug !== game.slug);
        
        // Populate other games list
        const otherGamesList = document.getElementById('other-games-list');
        if (otherGames.length > 0) {
            const gamesHTML = otherGames.map(otherGame => {
                const gameImagePath = otherGame.image.startsWith('/') ? otherGame.image : `content/images/${otherGame.image}`;
                return `
                    <a href="game.html?game=${otherGame.slug}" class="other-game-item">
                        <div class="other-game-image">
                            <img src="${gameImagePath}" alt="${otherGame.title}">
                        </div>
                        <div class="other-game-content">
                            <div class="other-game-title">${otherGame.title}</div>
                            <div class="other-game-description">${otherGame.shortDescription}</div>
                        </div>
                    </a>
                `;
            }).join('');
            otherGamesList.innerHTML = gamesHTML;
        } else {
            otherGamesList.innerHTML = '<p style="color: var(--text-secondary); font-style: italic;">No other games in this world yet.</p>';
        }
        
    } catch (error) {
        console.error('Error loading world data:', error);
        document.querySelector('.world-section-card').style.display = 'none';
    }
}


// Show error message
function showError(message) {
    const gameHero = document.querySelector('.game-hero');
    const gameDetails = document.querySelector('.game-details');
    
    // Hide other sections
    gameDetails.style.display = 'none';
    
    // Show error in hero section
    const gameDescription = document.getElementById('game-description');
    gameDescription.innerHTML = message;
    gameDescription.style.color = '#ff6b6b';
    gameDescription.style.textAlign = 'center';
    gameDescription.style.padding = '2rem';
    
    // Hide banner image
    document.getElementById('game-banner-image').style.display = 'none';
}

// Load game data when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    loadGameData();
});

})(); // End of IIFE
