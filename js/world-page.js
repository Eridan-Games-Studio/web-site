// ===== WORLD PAGE FUNCTIONALITY =====
(function() {
    'use strict';
    
    // Local constants to avoid conflicts

// Get URL parameters with validation
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    const param = urlParams.get(name);

    // Validate the parameter
    return window.SecurityUtils.validateUrlParameter(param);
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
    
    // Set description - sanitize HTML content and convert newlines to breaks
    worldDescription.innerHTML = window.SecurityUtils.sanitizeTextWithBreaks(world.description);
    
    // Set wiki link if available
    if (world.wiki_url) {
        wikiLink.href = world.wiki_url;
        wikiLink.target = '_blank';
        wikiLink.textContent = '📖 Dive Deeper into the Wiki';
        wikiLink.style.display = 'inline-block';
    } else {
        wikiLink.href = 'https://eridan-games-studio.github.io/eridan-wiki/#/';
        wikiLink.target = '_blank';
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
        
        const featureTitle = document.createElement('h3');
        featureTitle.className = 'feature-title';
        featureTitle.textContent = feature.title;

        const featureText = document.createElement('p');
        featureText.innerHTML = window.SecurityUtils.sanitizeRichText(feature.text);

        const featureDescription = document.createElement('div');
        featureDescription.className = 'feature-description';
        featureDescription.appendChild(featureText);

        const featureContent = document.createElement('div');
        featureContent.className = 'feature-content';
        featureContent.appendChild(featureTitle);
        featureContent.appendChild(featureDescription);

        slide.appendChild(featureContent);
        
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
        worldGamesGrid.innerHTML = '<p>Unable to load games information.</p>';
    }
}

// Create a game card element
function createGameCard(game) {
    const gameCard = document.createElement('div');
    gameCard.className = 'game-card';

    const imagePath = game.image.startsWith('/') ? game.image : `content/images/${game.image}`;

    // Create image section
    const imageDiv = document.createElement('div');
    imageDiv.className = 'game-card-image';

    const img = document.createElement('img');
    img.src = imagePath;
    img.alt = game.title;

    const statusBadge = document.createElement('div');
    statusBadge.className = 'status-badge';
    statusBadge.textContent = game.status || 'In Development';

    imageDiv.appendChild(img);
    imageDiv.appendChild(statusBadge);

    // Create content section
    const contentDiv = document.createElement('div');
    contentDiv.className = 'game-card-content';

    const title = document.createElement('h3');
    title.textContent = game.title;

    const description = document.createElement('p');
    description.innerHTML = window.SecurityUtils.sanitizeRichText(game.description);

    contentDiv.appendChild(title);
    contentDiv.appendChild(description);

    // Create footer section
    const footerDiv = document.createElement('div');
    footerDiv.className = 'game-card-footer';

    const link = document.createElement('a');
    link.href = `game.html?game=${game.slug}`;
    link.className = 'game-card-cta';
    link.textContent = 'Learn More →';

    footerDiv.appendChild(link);

    // Assemble card
    gameCard.appendChild(imageDiv);
    gameCard.appendChild(contentDiv);
    gameCard.appendChild(footerDiv);

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
    worldDescription.innerHTML = window.SecurityUtils.sanitizeRichText(message, ['a', 'br']);
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
    const prevBtn = document.querySelector('.carousel-controls .btn-prev .carousel-btn');
    const nextBtn = document.querySelector('.carousel-controls .btn-next .carousel-btn');
    const carousel = document.querySelector('.features-carousel');
    
    let currentIndex = 0;
    const totalSlides = slides.length;
    
    if (totalSlides === 0) return;
    
    // Remove existing event listeners to prevent duplicates
    prevBtn.replaceWith(prevBtn.cloneNode(true));
    nextBtn.replaceWith(nextBtn.cloneNode(true));
    
    // Get fresh references after cloning
    const newPrevBtn = document.querySelector('.carousel-controls .btn-prev .carousel-btn');
    const newNextBtn = document.querySelector('.carousel-controls .btn-next .carousel-btn');
    
    
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
