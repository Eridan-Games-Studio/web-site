// ===== CAROUSEL =====
// Carousel images data (embedded to avoid CORS issues when opening file directly)
const CAROUSEL_IMAGES = [
    'rika-akvira-maro-1.png',
    'rika-dindra-zemlja.png',
    'rika-zohar-zohar1.png',
    'rika-liguni-zeleni.png'
];

let track, slides, nextBtn, prevBtn, indicators;
let currentSlide = 0;
let totalSlides = 0;
let autoplayInterval;

// Load carousel images (now using embedded data)
function loadCarouselImages() {
    try {
        populateCarousel(CAROUSEL_IMAGES);
    } catch (error) {
        console.error('Error loading carousel images:', error);
        // Fallback: use default images
        const fallbackImages = [
            'https://eridangames.com/Maro1.png',
            'https://eridangames.com/Liguni.Zelen.png',
            'https://eridangames.com/Dindra.Zemlja.png'
        ];
        populateCarousel(fallbackImages);
    }
}

// Populate carousel with images
function populateCarousel(images) {
    track = document.getElementById('carousel-track');
    const indicatorsContainer = document.getElementById('carousel-indicators');
    
    // Check if carousel elements exist (only on index page)
    if (!track || !indicatorsContainer) {
        return;
    }
    
    // Clear existing content
    track.innerHTML = '';
    indicatorsContainer.innerHTML = '';
    
    // Create slides
    images.forEach((imageSrc, index) => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        
        const img = document.createElement('img');
        // Check if it's a local image or external URL
        if (imageSrc.startsWith('http')) {
            img.src = imageSrc;
        } else {
            img.src = `content/images/${imageSrc}`;
        }
        img.alt = `Carousel Image ${index + 1}`;
        
        slide.appendChild(img);
        track.appendChild(slide);
        
        // Create indicator
        const indicator = document.createElement('span');
        indicator.className = 'carousel-indicator';
        if (index === 0) indicator.classList.add('active');
        indicator.setAttribute('data-slide', index);
        indicatorsContainer.appendChild(indicator);
    });
    
    // Re-initialize carousel elements
    slides = Array.from(track.children);
    nextBtn = document.querySelector('.carousel-btn.next');
    prevBtn = document.querySelector('.carousel-btn.prev');
    indicators = Array.from(document.querySelectorAll('.carousel-indicator'));
    totalSlides = slides.length;
    
    // Set up event listeners
    setupCarouselEvents();
    
    // Initialize carousel
    updateCarousel(0);
    startAutoplay();
}

function updateCarousel(index) {
    slides.forEach((slide, i) => {
        // Remove all position classes
        slide.classList.remove('active', 'prev', 'next', 'hidden');
        
        // Calculate position relative to current slide
        const position = (i - index + totalSlides) % totalSlides;
        
        if (position === 0) {
            slide.classList.add('active');
        } else if (position === totalSlides - 1) {
            slide.classList.add('prev');
        } else if (position === 1) {
            slide.classList.add('next');
        } else {
            slide.classList.add('hidden');
        }
    });
    
    // Update indicators
    indicators.forEach((indicator, i) => {
        indicator.classList.toggle('active', i === index);
    });
    
    currentSlide = index;
}

function nextSlide() {
    const next = (currentSlide + 1) % totalSlides;
    updateCarousel(next);
}

function prevSlide() {
    const prev = (currentSlide - 1 + totalSlides) % totalSlides;
    updateCarousel(prev);
}

function setupCarouselEvents() {
    // Button controls
    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoplay();
    });

    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoplay();
    });

    // Click on side slides to navigate
    slides.forEach((slide, index) => {
        slide.addEventListener('click', () => {
            if (!slide.classList.contains('active')) {
                updateCarousel(index);
                resetAutoplay();
            }
        });
    });

    // Indicator controls
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            updateCarousel(index);
            resetAutoplay();
        });
    });
}

// Autoplay
function startAutoplay() {
    autoplayInterval = setInterval(nextSlide, 5000);
}

function resetAutoplay() {
    clearInterval(autoplayInterval);
    startAutoplay();
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        prevSlide();
        resetAutoplay();
    } else if (e.key === 'ArrowRight') {
        nextSlide();
        resetAutoplay();
    }
});

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadCarouselImages();
});

// ===== GAMES GALLERY =====
const gamesGallery = document.getElementById('games-gallery');
const gameCardTemplate = document.getElementById('game-card-template');

// Fetch games data and populate gallery
async function loadGames() {
    try {
        const gamesUrl = await window.domainConfig.getContentUrl('games.json');
        const response = await fetch(gamesUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const games = await response.json();
        populateGamesGallery(games);
    } catch (error) {
        console.error('Error loading games:', error);
        // Fallback: show error message or placeholder content
        if (gamesGallery) {
            gamesGallery.innerHTML = '<p>Unable to load games. Please try again later.</p>';
        }
    }
}

// Populate the games gallery with data from JSON
function populateGamesGallery(games) {
    // Check if games gallery exists (only on index page)
    if (!gamesGallery) {
        return;
    }
    
    // Clear existing content
    gamesGallery.innerHTML = '';
    
    // Sort games by distribution order
    const sortedGames = sortGamesByDistributionOrder(games);
    
    sortedGames.forEach(game => {
        const gameCard = createGameCard(game);
        gamesGallery.appendChild(gameCard);
    });
}

// Sort games by distribution order
function sortGamesByDistributionOrder(games) {
    return games.sort((a, b) => {
        const orderA = a.distributionOrder || 999; // Games without order go last
        const orderB = b.distributionOrder || 999;
        
        // Sort by distribution order
        return orderA - orderB;
    });
}

// Create a game card element from game data
function createGameCard(game) {
    // Clone the template
    const gameCard = gameCardTemplate.content.cloneNode(true);
    
    // Get elements from the cloned template
    const cardElement = gameCard.querySelector('.game-card-games');
    const cardImage = gameCard.querySelector('.game-card-image img');
    const statusBadge = gameCard.querySelector('.status-badge');
    const cardTitle = gameCard.querySelector('.game-card-content h3');
    const cardDescription = gameCard.querySelector('.game-card-content p');
    const platformsContainer = gameCard.querySelector('.game-platforms');
    const tagsContainer = gameCard.querySelector('.game-tags');
    
    // Set image source and alt text
    const imagePath = game.image.startsWith('/') ? game.image : `content/images/${game.image}`;
    cardImage.src = imagePath;
    cardImage.alt = game.title;
    
    // Set status badge
    statusBadge.textContent = game.status;
    
    // Set title and description
    cardTitle.textContent = game.title;
    cardDescription.innerHTML = game.shortDescription;
    
    // Set platforms
    platformsContainer.innerHTML = '';
    if (game.platforms && Array.isArray(game.platforms)) {
        game.platforms.forEach(platform => {
            const platformSpan = document.createElement('span');
            platformSpan.textContent = platform;
            platformSpan.className = 'platform-tag';
            platformsContainer.appendChild(platformSpan);
        });
    }
    
    // Create and add genre tags
    tagsContainer.innerHTML = '';
    if (game.genre && Array.isArray(game.genre)) {
        game.genre.slice(0, 3).forEach(genre => { // Limit to 3 tags for display
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.textContent = genre;
            tagsContainer.appendChild(tag);
        });
    }
    
    // Set game card click handler to individual game page
    cardElement.addEventListener('click', () => {
        window.location.href = `game.html?game=${game.slug}`;
    });
    
    return gameCard;
}


// Initialize games gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', loadGames);

// ===== WORLDS GALLERY =====
const worldsGrid = document.getElementById('worlds-grid');
const worldCardTemplate = document.getElementById('world-card-template');

// Fetch worlds data and populate gallery
async function loadWorlds() {
    try {
        const worldsUrl = await window.domainConfig.getContentUrl('worlds.json');
        const response = await fetch(worldsUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const worlds = await response.json();
        populateWorldsGrid(worlds);
    } catch (error) {
        console.error('Error loading worlds:', error);
        // Fallback: show error message or placeholder content
        if (worldsGrid) {
            worldsGrid.innerHTML = '<p>Unable to load worlds. Please try again later.</p>';
        }
    }
}

// Populate the worlds grid with data from JSON
function populateWorldsGrid(worlds) {
    // Check if worlds grid exists (only on index page)
    if (!worldsGrid) {
        return;
    }
    
    // Clear existing content
    worldsGrid.innerHTML = '';
    
    // Sort worlds alphabetically by name
    const sortedWorlds = sortWorldsByName(worlds);
    
    sortedWorlds.forEach(world => {
        const worldCard = createWorldCard(world);
        worldsGrid.appendChild(worldCard);
    });
}

// Sort worlds by world priority, then alphabetically by name within each world
function sortWorldsByName(worlds) {
    const worldPriority = {
        'the-age-of-rika': 1,
        'haven-world': 2,
        'atomic-horizon': 3
    };
    
    return worlds.sort((a, b) => {
        const priorityA = worldPriority[a.id] || 999; // Unknown worlds go last
        const priorityB = worldPriority[b.id] || 999;
        
        // First sort by world priority
        if (priorityA !== priorityB) {
            return priorityA - priorityB;
        }
        
        // If same world priority, sort alphabetically by name
        return a.name.localeCompare(b.name);
    });
}

// Create a world card element from world data
function createWorldCard(world) {
    // Determine which template to use based on current page
    const isWorldsPage = window.location.pathname.includes('worlds.html');
    const template = isWorldsPage ? 
        document.getElementById('world-card-template-worlds') : 
        worldCardTemplate;
    
    // Clone the template
    const worldCard = template.content.cloneNode(true);
    
    // Get elements from the cloned template
    const cardImage = worldCard.querySelector('.world-card-image img');
    const cardTitle = worldCard.querySelector('.world-card-content h3');
    const cardDescription = worldCard.querySelector('.world-card-content p');
    const cardFooter = worldCard.querySelector('.world-card-footer');
    const cardLink = worldCard.querySelector('.world-card');
    
    // Set image source and alt text
    const imagePath = world.image.startsWith('/') ? world.image : `content/images/${world.image}`;
    cardImage.src = imagePath;
    cardImage.alt = world.name;
    
    // Set title
    cardTitle.textContent = world.name;
    
    // Set description (use tagline if available, otherwise fall back to description)
    // Convert newlines to breaks and use innerHTML to render HTML content
    const descriptionText = world.tagline || world.description;
    cardDescription.innerHTML = descriptionText.replace(/\n/g, '<br>');
    
    // Handle games count for index page or games grid for worlds page
    if (isWorldsPage) {
        const gamesGrid = worldCard.querySelector('.world-games-grid');
        if (gamesGrid) {
            // Populate games grid asynchronously
            populateWorldGamesGrid(gamesGrid, world.games || []);
        }
    } else {
        const gamesCount = worldCard.querySelector('.games-count');
        if (gamesCount) {
            const gameCount = world.games ? world.games.length : 0;
            gamesCount.textContent = `🎮 ${gameCount} game${gameCount !== 1 ? 's' : ''}`;
        }
    }
    
    // Set card link to world.html with world slug parameter (only for index page)
    if (!isWorldsPage && cardLink) {
        cardLink.href = `world.html?world=${world.slug}`;
    } else if (cardFooter) {
        // For worlds page, keep the footer onclick behavior
        cardFooter.onclick = () => {
            window.location.href = `world.html?world=${world.slug}`;
        };
    }

    return worldCard;
}

// Populate games grid within a world card
async function populateWorldGamesGrid(gamesGrid, gameIds) {
    // Clear existing content
    gamesGrid.innerHTML = '';
    
    if (!gameIds || gameIds.length === 0) {
        return;
    }
    
    try {
        // Load games data to get full game information
        const games = await loadGamesData();
        
        // Filter games that belong to this world
        const worldGames = games.filter(game => gameIds.includes(game.id));
        
        // Sort games by distribution order
        worldGames.sort((a, b) => (a.distributionOrder || 999) - (b.distributionOrder || 999));
        
        // Create game items
        worldGames.forEach(game => {
            const gameItem = document.createElement('div');
            gameItem.className = 'world-game-item';
            
            const gameImage = document.createElement('div');
            gameImage.className = 'world-game-image';
            
            const img = document.createElement('img');
            const imagePath = game.image.startsWith('/') ? game.image : `content/images/${game.image}`;
            img.src = imagePath;
            img.alt = game.title;
            
            const gameTitle = document.createElement('div');
            gameTitle.className = 'world-game-title';
            gameTitle.textContent = game.title;
            
            gameImage.appendChild(img);
            gameItem.appendChild(gameImage);
            gameItem.appendChild(gameTitle);
            
            gamesGrid.appendChild(gameItem);
        });
    } catch (error) {
        console.error('Error loading games data for world:', error);
    }
}

// Load games data from JSON
async function loadGamesData() {
    try {
        const gamesUrl = await window.domainConfig.getContentUrl('games.json');
        const response = await fetch(gamesUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading games data:', error);
        return [];
    }
}

// Initialize worlds grid when DOM is loaded
document.addEventListener('DOMContentLoaded', loadWorlds);
