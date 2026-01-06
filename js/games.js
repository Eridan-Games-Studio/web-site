// Games page functionality

document.addEventListener('DOMContentLoaded', function() {
    loadGames();
});

async function loadGames() {
    try {
        const gamesUrl = await window.domainConfig.getContentUrl('games.json');
        const response = await fetch(gamesUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const games = await response.json();
        
        // Sort games by distributionOrder
        games.sort((a, b) => a.distributionOrder - b.distributionOrder);
        
        populateGamesGrid(games);
    } catch (error) {
        // Fallback: show error message or placeholder content
        const gamesGrid = document.getElementById('games-grid');
        if (gamesGrid) {
            gamesGrid.innerHTML = '<p>Unable to load games. Please try again later.</p>';
        }
    }
}

function populateGamesGrid(games) {
    const gamesGrid = document.getElementById('games-grid');
    const template = document.getElementById('game-card-template-games');
    
    games.forEach(game => {
        const gameCard = template.content.cloneNode(true);
        
        // Set image
        const img = gameCard.querySelector('.game-card-image img');
        img.src = `content/images/${game.image}`;
        img.alt = game.title;
        
        // Set status badge
        const statusBadge = gameCard.querySelector('.status-badge');
        statusBadge.textContent = game.status;
        
        // Set title
        gameCard.querySelector('h3').textContent = game.title;
        
        // Set description (sanitized to prevent XSS)
        gameCard.querySelector('p').innerHTML = window.SecurityUtils.sanitizeRichText(game.shortDescription);
        
        // Set platforms
        const platformsContainer = gameCard.querySelector('.game-platforms');
        game.platforms.forEach(platform => {
            const platformSpan = document.createElement('span');
            platformSpan.textContent = platform;
            platformSpan.className = 'platform-tag';
            platformsContainer.appendChild(platformSpan);
        });
        
        // Set tags
        const tagsContainer = gameCard.querySelector('.game-tags');
        game.genre.forEach(tag => {
            const tagSpan = document.createElement('span');
            tagSpan.textContent = tag;
            tagSpan.className = 'tag';
            tagsContainer.appendChild(tagSpan);
        });
        
        // Set game card link to individual game page
        const gameCardElement = gameCard.querySelector('.game-card-games');
        gameCardElement.addEventListener('click', () => {
            window.location.href = `game.html?game=${game.slug}`;
        });
        
        gamesGrid.appendChild(gameCard);
    });
}
