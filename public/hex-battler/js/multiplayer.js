/**
 * Hex Battle Simulator - Multiplayer with PeerJS
 * Peer-to-peer networking for game sync
 */

class MultiplayerManager {
    constructor(game) {
        this.game = game;
        this.peer = null;
        this.connections = [];
        this.spectators = [];
        this.myPeerId = null;
        this.hostId = null;
        this.isHost = false;
        this.isConnected = false;

        // Callbacks
        this.onConnectionChange = null;
        this.onRoomCreated = null;
        this.onGameStart = null;
        this.onError = null;
    }

    // Initialize PeerJS
    init() {
        return new Promise((resolve, reject) => {
            try {
                this.peer = new Peer();

                this.peer.on('open', (id) => {
                    this.myPeerId = id;
                    console.log('PeerJS connected, ID:', id);
                    resolve(id);
                });

                this.peer.on('error', (err) => {
                    console.error('PeerJS error:', err);
                    if (this.onError) this.onError(err);
                    reject(err);
                });

                this.peer.on('connection', (conn) => {
                    this.handleIncomingConnection(conn);
                });

            } catch (e) {
                reject(e);
            }
        });
    }

    // Host: Create a new room
    async createRoom() {
        if (!this.peer) {
            await this.init();
        }

        this.isHost = true;
        this.game.connectionMode = ConnectionMode.HOST;

        if (this.onRoomCreated) {
            this.onRoomCreated(this.myPeerId);
        }

        return this.myPeerId;
    }

    // Client: Join an existing room
    async joinRoom(hostId, asSpectator = false) {
        if (!this.peer) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            this.hostId = hostId;
            this.isHost = false;
            this.game.connectionMode = asSpectator ? ConnectionMode.SPECTATOR : ConnectionMode.CLIENT;
            this.game.isSpectator = asSpectator;

            const conn = this.peer.connect(hostId, {
                reliable: true,
                metadata: { isSpectator: asSpectator }
            });

            conn.on('open', () => {
                this.isConnected = true;
                this.connections.push(conn);
                this.setupConnectionHandlers(conn);

                // Send join request
                conn.send({
                    type: 'JOIN',
                    isSpectator: asSpectator,
                    peerId: this.myPeerId
                });

                if (this.onConnectionChange) {
                    this.onConnectionChange(true);
                }

                resolve(conn);
            });

            conn.on('error', (err) => {
                reject(err);
            });
        });
    }

    handleIncomingConnection(conn) {
        console.log('Incoming connection:', conn.peer);

        conn.on('open', () => {
            this.connections.push(conn);
            this.setupConnectionHandlers(conn);
            this.isConnected = true;

            if (this.onConnectionChange) {
                this.onConnectionChange(true);
            }
        });
    }

    setupConnectionHandlers(conn) {
        conn.on('data', (data) => {
            this.handleMessage(data, conn);
        });

        conn.on('close', () => {
            this.connections = this.connections.filter(c => c !== conn);
            this.spectators = this.spectators.filter(s => s !== conn);
            console.log('Connection closed');

            if (this.connections.length === 0) {
                this.isConnected = false;
                if (this.onConnectionChange) {
                    this.onConnectionChange(false);
                }
            }
        });
    }

    handleMessage(data, conn) {
        console.log('Received message:', data.type);

        switch (data.type) {
            case 'JOIN':
                if (this.isHost) {
                    if (data.isSpectator) {
                        this.spectators.push(conn);
                        conn.send({ type: 'JOIN_ACK', role: 'spectator' });
                    } else {
                        conn.send({ type: 'JOIN_ACK', role: 'client' });
                    }
                    // Send current state
                    this.broadcastState();
                }
                break;

            case 'JOIN_ACK':
                console.log('Joined as:', data.role);
                break;

            case 'STATE_UPDATE':
                if (!this.isHost) {
                    this.applyState(data.state);
                }
                break;

            case 'ACTION':
                if (this.isHost) {
                    this.executeRemoteAction(data.action);
                }
                break;

            case 'GAME_START':
                if (!this.isHost && this.onGameStart) {
                    this.onGameStart(data.config);
                }
                break;
        }
    }

    // Host: Broadcast game state to all clients
    broadcastState() {
        if (!this.isHost) return;

        const state = this.game.serialize();
        const message = {
            type: 'STATE_UPDATE',
            state: state
        };

        for (const conn of this.connections) {
            conn.send(message);
        }
    }

    // Host: Start game with config
    startGame(config) {
        if (!this.isHost) return;

        const message = {
            type: 'GAME_START',
            config: config
        };

        for (const conn of this.connections) {
            conn.send(message);
        }

        if (this.onGameStart) {
            this.onGameStart(config);
        }
    }

    // Client: Send action to host
    sendAction(action) {
        if (this.isHost) {
            // Execute locally and broadcast
            this.executeLocalAction(action);
            this.broadcastState();
        } else if (this.hostId) {
            // Send to host
            const hostConn = this.connections.find(c => c.peer === this.hostId);
            if (hostConn) {
                hostConn.send({
                    type: 'ACTION',
                    action: action
                });
            }
        }
    }

    executeLocalAction(action) {
        // Action execution is handled by InputHandler
        // This is called after InputHandler processes the action
    }

    executeRemoteAction(action) {
        // Apply action from remote client
        console.log('Remote action received:', action);

        if (action.type === 'PLACE_UNIT') {
            this.game.placeSpecificUnit(action.unitId, action.q, action.r);
        }
        else if (action.type === 'SELECT_UNIT') {
            const unit = this.game.allUnits.find(u => u.id === action.unitId);
            if (unit) {
                this.game.selectUnit(unit);
            }
        }
        else if (action.type === 'ACTION') {
            const unit = this.game.selectedUnit;
            if (!unit) return;

            // Execute the specific action
            switch (action.actionType) {
                case ActionType.MOVE:
                    this.game.executeMove(unit, action.target);
                    break;
                case ActionType.ATTACK:
                    this.game.executeAttack(unit, action.target, action.attackIndex);
                    break;
                case ActionType.AIM:
                    this.game.executeAim(unit);
                    break;
                case ActionType.DODGE:
                    this.game.executeDodge(unit);
                    break;
                case ActionType.PEAL_CALL:
                    this.game.executePealCall(unit);
                    break;
                case ActionType.THERMAL_GRENADE:
                    this.game.executeThermalGrenade(unit, action.target);
                    break;
                case ActionType.ROTATE:
                    this.game.executeRotation(unit, action.direction || 1);
                    break;
                case ActionType.TOTEM_BOOM:
                    this.game.executeTotemBoom(unit, action.target);
                    break;
                case ActionType.ASCEND:
                    this.game.executeAscension(unit);
                    break;
                case ActionType.DECOUPLE:
                    this.game.executeDecouple(unit, action.target);
                    break;
                case ActionType.COUPLE:
                    const target = this.game.grid.getUnitAt(action.target.q, action.target.r);
                    if (target) {
                        this.game.executeCouple(unit, target);
                    }
                    break;
                case 'END_ACTIVATION':
                    this.game.endUnitActivation();
                    break;
            }

            // Check post-action states
            if (this.game.selectedUnit && this.game.selectedUnit.actionsRemaining === 0) {
                this.game.endUnitActivation();
            }
            if (this.game.checkGameOver()) {
                this.game.phase = GamePhase.GAME_OVER;
            }
        }

        // After execution, broadcast new state
        this.broadcastState();
    }

    applyState(state) {
        // Apply received state to game
        // This is a simplified version - full implementation would reconstruct all units
        this.game.phase = state.phase;
        this.game.currentTeam = state.currentTeam;
        this.game.currentRound = state.currentRound;
        this.game.winner = state.winner;
        this.game.combatLog = state.combatLog;
        this.game.echoPool.current = state.echoPool.current;
        this.game.dindraeTotemsRemaining = state.dindraeTotemsRemaining;

        // Update unit states
        for (const unitState of state.units) {
            const unit = this.game.allUnits.find(u => u.id === unitState.id);
            if (unit) {
                unit.health = unitState.health;
                unit.hexPos = unitState.hexPos;
                unit.aimToken = unitState.aimToken;
                unit.dodgeToken = unitState.dodgeToken;
                unit.exhausted = unitState.exhausted;
                unit.actionsRemaining = unitState.actionsRemaining;
                unit.actionsUsed = unitState.actionsUsed;
            }
        }

        if (state.selectedUnitId !== undefined) {
            this.game.selectedUnit = this.game.allUnits.find(u => u.id === state.selectedUnitId);
        }
        this.game.selectedAction = state.selectedAction;
        this.game.validTargets = state.validTargets;
    }

    disconnect() {
        for (const conn of this.connections) {
            conn.close();
        }
        this.connections = [];
        this.spectators = [];

        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }

        this.isConnected = false;
        this.isHost = false;
    }

    getConnectionCount() {
        return this.connections.length;
    }

    getSpectatorCount() {
        return this.spectators.length;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MultiplayerManager };
}
