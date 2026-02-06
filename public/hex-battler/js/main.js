/**
 * Hex Battle Simulator - Main Entry Point
 * Game initialization, lobby, and main loop
 */

class HexBattlerApp {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Fix canvas dimensions
        this.canvas.width = SCREEN_WIDTH;
        this.canvas.height = SCREEN_HEIGHT;

        // Core systems
        this.game = new GameState();
        this.renderer = new Renderer(this.canvas, this.game);
        this.input = new InputHandler(this.canvas, this.game, this.renderer);
        this.multiplayer = new MultiplayerManager(this.game);

        // AI systems
        this.aiPlayers = {};
        this.lastAIUpdate = 0;
        this.aiDelay = 800; // ms between AI actions

        // Multiplayer state
        this.hostChosenFaction = null; // Host's faction pick (stored before client chooses)
        this.isMultiplayer = false;
        this.gameLoopStarted = false;

        // UI Elements
        this.lobbyScreen = document.getElementById('lobbyScreen');
        this.gameScreen = document.getElementById('gameScreen');
        this.connectionPanel = document.getElementById('connectionPanel');

        this.setupEventListeners();
        this.showLobby();
    }

    setupEventListeners() {
        // Mode buttons
        document.getElementById('btnLocal').addEventListener('click', () => this.startLocalGame());
        document.getElementById('btnHost').addEventListener('click', () => this.hostGame());
        document.getElementById('btnJoin').addEventListener('click', () => this.showJoinDialog());
        document.getElementById('btnWatch').addEventListener('click', () => this.watchAI());

        // Faction selection
        document.getElementById('btnPlayAkvira').addEventListener('click', () => this.handleFactionClick(Team.AKVIRA));
        document.getElementById('btnPlayLiguni').addEventListener('click', () => this.handleFactionClick(Team.LIGUNI));
        document.getElementById('btnPlayDindrae').addEventListener('click', () => this.handleFactionClick(Team.DINDRAE));

        // Join dialog
        document.getElementById('btnConnectJoin').addEventListener('click', () => this.joinGame());
        document.getElementById('btnConnectSpectate').addEventListener('click', () => this.spectateGame());

        // Multiplayer callbacks
        this.multiplayer.onConnectionChange = (connected) => {
            this.updateConnectionStatus(connected);
        };
        this.multiplayer.onRoomCreated = (roomId) => {
            this.showRoomId(roomId);
        };

        // Client receives: host picked a faction, now you pick
        this.multiplayer.onFactionPrompt = (hostFaction) => {
            this.handleFactionPrompt(hostFaction);
        };

        // Host receives: client picked a faction
        this.multiplayer.onFactionChosen = (clientFaction) => {
            this.handleClientFactionChosen(clientFaction);
        };

        // Client receives: full game config, setup and start
        this.multiplayer.onGameConfig = (config) => {
            this.handleGameConfig(config);
        };

        // Client receives: host finished placement, your turn
        this.multiplayer.onHostPlacementDone = (state) => {
            this.handleHostPlacementDone(state);
        };

        // Host receives: client finished placement
        this.multiplayer.onClientPlacementDone = (placements) => {
            this.handleClientPlacementDone(placements);
        };
    }

    showLobby() {
        this.lobbyScreen.style.display = 'flex';
        this.gameScreen.style.display = 'none';
        document.getElementById('factionSelect').style.display = 'none';
        document.getElementById('joinDialog').style.display = 'none';
        document.getElementById('roomInfo').style.display = 'none';
        this.hideWaitingStatus();
    }

    showGame() {
        this.lobbyScreen.style.display = 'none';
        this.gameScreen.style.display = 'block';
        if (!this.gameLoopStarted) {
            this.gameLoopStarted = true;
            this.startGameLoop();
        }
    }

    startLocalGame() {
        this.isMultiplayer = false;
        document.getElementById('modeSelect').style.display = 'none';
        document.getElementById('factionSelect').style.display = 'block';
    }

    watchAI() {
        // AI vs AI mode
        this.isMultiplayer = false;
        this.game.setupGame(null, Team.AKVIRA, Team.LIGUNI);
        this.aiPlayers = {
            [Team.AKVIRA]: createAI(this.game, Team.AKVIRA),
            [Team.LIGUNI]: createAI(this.game, Team.LIGUNI)
        };
        this.showGame();
    }

    async hostGame() {
        try {
            this.isMultiplayer = true;
            const roomId = await this.multiplayer.createRoom();
            document.getElementById('modeSelect').style.display = 'none';
            document.getElementById('roomInfo').style.display = 'block';
            document.getElementById('roomIdDisplay').textContent = roomId;

            // Show faction selection for host
            document.getElementById('factionSelect').style.display = 'block';
        } catch (e) {
            alert('Failed to create room: ' + e.message);
        }
    }

    showJoinDialog() {
        document.getElementById('modeSelect').style.display = 'none';
        document.getElementById('joinDialog').style.display = 'block';
    }

    async joinGame() {
        const roomId = document.getElementById('roomIdInput').value.trim();
        if (!roomId) {
            alert('Please enter a Room ID');
            return;
        }

        try {
            this.isMultiplayer = true;
            await this.multiplayer.joinRoom(roomId, false);

            // Show waiting status - will get WAITING_FOR_FACTION from host
            document.getElementById('joinDialog').style.display = 'none';
            this.showWaitingStatus('Connected! Waiting for host to pick a faction...');
        } catch (e) {
            alert('Failed to join room: ' + e.message);
        }
    }

    async spectateGame() {
        const roomId = document.getElementById('roomIdInput').value.trim();
        if (!roomId) {
            alert('Please enter a Room ID');
            return;
        }

        try {
            this.isMultiplayer = true;
            await this.multiplayer.joinRoom(roomId, true);
            this.game.isSpectator = true;
            this.showGame();
        } catch (e) {
            alert('Failed to spectate: ' + e.message);
        }
    }

    // Called when any faction button is clicked
    handleFactionClick(faction) {
        if (this.isMultiplayer && this.multiplayer.isHost) {
            // Host picks faction - store it, tell client to pick
            this.hostChosenFaction = faction;
            this.multiplayer.sendFactionPrompt(faction);

            // Hide faction select, show waiting
            document.getElementById('factionSelect').style.display = 'none';
            if (this.multiplayer.isConnected) {
                this.showWaitingStatus(`You chose ${faction}. Waiting for opponent to pick...`);
            } else {
                this.showWaitingStatus(`You chose ${faction}. Waiting for opponent to connect and pick...`);
            }
        } else if (this.isMultiplayer && !this.multiplayer.isHost) {
            // Client picks faction - send to host
            this.multiplayer.sendFactionChoice(faction);
            document.getElementById('factionSelect').style.display = 'none';
            this.showWaitingStatus(`You chose ${faction}. Starting game...`);
        } else {
            // Local game - start immediately
            this.startLocalGameWithFaction(faction);
        }
    }

    // Local game: start with chosen faction vs default enemy
    startLocalGameWithFaction(playerTeam) {
        const enemyTeam = this.getDefaultEnemy(playerTeam);
        this.game.setupGame(playerTeam, playerTeam, enemyTeam);

        this.aiPlayers = {
            [enemyTeam]: createAI(this.game, enemyTeam)
        };

        this.showGame();
    }

    getDefaultEnemy(faction) {
        if (faction === Team.AKVIRA) return Team.LIGUNI;
        if (faction === Team.LIGUNI) return Team.AKVIRA;
        return Team.LIGUNI; // Dindrae vs Liguni
    }

    // ==================== MULTIPLAYER FLOW ====================

    // Client: received prompt to pick faction (host already picked)
    handleFactionPrompt(hostFaction) {
        console.log('Host picked:', hostFaction, '- now pick yours');
        this.hideWaitingStatus();

        // Show faction select, but disable the host's faction
        document.getElementById('factionSelect').style.display = 'block';

        // Disable the button for the host's faction
        const factionButtons = {
            [Team.AKVIRA]: document.getElementById('btnPlayAkvira'),
            [Team.LIGUNI]: document.getElementById('btnPlayLiguni'),
            [Team.DINDRAE]: document.getElementById('btnPlayDindrae')
        };

        for (const [team, btn] of Object.entries(factionButtons)) {
            if (team === hostFaction) {
                btn.disabled = true;
                btn.style.opacity = '0.4';
                btn.textContent = `${team} (Host)`;
            } else {
                btn.disabled = false;
                btn.style.opacity = '1';
            }
        }
    }

    // Host: client chose their faction, now start the game
    handleClientFactionChosen(clientFaction) {
        console.log('Client picked:', clientFaction);
        this.hideWaitingStatus();

        const hostFaction = this.hostChosenFaction;
        const liguniSeed = Math.floor(Math.random() * 0xFFFFFFFF);

        // Send game config to client
        const config = {
            hostFaction: hostFaction,
            clientFaction: clientFaction,
            liguniSeed: liguniSeed
        };
        this.multiplayer.sendGameConfig(config);

        // Setup host's game
        this.game.setupGameFromConfig({
            ...config,
            myTeam: hostFaction
        });

        // Store original finishPlacement to hook into it
        this._hookPlacementFinish();

        this.showGame();
    }

    // Client: received full game config from host
    handleGameConfig(config) {
        console.log('Game config received:', config);
        this.hideWaitingStatus();

        // Setup client's game with same config
        this.game.setupGameFromConfig({
            ...config,
            myTeam: config.clientFaction
        });

        // Show waiting message - host places first
        this.showWaitingStatus('Host is placing units...');

        // Start game loop for rendering but don't allow input yet
        this.showGame();
    }

    // Hook into finishPlacement to send HOST_PLACEMENT_DONE
    _hookPlacementFinish() {
        const originalFinish = this.game.finishPlacement.bind(this.game);
        this.game.finishPlacement = () => {
            if (this.multiplayer.isHost && this.multiplayer.isConnected) {
                // Host finished placement - don't start battle yet
                // Place units on grid, then notify client
                this.game.phase = GamePhase.SETUP; // Pause - waiting for client
                this.game.currentPlacingUnit = null;
                this.game.unitsToPlace = [];
                this.game.validTargets = [];
                this.game.placementTeam = null;
                this.game.log('Waiting for opponent to place units...');

                this.multiplayer.sendHostPlacementDone();
            } else if (this.game.connectionMode === ConnectionMode.CLIENT) {
                // Client finished placement - send placements to host
                const clientTeam = this.game.playerTeam;
                const clientUnits = this.game._getFactionUnits(clientTeam);
                const placements = clientUnits
                    .filter(u => u.hexPos)
                    .map(u => ({
                        unitId: u.id,
                        q: u.hexPos.q,
                        r: u.hexPos.r
                    }));

                this.game.phase = GamePhase.SETUP; // Pause - waiting for host to start battle
                this.game.currentPlacingUnit = null;
                this.game.unitsToPlace = [];
                this.game.validTargets = [];
                this.game.placementTeam = null;
                this.game.log('Waiting for game to start...');

                this.multiplayer.sendClientPlacementDone(placements);
            } else {
                // Local game - proceed normally
                originalFinish();
            }
        };
    }

    // Client: host finished placement, now client places
    handleHostPlacementDone(state) {
        console.log('Host placement done, applying state');

        // Apply host's state (units are now placed on host's side)
        this.multiplayer.applyState(state);

        // Hide waiting
        this.hideWaitingStatus();

        // Now client enters placement for their team
        const myTeam = this.game.playerTeam;
        this.game.startPlacementPhase(myTeam);

        // Hook placement finish
        this._hookPlacementFinish();
    }

    // Host: client finished placement, place client's units and start battle
    handleClientPlacementDone(placements) {
        console.log('Client placement done, applying placements:', placements);

        // Place client's units on host's grid
        for (const p of placements) {
            this.game.placeSpecificUnit(p.unitId, p.q, p.r);
        }

        // Start the battle
        this.game.phase = GamePhase.SELECT_UNIT;
        this.game.log(`Battle begins! ${this.game.teamA} vs ${this.game.teamB}`);

        // Broadcast the final state
        this.multiplayer.broadcastState();
    }

    // ==================== UI HELPERS ====================

    showWaitingStatus(message) {
        let el = document.getElementById('waitingStatus');
        if (!el) {
            el = document.createElement('div');
            el.id = 'waitingStatus';
            el.className = 'panel';
            el.style.textAlign = 'center';
            el.style.marginTop = '1rem';
            document.querySelector('.lobby-container').appendChild(el);
        }
        el.textContent = message;
        el.style.display = 'block';
    }

    hideWaitingStatus() {
        const el = document.getElementById('waitingStatus');
        if (el) el.style.display = 'none';
    }

    showRoomId(roomId) {
        document.getElementById('roomIdDisplay').textContent = roomId;
    }

    updateConnectionStatus(connected) {
        const status = document.getElementById('connectionStatus');
        if (status) {
            status.textContent = connected ? 'Connected' : 'Disconnected';
            status.style.color = connected ? '#3cc83c' : '#dc3c3c';
        }
    }

    // ==================== GAME LOOP ====================

    startGameLoop() {
        const loop = (timestamp) => {
            this.update(timestamp);
            this.render();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    update(timestamp) {
        // Handle AI turns (only in non-multiplayer or for AI opponents)
        if (this.game.phase === GamePhase.SELECT_UNIT || this.game.phase === GamePhase.SELECT_ACTION) {
            const currentTeam = this.game.currentTeam;
            const ai = this.aiPlayers[currentTeam];

            if (ai && timestamp - this.lastAIUpdate > this.aiDelay) {
                this.executeAITurn(ai);
                this.lastAIUpdate = timestamp;

                // Broadcast after AI action if host
                if (this.multiplayer.isHost && this.multiplayer.isConnected) {
                    this.multiplayer.broadcastState();
                }
            }
        }

        // NOTE: No per-frame broadcastState() - only after state changes
    }

    executeAITurn(ai) {
        if (this.game.phase === GamePhase.SELECT_UNIT) {
            const move = ai.getMove();
            if (move && move.type === 'SELECT_UNIT') {
                this.game.selectUnit(move.unit);
            }
        } else if (this.game.phase === GamePhase.SELECT_ACTION) {
            const action = ai.getAction();
            if (action) {
                switch (action.type) {
                    case 'MOVE':
                        this.game.executeMove(this.game.selectedUnit, action.target);
                        break;
                    case 'ATTACK':
                        this.game.executeAttack(this.game.selectedUnit, action.target, action.attackIndex);
                        break;
                    case 'AIM':
                        this.game.executeAim(this.game.selectedUnit);
                        break;
                    case 'DODGE':
                        this.game.executeDodge(this.game.selectedUnit);
                        break;
                    case 'DECOUPLE':
                        this.game.executeDecouple(this.game.selectedUnit, action.target);
                        break;
                    case 'ASCEND':
                        this.game.executeAscension(this.game.selectedUnit);
                        break;
                    case 'TOTEM_BOOM':
                        this.game.executeTotemBoom(this.game.selectedUnit, action.target);
                        break;
                    case 'END_ACTIVATION':
                        this.game.endUnitActivation();
                        break;
                }

                // Check if unit still has actions
                if (this.game.selectedUnit && this.game.selectedUnit.actionsRemaining === 0) {
                    this.game.endUnitActivation();
                }

                // Check game over
                if (this.game.checkGameOver()) {
                    this.game.phase = GamePhase.GAME_OVER;
                }
            }
        }
    }

    render() {
        this.renderer.draw();

        // Draw action buttons if in SELECT_ACTION phase
        if (this.game.phase === GamePhase.SELECT_ACTION) {
            this.renderer.drawActionButtons();
        }
    }
}

// Initialize
function initGame() {
    if (!window.app) {
        window.app = new HexBattlerApp();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}
