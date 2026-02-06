/**
 * Hex Battle Simulator - Multiplayer with PeerJS
 * Peer-to-peer networking for game sync
 *
 * Protocol:
 *   JOIN -> JOIN_ACK
 *   Host picks faction -> sends WAITING_FOR_FACTION (with hostFaction)
 *   Client picks faction -> sends FACTION_CHOICE (with clientFaction)
 *   Host generates config -> sends GAME_CONFIG (both factions + seed)
 *   Both setup identical game -> sequential placement
 *   HOST_PLACEMENT_DONE -> client enters placement
 *   CLIENT_PLACEMENT_DONE -> host starts battle
 *   STATE_UPDATE (host -> client, after each action)
 *   ACTION (client -> host)
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

        // Faction negotiation state
        this.hostFaction = null;
        this.clientFaction = null;
        this.liguniSeed = null;

        // Callbacks
        this.onConnectionChange = null;
        this.onRoomCreated = null;
        this.onGameConfig = null;
        this.onFactionPrompt = null;   // client receives: pick your faction
        this.onFactionChosen = null;   // host receives: client chose
        this.onHostPlacementDone = null;
        this.onClientPlacementDone = null;
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
                    // If host already picked a faction, prompt client
                    if (this.hostFaction) {
                        conn.send({
                            type: 'WAITING_FOR_FACTION',
                            hostFaction: this.hostFaction
                        });
                    }
                }
                break;

            case 'JOIN_ACK':
                console.log('Joined as:', data.role);
                break;

            case 'WAITING_FOR_FACTION':
                // Client receives: host has picked, now pick yours
                if (!this.isHost && this.onFactionPrompt) {
                    this.onFactionPrompt(data.hostFaction);
                }
                break;

            case 'FACTION_CHOICE':
                // Host receives: client picked their faction
                if (this.isHost) {
                    this.clientFaction = data.faction;
                    if (this.onFactionChosen) {
                        this.onFactionChosen(data.faction);
                    }
                }
                break;

            case 'GAME_CONFIG':
                // Client receives full game config
                if (!this.isHost && this.onGameConfig) {
                    this.onGameConfig(data.config);
                }
                break;

            case 'STATE_UPDATE':
                if (!this.isHost) {
                    this.applyState(data.state);
                }
                break;

            case 'HOST_PLACEMENT_DONE':
                // Client receives: host finished placing, your turn
                if (!this.isHost && this.onHostPlacementDone) {
                    this.onHostPlacementDone(data.state);
                }
                break;

            case 'CLIENT_PLACEMENT_DONE':
                // Host receives: client finished placing
                if (this.isHost && this.onClientPlacementDone) {
                    this.onClientPlacementDone(data.placements);
                }
                break;

            case 'ACTION':
                if (this.isHost) {
                    this.executeRemoteAction(data.action);
                }
                break;
        }
    }

    // Host: Tell client to pick a faction
    sendFactionPrompt(hostFaction) {
        this.hostFaction = hostFaction;
        const message = {
            type: 'WAITING_FOR_FACTION',
            hostFaction: hostFaction
        };
        for (const conn of this.connections) {
            if (!this.spectators.includes(conn)) {
                conn.send(message);
            }
        }
    }

    // Client: Send faction choice to host
    sendFactionChoice(faction) {
        this.clientFaction = faction;
        const hostConn = this.connections.find(c => c.peer === this.hostId);
        if (hostConn) {
            hostConn.send({
                type: 'FACTION_CHOICE',
                faction: faction
            });
        }
    }

    // Host: Send full game config to client
    sendGameConfig(config) {
        const message = {
            type: 'GAME_CONFIG',
            config: config
        };
        for (const conn of this.connections) {
            conn.send(message);
        }
    }

    // Host: Signal placement done, send current state
    sendHostPlacementDone() {
        const state = this.game.serialize();
        const message = {
            type: 'HOST_PLACEMENT_DONE',
            state: state
        };
        for (const conn of this.connections) {
            if (!this.spectators.includes(conn)) {
                conn.send(message);
            }
        }
    }

    // Client: Signal placement done, send unit placements
    sendClientPlacementDone(placements) {
        const hostConn = this.connections.find(c => c.peer === this.hostId);
        if (hostConn) {
            hostConn.send({
                type: 'CLIENT_PLACEMENT_DONE',
                placements: placements
            });
        }
    }

    // Host: Broadcast game state to all clients (call only after state changes)
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

    // Client: Send action to host
    sendAction(action) {
        if (this.isHost) {
            // Host executes locally (handled by InputHandler) then broadcasts
            this.broadcastState();
        } else if (this.hostId) {
            const hostConn = this.connections.find(c => c.peer === this.hostId);
            if (hostConn) {
                hostConn.send({
                    type: 'ACTION',
                    action: action
                });
            }
        }
    }

    executeRemoteAction(action) {
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
        // Full state reconstruction for client
        this.game.phase = state.phase;
        this.game.currentTeam = state.currentTeam;
        this.game.currentRound = state.currentRound;
        this.game.winner = state.winner;
        this.game.combatLog = state.combatLog || [];
        this.game.echoPool.current = state.echoPool.current;
        this.game.dindraeTotemsRemaining = state.dindraeTotemsRemaining;
        this.game.selectedAction = state.selectedAction;
        this.game.validTargets = state.validTargets || [];

        // Clear grid
        this.game.grid.units.clear();

        // Track which units are still alive in the state
        const stateUnitIds = new Set(state.units.map(u => u.id));

        // Remove dead units from local lists
        this.game.allUnits = this.game.allUnits.filter(u => stateUnitIds.has(u.id));
        this.game.akviraUnits = this.game.akviraUnits.filter(u => stateUnitIds.has(u.id));
        this.game.liguniUnits = this.game.liguniUnits.filter(u => stateUnitIds.has(u.id));
        this.game.dindraeUnits = this.game.dindraeUnits.filter(u => stateUnitIds.has(u.id));

        // Update each unit's state and re-place on grid
        for (const unitState of state.units) {
            let unit = this.game.allUnits.find(u => u.id === unitState.id);

            // Handle dynamically created Ligun units (from coupling during battle)
            // ID format: Liguni_Ligun_{agonId}_{dhulId}
            if (!unit && unitState.team === Team.LIGUNI && unitState.id.startsWith('Liguni_Ligun_')) {
                // Try to find component Agon and Dhul
                let foundAgon = null, foundDhul = null;
                if (this.game.agons && this.game.dhuls) {
                    for (const a of this.game.agons) {
                        for (const d of this.game.dhuls) {
                            const candidateId = `Liguni_Ligun_${a.id}_${d.id}`;
                            if (candidateId === unitState.id) {
                                foundAgon = a;
                                foundDhul = d;
                                break;
                            }
                        }
                        if (foundAgon) break;
                    }
                }

                if (foundAgon && foundDhul) {
                    const removeFromList = (list, u) => {
                        const idx = list.indexOf(u);
                        if (idx >= 0) list.splice(idx, 1);
                    };
                    removeFromList(this.game.liguniUnits, foundAgon);
                    removeFromList(this.game.liguniUnits, foundDhul);
                    removeFromList(this.game.allUnits, foundAgon);
                    removeFromList(this.game.allUnits, foundDhul);

                    foundAgon.isCoupled = true;
                    foundAgon.coupledDhul = foundDhul;
                    foundDhul.isCoupled = true;
                    foundDhul.coupledAgon = foundAgon;

                    const ligun = new LigunUnit(foundAgon, foundDhul).setId(unitState.id);
                    this.game.liguniUnits.push(ligun);
                    this.game.allUnits.push(ligun);
                    unit = ligun;
                }
            }

            // Handle decoupled Agon/Dhul units appearing after a Ligun was decoupled
            if (!unit && unitState.team === Team.LIGUNI) {
                // Check agons and dhuls arrays for this unit
                if (this.game.agons) {
                    const agon = this.game.agons.find(a => a.id === unitState.id);
                    if (agon) {
                        agon.isCoupled = false;
                        agon.coupledDhul = null;
                        this.game.liguniUnits.push(agon);
                        this.game.allUnits.push(agon);
                        unit = agon;
                    }
                }
                if (!unit && this.game.dhuls) {
                    const dhul = this.game.dhuls.find(d => d.id === unitState.id);
                    if (dhul) {
                        dhul.isCoupled = false;
                        dhul.coupledAgon = null;
                        this.game.liguniUnits.push(dhul);
                        this.game.allUnits.push(dhul);
                        unit = dhul;
                    }
                }
            }

            if (!unit) continue;

            unit.health = unitState.health;
            unit.maxHealth = unitState.maxHealth;
            unit.aimToken = unitState.aimToken;
            unit.dodgeToken = unitState.dodgeToken;
            unit.exhausted = unitState.exhausted;
            unit.actionsRemaining = unitState.actionsRemaining;
            unit.actionsUsed = unitState.actionsUsed || [];

            // Update statuses
            if (unitState.statuses) {
                unit.statuses = unitState.statuses.map(s => new StatusInstance(s.effect, s.duration));
            }

            // Update Dindrae-specific state
            if (unit instanceof DindraeUnit) {
                if (unitState.hasTotem !== undefined) unit.hasTotem = unitState.hasTotem;
                if (unitState.isAscended !== undefined) unit.isAscended = unitState.isAscended;
                unit.currentRotation = unitState.currentRotation || 0;
            }

            // Place on grid
            if (unitState.hexPos) {
                if (unit instanceof DindraeUnit) {
                    unit.hexPos = unitState.hexPos;
                    if (unitState.occupiedHexes) {
                        unit.occupiedHexes = unitState.occupiedHexes;
                        for (const hex of unit.occupiedHexes) {
                            this.game.grid.units.set(`${hex.q},${hex.r}`, unit);
                        }
                    } else {
                        unit.placeAt(this.game.grid, unitState.hexPos.q, unitState.hexPos.r,
                            unitState.currentRotation || 0);
                    }
                } else {
                    unit.hexPos = unitState.hexPos;
                    this.game.grid.units.set(`${unitState.hexPos.q},${unitState.hexPos.r}`, unit);
                }
            } else {
                unit.hexPos = null;
            }
        }

        // Update selection
        if (state.selectedUnitId !== undefined && state.selectedUnitId !== null) {
            this.game.selectedUnit = this.game.allUnits.find(u => u.id === state.selectedUnitId) || null;
        } else {
            this.game.selectedUnit = null;
        }
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
