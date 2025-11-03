// Character Sheet Modal Functionality
class CharacterSheetModal {
    constructor() {
        this.modal = null;
        this.isOpen = false;
        this.starfieldCanvas = null;
        this.starfieldCtx = null;
        this.stars = [];
        this.animationFrameId = null;
        this.init();
    }

    init() {
        this.createModal();
        this.bindEvents();
    }

    createModal() {
        // Create modal HTML structure
        const modalHTML = `
            <div class="character-sheet-modal" id="character-sheet-modal">
                <div class="modal-content">
                    <canvas id="modal-starfield" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none;"></canvas>
                    <button class="close-btn" aria-label="Close modal">&times;</button>
                    <div class="character-sheet" data-accent="#7a3b9a" aria-label="Team character sheet: Ava Devlin">
                        <header>
                            <div class="banner" role="group" aria-label="Info banner">
                                <div class="kv-container">
                                    <div class="kv"><div class="k">Name</div><div class="v">Loading...</div></div>
                                    <div class="kv"><div class="k">Class</div><div class="v">Loading...</div></div>
                                    <div class="kv"><div class="k">Vibe</div><div class="v">Loading...</div></div>
                                </div>
                            </div>
                        </header>

                        <section class="body">
                            <aside class="side-section">
                                <div class="avatar" aria-hidden="true">
                                    <span>Portrait 200×200</span>
                                </div>
                            </aside>

                            <main>
                                <div class="panel">
                                    <h2 class="mb-1">Backstory</h2>
                                    <p>Loading...</p>
                                </div>

                                <div class="grid-two">
                                    <div class="panel middle-panel">
                                        <h2>Strengths</h2>
                                        <ul class="list">
                                            <li>Loading...</li>
                                        </ul>
                                        <h2 class="mt-1">Weakness</h2>
                                        <ul class="list">
                                            <li>Loading...</li>
                                        </ul>
                                    </div>
                                    <div class="panel middle-panel">
                                        <h2>Proficiencies</h2>
                                        <ul class="list">
                                            <li>Loading...</li>
                                        </ul>
                                    </div>
                                </div>

                                <div class="panel current-quest">
                                    <h2>Current Quests</h2>
                                    <ul class="list">
                                        <li>Loading...</li>
                                    </ul>
                                </div>
                            </main>
                        </section>
                    </div>
                </div>
            </div>
        `;

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('character-sheet-modal');
        
        // Initialize starfield
        this.initStarfield();
    }

    bindEvents() {
        // Close button event
        const closeBtn = this.modal.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => this.close());

        // Click outside modal to close
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Note: Body scroll prevention is now handled directly in open() and close() methods

        // Handle window resize for starfield
        window.addEventListener('resize', () => {
            if (this.isOpen && this.starfieldCanvas) {
                this.resizeStarfieldCanvas();
                this.initStars();
            }
        });
    }

    initStarfield() {
        this.starfieldCanvas = document.getElementById('modal-starfield');
        if (!this.starfieldCanvas) return;
        
        this.starfieldCtx = this.starfieldCanvas.getContext('2d');
        this.resizeStarfieldCanvas();
        this.initStars();
    }

    resizeStarfieldCanvas() {
        if (!this.starfieldCanvas) return;
        const modalContent = this.modal.querySelector('.modal-content');
        if (modalContent) {
            // Make canvas cover the entire scrollable content
            this.starfieldCanvas.width = modalContent.scrollWidth || modalContent.offsetWidth;
            this.starfieldCanvas.height = modalContent.scrollHeight || modalContent.offsetHeight;
            
            // Ensure CSS covers the full area
            this.starfieldCanvas.style.width = modalContent.scrollWidth + 'px';
            this.starfieldCanvas.style.height = modalContent.scrollHeight + 'px';
        }
    }

    // Star class for modal starfield
    createStar() {
        const canvas = this.starfieldCanvas;
        const ctx = this.starfieldCtx;
        
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.5,
            opacity: Math.random(),
            twinkleSpeed: Math.random() * 0.02 + 0.005,
            velocityX: (Math.random() - 0.5) * 0.1,
            velocityY: (Math.random() - 0.5) * 0.1,
            maxOpacity: Math.random() * 0.3 + 0.7,
            minOpacity: Math.random() * 0.3 + 0.4,
            
            update() {
                // Twinkle effect
                this.opacity += this.twinkleSpeed;
                if (this.opacity > this.maxOpacity || this.opacity < this.minOpacity) {
                    this.twinkleSpeed *= -1;
                }

                // Subtle movement
                this.x += this.velocityX;
                this.y += this.velocityY;

                // Wrap around screen
                if (this.x < 0) this.x = canvas.width;
                if (this.x > canvas.width) this.x = 0;
                if (this.y < 0) this.y = canvas.height;
                if (this.y > canvas.height) this.y = 0;
            },
            
            draw() {
                ctx.save();
                ctx.globalAlpha = this.opacity;
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
                
                // Add glow for all stars
                ctx.globalAlpha = this.opacity * 0.5;
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
                ctx.fill();
                
                // Add outer glow for larger stars
                if (this.radius > 1) {
                    ctx.globalAlpha = this.opacity * 0.2;
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                ctx.restore();
            }
        };
    }

    initStars() {
        this.stars = [];
        // Adjust star count based on screen size
        const starCount = Math.floor((this.starfieldCanvas.width * this.starfieldCanvas.height) / 3000);
        for (let i = 0; i < starCount; i++) {
            this.stars.push(this.createStar());
        }
    }

    animateStarfield() {
        if (!this.starfieldCtx || !this.starfieldCanvas) return;
        
        // Fill with dark background for stars to be visible
        this.starfieldCtx.fillStyle = '#0f1419';
        this.starfieldCtx.fillRect(0, 0, this.starfieldCanvas.width, this.starfieldCanvas.height);
        
        this.stars.forEach(star => {
            star.update();
            star.draw();
        });
        
        this.animationFrameId = requestAnimationFrame(() => this.animateStarfield());
    }

    startStarfieldAnimation() {
        if (this.animationFrameId) return; // Already animating
        this.animateStarfield();
    }

    stopStarfieldAnimation() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    open() {
        if (this.modal) {
            // Immediately prevent body scroll
            document.body.classList.add('modal-open');
            
            this.modal.classList.add('active');
            this.isOpen = true;
            
            // Resize starfield canvas to match modal content
            setTimeout(() => {
                this.resizeStarfieldCanvas();
                this.initStars();
            }, 100);
            
            // Start starfield animation
            this.startStarfieldAnimation();
            
            // Focus management for accessibility
            const closeBtn = this.modal.querySelector('.close-btn');
            closeBtn.focus();
        }
    }

    close() {
        if (this.modal) {
            this.modal.classList.remove('active');
            this.isOpen = false;
            document.body.classList.remove('modal-open');
            
            // Stop starfield animation
            this.stopStarfieldAnimation();
        }
    }

    // Method to update character data with team member information
    updateCharacterData(characterData) {
        if (!this.modal || !characterData) return;

        const sheet = this.modal.querySelector('.character-sheet');
        if (!sheet) return;

        // Update basic info banner
        const nameEl = sheet.querySelector('.kv:nth-child(1) .v');
        const classEl = sheet.querySelector('.kv:nth-child(2) .v');
        const vibeEl = sheet.querySelector('.kv:nth-child(3) .v');

        if (nameEl) nameEl.textContent = characterData.name;
        if (classEl) classEl.textContent = characterData.class;
        if (vibeEl) vibeEl.textContent = characterData.vibe;

        // Update avatar
        const avatarEl = sheet.querySelector('.avatar');
        if (avatarEl && characterData.avatar) {
            avatarEl.innerHTML = `<img src="${characterData.avatar}" alt="${characterData.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`;
        }


        // Update backstory
        const backstoryEl = sheet.querySelector('.panel h2 + p');
        if (backstoryEl && characterData.backstory) {
            backstoryEl.textContent = characterData.backstory;
        }

        // Update strengths and weaknesses
        if (characterData.strengths && Array.isArray(characterData.strengths)) {
            // Find the strengths list - it's the first ul after the "Strengths" h2
            const strengthsPanel = sheet.querySelector('.grid-two .panel:first-child');
            const strengthsList = strengthsPanel ? strengthsPanel.querySelector('h2:first-of-type + ul') : null;
            if (strengthsList) {
                strengthsList.innerHTML = characterData.strengths
                    .map(strength => `<li>${strength}</li>`)
                    .join('');
            }
        }

        if (characterData.weaknesses && Array.isArray(characterData.weaknesses)) {
            // Find the weaknesses list - it's the ul after the "Weakness" h2
            const weaknessesPanel = sheet.querySelector('.grid-two .panel:first-child');
            const weaknessesList = weaknessesPanel ? weaknessesPanel.querySelector('h2:last-of-type + ul') : null;
            if (weaknessesList) {
                weaknessesList.innerHTML = characterData.weaknesses
                    .map(weakness => `<li>${weakness}</li>`)
                    .join('');
            }
        }

        // Update proficiencies
        if (characterData.proficiencies && Array.isArray(characterData.proficiencies)) {
            const proficienciesList = sheet.querySelector('.grid-two .panel:nth-child(2) .list');
            if (proficienciesList) {
                proficienciesList.innerHTML = characterData.proficiencies
                    .map(prof => `<li>${prof}</li>`)
                    .join('');
            }
        }

        // Update current quest
        if (characterData.currentQuest && Array.isArray(characterData.currentQuest)) {
            const questList = sheet.querySelector('main .current-quest .list');
            if (questList) {
                questList.innerHTML = characterData.currentQuest
                    .map(quest => `<li>${quest}</li>`)
                    .join('');
            }
        }

        // Update accessibility attributes
        sheet.setAttribute('aria-label', `Team character sheet: ${characterData.name}`);
    }
}

// Initialize modal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.characterSheetModal = new CharacterSheetModal();
});

