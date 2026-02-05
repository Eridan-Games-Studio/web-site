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
        document.getElementById('btnPlayAkvira').addEventListener('click', () => this.startGame(Team.AKVIRA, Team.LIGUNI));
        document.getElementById('btnPlayLiguni').addEventListener('click', () => this.startGame(Team.LIGUNI, Team.AKVIRA));
        document.getElementById('btnPlayDindrae').addEventListener('click', () => this.startGame(Team.DINDRAE, Team.LIGUNI));

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
        this.multiplayer.onGameStart = (config) => {
            this.handleRemoteGameStart(config);
        };
    }

    showLobby() {
        this.lobbyScreen.style.display = 'flex';
        this.gameScreen.style.display = 'none';
        document.getElementById('factionSelect').style.display = 'none';
        document.getElementById('joinDialog').style.display = 'none';
        document.getElementById('roomInfo').style.display = 'none';
    }

    showGame() {
        this.lobbyScreen.style.display = 'none';
        this.gameScreen.style.display = 'block';
        this.startGameLoop();
    }

    startLocalGame() {
        document.getElementById('modeSelect').style.display = 'none';
        document.getElementById('factionSelect').style.display = 'block';
    }

    watchAI() {
        // AI vs AI mode
        this.game.setupGame(null, Team.AKVIRA, Team.LIGUNI);
        this.aiPlayers = {
            [Team.AKVIRA]: createAI(this.game, Team.AKVIRA),
            [Team.LIGUNI]: createAI(this.game, Team.LIGUNI)
        };
        this.showGame();
    }

    async hostGame() {
        try {
            const roomId = await this.multiplayer.createRoom();
            document.getElementById('modeSelect').style.display = 'none';
            document.getElementById('roomInfo').style.display = 'block';
            document.getElementById('roomIdDisplay').textContent = roomId;

            // Show faction selection after creating room
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
            await this.multiplayer.joinRoom(roomId, false);
            this.showGame();
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
            await this.multiplayer.joinRoom(roomId, true);
            this.game.isSpectator = true;
            this.showGame();
        } catch (e) {
            alert('Failed to spectate: ' + e.message);
        }
    }

    startGame(playerTeam, enemyTeam) {
        this.game.setupGame(playerTeam, playerTeam, enemyTeam);

        // Create AI for enemy team
        this.aiPlayers = {
            [enemyTeam]: createAI(this.game, enemyTeam)
        };

        if (this.multiplayer.isHost && this.multiplayer.isConnected) {
            this.multiplayer.startGame({ playerTeam, enemyTeam });
        }

        this.showGame();
    }

    handleRemoteGameStart(config) {
        // Remote game start - we are the enemy team
        const myTeam = config.enemyTeam;
        this.game.setupGame(myTeam, config.playerTeam, config.enemyTeam);
        this.showGame();
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

    startGameLoop() {
        const loop = (timestamp) => {
            this.update(timestamp);
            this.render();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    update(timestamp) {
        // Handle AI turns
        if (this.game.phase === GamePhase.SELECT_UNIT || this.game.phase === GamePhase.SELECT_ACTION) {
            const currentTeam = this.game.currentTeam;
            const ai = this.aiPlayers[currentTeam];

            if (ai && timestamp - this.lastAIUpdate > this.aiDelay) {
                this.executeAITurn(ai);
                this.lastAIUpdate = timestamp;
            }
        }

        // Sync state to clients if host
        if (this.multiplayer.isHost && this.multiplayer.isConnected) {
            this.multiplayer.broadcastState();
        }
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
