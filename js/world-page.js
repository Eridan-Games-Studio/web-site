// ===== WORLD PAGE FUNCTIONALITY =====
(function() {
    'use strict';
    
    // Local constants to avoid conflicts

// Get URL parameters
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Load world data from JSON
async function loadWorldData() {
    const worldSlug = getUrlParameter('world');
    
    if (!worldSlug) {
        showError('No world specified. Please select a world from the <a href="worlds.html">worlds page</a>.');
        return;
    }
    
    try {
        const worldsUrl = await window.domainConfig.getContentUrl('worlds.json');
        const response = await fetch(worldsUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const worlds = await response.json();
        
        // Find the world with matching slug
        const world = worlds.find(w => w.slug === worldSlug);
        
        if (!world) {
            showError(`World "${worldSlug}" not found. Please check the URL or visit the <a href="worlds.html">worlds page</a>.`);
            return;
        }
        
        populateWorldPage(world);
        
    } catch (error) {
        console.error('Error loading world data:', error);
        showError('Unable to load world data. Please try again later.');
    }
}

// Populate the world page with data
async function populateWorldPage(world) {
    // Update page title
    document.getElementById('page-title').textContent = `${world.name} - Eridan Games`;
    
    // Update hero section
    const worldBannerImage = document.getElementById('world-banner-image');
    const worldDescription = document.getElementById('world-description');
    const wikiLink = document.getElementById('wiki-link');
    
    // Set banner image
    const imagePath = world.image.startsWith('/') ? world.image : `content/images/${world.image}`;
    worldBannerImage.src = imagePath;
    worldBannerImage.alt = world.name;
    
    // Set description - use innerHTML to render any HTML content and convert newlines to breaks
    worldDescription.innerHTML = world.description.replace(/\n/g, '<br>');
    
    // Set wiki link if available
    if (world.wiki_url) {
        wikiLink.href = world.wiki_url;
        wikiLink.textContent = '📖 Dive Deeper into the Wiki';
        wikiLink.style.display = 'inline-block';
    } else {
        wikiLink.href = 'https://eridan-games-studio.github.io/eridan-wiki/';
        wikiLink.textContent = '📖 Dive Deeper into the Wiki';
        wikiLink.style.display = 'inline-block';
    }
    
    
    // Update games section
    const worldGamesTitle = document.getElementById('world-games-title');
    
    worldGamesTitle.textContent = `Games in ${world.name}`;
    
    // Load and populate features
    populateWorldFeatures(world.gameplay_pillars || []);
    
    // Load and populate games
    await populateWorldGames(world.games || []);
}

// Populate world features
function populateWorldFeatures(features) {
    const featuresIndicators = document.getElementById('features-indicators');
    const carouselContent = document.getElementById('carousel-content');
    
    // Clear existing content
    featuresIndicators.innerHTML = '';
    carouselContent.innerHTML = '';
    
    if (!features || features.length === 0) {
        // Hide the features section if no features
        document.querySelector('.world-features').style.display = 'none';
        return;
    }
    
    // Show the features section
    document.querySelector('.world-features').style.display = 'block';
    
    // Generate indicators
    features.forEach((feature, index) => {
        const indicator = document.createElement('div');
        indicator.className = 'indicator';
        if (index === 0) {
            indicator.classList.add('active');
        }
        indicator.textContent = index + 1;
        featuresIndicators.appendChild(indicator);
    });
    
    // Generate feature slides
    features.forEach((feature, index) => {
        const slide = document.createElement('div');
        slide.className = 'feature-slide';
        if (index === 0) {
            slide.classList.add('active');
        }
        
        slide.innerHTML = `
            <div class="feature-content">
                <h3 class="feature-title">${feature.title}</h3>
                <div class="feature-description">
                    <p>${feature.text}</p>
                </div>
            </div>
        `;
        
        carouselContent.appendChild(slide);
    });
    
    // Re-initialize carousel after content is loaded
    setTimeout(() => {
        initializeFeaturesCarousel();
    }, 100);
}

// Populate world games
async function populateWorldGames(gameIds) {
    const worldGamesGrid = document.getElementById('world-games-grid');
    
    // Clear existing content
    worldGamesGrid.innerHTML = '';
    
    if (!gameIds || gameIds.length === 0) {
        worldGamesGrid.innerHTML = '<p>No games available for this world yet.</p>';
        return;
    }
    
    try {
        // Load games data
        const gamesUrl = await window.domainConfig.getContentUrl('games.json');
        const response = await fetch(gamesUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const games = await response.json();
        
        // Filter games that belong to this world
        const worldGames = games.filter(game => gameIds.includes(game.id));
        
        // Sort games by distribution order
        worldGames.sort((a, b) => (a.distributionOrder || 999) - (b.distributionOrder || 999));
        
        // Create game cards
        worldGames.forEach(game => {
            const gameCard = createGameCard(game);
            worldGamesGrid.appendChild(gameCard);
        });
        
    } catch (error) {
        console.error('Error loading games data:', error);
        worldGamesGrid.innerHTML = '<p>Unable to load games information.</p>';
    }
}

// Create a game card element
function createGameCard(game) {
    const gameCard = document.createElement('div');
    gameCard.className = 'game-card';
    
    const imagePath = game.image.startsWith('/') ? game.image : `content/images/${game.image}`;
    
    gameCard.innerHTML = `
        <div class="game-card-image">
            <img src="${imagePath}" alt="${game.title}">
            <div class="status-badge">${game.status || 'In Development'}</div>
        </div>
        <div class="game-card-content">
            <h3>${game.title}</h3>
            <p>${game.description}</p>
        </div>
        <div class="game-card-footer">
            <a href="game.html?game=${game.slug}" class="game-card-cta">Learn More →</a>
        </div>
    `;
    
    return gameCard;
}

// Show error message
function showError(message) {
    const worldHero = document.querySelector('.world-hero');
    const worldFeatures = document.querySelector('.world-features');
    const worldGames = document.querySelector('.world-games');
    
    // Hide other sections
    worldFeatures.style.display = 'none';
    worldGames.style.display = 'none';
    
    // Show error in hero section
    const worldDescription = document.getElementById('world-description');
    worldDescription.innerHTML = message;
    worldDescription.style.color = '#ff6b6b';
    worldDescription.style.textAlign = 'center';
    worldDescription.style.padding = '2rem';
    
    // Hide banner image
    document.getElementById('world-banner-image').style.display = 'none';
    document.getElementById('wiki-link').style.display = 'none';
}

// Initialize features carousel functionality
function initializeFeaturesCarousel() {
    const indicators = document.querySelectorAll('.indicator');
    const slides = document.querySelectorAll('.feature-slide');
    const prevBtn = document.querySelector('.btn-prev .carousel-btn');
    const nextBtn = document.querySelector('.btn-next .carousel-btn');
    const carousel = document.querySelector('.features-carousel');
    
    let currentIndex = 0;
    const totalSlides = slides.length;
    
    if (totalSlides === 0) return;
    
    // Remove existing event listeners to prevent duplicates
    prevBtn.replaceWith(prevBtn.cloneNode(true));
    nextBtn.replaceWith(nextBtn.cloneNode(true));
    
    // Get fresh references after cloning
    const newPrevBtn = document.querySelector('.btn-prev .carousel-btn');
    const newNextBtn = document.querySelector('.btn-next .carousel-btn');
    
    // Calculate the height needed for the tallest slide
    function calculateCarouselHeight() {
        let maxHeight = 0;
        
        // Temporarily show all slides to measure their heights
        slides.forEach(slide => {
            slide.style.display = 'block';
            const height = slide.offsetHeight;
            if (height > maxHeight) {
                maxHeight = height;
            }
            slide.style.display = '';
        });
        
        // Set the carousel height to accommodate the tallest slide
        carousel.style.height = maxHeight + 'px';
    }
    
    // Calculate height on load and resize
    calculateCarouselHeight();
    window.addEventListener('resize', calculateCarouselHeight);
    
    // Function to show specific slide
    function showSlide(index) {
        // Remove active class from all slides and indicators
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        
        // Add active class to current slide and indicator
        slides[index].classList.add('active');
        indicators[index].classList.add('active');
        
        currentIndex = index;
    }
    
    // Function to go to next slide
    function nextSlide() {
        const nextIndex = (currentIndex + 1) % totalSlides;
        showSlide(nextIndex);
    }
    
    // Function to go to previous slide
    function prevSlide() {
        const prevIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        showSlide(prevIndex);
    }
    
    // Add event listeners
    newPrevBtn.addEventListener('click', prevSlide);
    newNextBtn.addEventListener('click', nextSlide);
    
    // Add click listeners to indicators
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            showSlide(index);
        });
    });
}

// Load world data when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    loadWorldData();
});

})(); // End of IIFE
