/**
 * Hex Battle Simulator - Input Handler
 * Mouse/touch input handling for game interaction
 */

class InputHandler {
    constructor(canvas, game, renderer) {
        this.canvas = canvas;
        this.game = game;
        this.renderer = renderer;

        this.setupListeners();
    }

    setupListeners() {
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('touchstart', (e) => this.handleTouch(e));
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    getCanvasPosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    // Check if it's this player's turn to act
    isMyTurn() {
        if (this.game.connectionMode === ConnectionMode.LOCAL) return true;
        if (this.game.playerTeam === null) return true; // AI watch mode
        return this.game.currentTeam === this.game.playerTeam;
    }

    handleClick(e) {
        if (this.game.isSpectator) return;

        const pos = this.getCanvasPosition(e);

        switch (this.game.phase) {
            case GamePhase.DINDRAE_SELECT:
                this.handleDindraeSelectClick(pos);
                break;
            case GamePhase.PLACEMENT:
                this.handlePlacementClick(pos);
                break;
            case GamePhase.SELECT_UNIT:
                if (!this.isMyTurn()) return;
                this.handleSelectUnitClick(pos);
                break;
            case GamePhase.SELECT_ACTION:
                if (!this.isMyTurn()) return;
                this.handleSelectActionClick(pos);
                break;
            case GamePhase.SELECT_TARGET:
                if (!this.isMyTurn()) return;
                this.handleSelectTargetClick(pos);
                break;
        }
    }

    handleDindraeSelectClick(pos) {
        if (this.renderer.dindraeCardRects) {
            for (const card of this.renderer.dindraeCardRects) {
                if (this.isInRect(pos, card)) {
                    this.game.selectDindraeUnit(card.unit);
                    return;
                }
            }
        }

        if (this.renderer.confirmBtnRect && this.isInRect(pos, this.renderer.confirmBtnRect)) {
            this.game.confirmDindraeSelection();
        }
    }

    handlePlacementClick(pos) {
        const hexPos = this.game.grid.pixelToHex(pos.x, pos.y);

        // In multiplayer, placement is done locally by each player for their own units.
        // Client places on their local grid, then sends results when done.
        // So both host and client just use placeUnitManual.
        if (this.game.validTargets.some(t => t.q === hexPos.q && t.r === hexPos.r)) {
            this.game.placeUnitManual(hexPos);

            // Host broadcasts after placement actions
            if (this.game.connectionMode === ConnectionMode.HOST && window.app && window.app.multiplayer) {
                // Only broadcast during battle, not during placement setup
            }
        }
    }

    handleSelectUnitClick(pos) {
        const hexPos = this.game.grid.pixelToHex(pos.x, pos.y);
        const unit = this.game.grid.getUnitAt(hexPos.q, hexPos.r);

        if (!unit || unit.team !== this.game.currentTeam || unit.exhausted) return;

        // Client: send selection to host
        if (this.game.connectionMode === ConnectionMode.CLIENT && window.app && window.app.multiplayer) {
            window.app.multiplayer.sendAction({
                type: 'SELECT_UNIT',
                unitId: unit.id
            });
            return;
        }

        // Host or local: select unit directly
        this.game.selectUnit(unit);

        // Host: broadcast after selection
        if (this.game.connectionMode === ConnectionMode.HOST && window.app && window.app.multiplayer) {
            window.app.multiplayer.broadcastState();
        }
    }

    handleSelectActionClick(pos) {
        const buttons = this.renderer.getActionButtonRects();

        for (const btn of buttons) {
            if (this.isInRect(pos, btn) && btn.enabled) {
                this.executeAction(btn.action);
                return;
            }
        }

        // Click on hex to deselect
        const hexPos = this.game.grid.pixelToHex(pos.x, pos.y);
        if (this.game.grid.isValidHex(hexPos.q, hexPos.r)) {
            const unit = this.game.grid.getUnitAt(hexPos.q, hexPos.r);
            if (unit && unit === this.game.selectedUnit) {
                // Clicked on selected unit again
            }
        }
    }

    handleSelectTargetClick(pos) {
        const hexPos = this.game.grid.pixelToHex(pos.x, pos.y);
        const isValid = this.game.validTargets.some(t => t.q === hexPos.q && t.r === hexPos.r);

        if (isValid) {
            this.executeTargetSelection(hexPos);
        } else {
            this.game.selectedAction = null;
            this.game.validTargets = [];
            this.game.phase = GamePhase.SELECT_ACTION;
        }
    }

    executeAction(action) {
        const unit = this.game.selectedUnit;

        // Client: send all actions to host
        if (this.game.connectionMode === ConnectionMode.CLIENT && window.app && window.app.multiplayer) {
            if (action === null) {
                window.app.multiplayer.sendAction({
                    type: 'ACTION',
                    actionType: 'END_ACTIVATION'
                });
                return;
            }

            // Immediate actions (no target selection needed) - send directly
            const immediateActions = [ActionType.AIM, ActionType.DODGE, ActionType.PEAL_CALL, ActionType.ROTATE, ActionType.ASCEND];
            if (immediateActions.includes(action)) {
                window.app.multiplayer.sendAction({
                    type: 'ACTION',
                    actionType: action,
                    direction: 1
                });
                return;
            }

            // Target-selection actions: proceed locally to show valid targets,
            // then send the final action when target is clicked
        }

        if (action === null) {
            this.game.endUnitActivation();
            this._broadcastIfHost();
            return;
        }

        switch (action) {
            case ActionType.MOVE:
                this.game.selectedAction = ActionType.MOVE;
                this.game.validTargets = this.game.getValidMoveTargets(unit);
                if (this.game.validTargets.length > 0) {
                    this.game.phase = GamePhase.SELECT_TARGET;
                } else {
                    this.game.log('No valid move targets!');
                }
                break;

            case ActionType.ATTACK:
                this.selectAttack(0);
                break;

            case ActionType.AIM:
                this.game.executeAim(unit);
                this._broadcastIfHost();
                break;

            case ActionType.DODGE:
                this.game.executeDodge(unit);
                this._broadcastIfHost();
                break;

            case ActionType.PEAL_CALL:
                this.game.executePealCall(unit);
                this._broadcastIfHost();
                break;

            case ActionType.THERMAL_GRENADE:
                this.game.selectedAction = ActionType.THERMAL_GRENADE;
                if (unit.hexPos) {
                    this.game.validTargets = this.game.grid.getHexesInRange(unit.hexPos.q, unit.hexPos.r, 4);
                    this.game.phase = GamePhase.SELECT_TARGET;
                }
                break;

            case ActionType.ROTATE:
                this.game.executeRotation(unit, 1);
                this._broadcastIfHost();
                break;

            case ActionType.TOTEM_BOOM:
                this.game.selectedAction = ActionType.TOTEM_BOOM;
                if (unit.hexPos) {
                    this.game.validTargets = this.game.grid.getHexesInRange(unit.hexPos.q, unit.hexPos.r, 3);
                    this.game.phase = GamePhase.SELECT_TARGET;
                }
                break;

            case ActionType.ASCEND:
                this.game.executeAscension(unit);
                this._broadcastIfHost();
                break;

            case ActionType.DECOUPLE:
                if (unit instanceof LigunUnit) {
                    this.game.selectedAction = ActionType.DECOUPLE;
                    this.game.validTargets = this.game.getValidDecoupleTargets(unit);
                    this.game.phase = GamePhase.SELECT_TARGET;
                }
                break;

            case ActionType.COUPLE:
                if (unit instanceof DhulUnit) {
                    this.game.selectedAction = ActionType.COUPLE;
                    this.game.validTargets = this.game.getValidCoupleTargets(unit);
                    this.game.phase = GamePhase.SELECT_TARGET;
                }
                break;
        }

        // Check if unit still has actions
        if (unit.actionsRemaining === 0) {
            this.game.endUnitActivation();
            this._broadcastIfHost();
        }
    }

    selectAttack(index) {
        const unit = this.game.selectedUnit;
        if (!unit || index >= unit.attacks.length) return;

        this.game.selectedAction = ActionType.ATTACK;
        this.game.selectedAttackIndex = index;
        this.game.validTargets = this.game.getValidAttackTargets(unit, index);

        if (this.game.validTargets.length > 0) {
            this.game.phase = GamePhase.SELECT_TARGET;
        } else if (index < unit.attacks.length - 1) {
            this.selectAttack(index + 1);
        } else {
            this.game.log('No valid attack targets in range!');
            this.game.selectedAction = null;
            this.game.validTargets = [];
        }
    }

    executeTargetSelection(targetPos) {
        const unit = this.game.selectedUnit;

        // Client: send target action to host
        if (this.game.connectionMode === ConnectionMode.CLIENT && window.app && window.app.multiplayer) {
            window.app.multiplayer.sendAction({
                type: 'ACTION',
                actionType: this.game.selectedAction,
                target: targetPos,
                attackIndex: this.game.selectedAttackIndex
            });

            this.game.selectedAction = null;
            this.game.validTargets = [];
            return;
        }

        // Host or local: execute directly
        switch (this.game.selectedAction) {
            case ActionType.MOVE:
                this.game.executeMove(unit, targetPos);
                break;

            case ActionType.ATTACK:
                this.game.executeAttack(unit, targetPos, this.game.selectedAttackIndex);
                break;

            case ActionType.THERMAL_GRENADE:
                this.game.executeThermalGrenade(unit, targetPos);
                break;

            case ActionType.TOTEM_BOOM:
                this.game.executeTotemBoom(unit, targetPos);
                break;

            case ActionType.DECOUPLE:
                this.game.executeDecouple(unit, targetPos);
                break;

            case ActionType.COUPLE:
                const agon = this.game.grid.getUnitAt(targetPos.q, targetPos.r);
                if (agon instanceof AgonUnit) {
                    this.game.executeCouple(unit, agon);
                }
                break;
        }

        this.game.selectedAction = null;
        this.game.validTargets = [];

        if (this.game.selectedUnit && this.game.selectedUnit.actionsRemaining > 0) {
            this.game.phase = GamePhase.SELECT_ACTION;
        } else if (this.game.selectedUnit) {
            this.game.endUnitActivation();
        }

        if (this.game.checkGameOver()) {
            this.game.phase = GamePhase.GAME_OVER;
        }

        this._broadcastIfHost();
    }

    // Helper: broadcast state if we're the host
    _broadcastIfHost() {
        if (this.game.connectionMode === ConnectionMode.HOST && window.app && window.app.multiplayer) {
            window.app.multiplayer.broadcastState();
        }
    }

    handleMouseMove(e) {
        // Future: hover effects
    }

    handleTouch(e) {
        e.preventDefault();
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            this.handleClick({
                clientX: touch.clientX,
                clientY: touch.clientY
            });
        }
    }

    handleKeyDown(e) {
        if (e.key === 'r' || e.key === 'R') {
            if (this.game.phase === GamePhase.GAME_OVER) {
                window.location.reload();
            }
        }
        if (e.key === 'Escape') {
            if (this.game.phase === GamePhase.SELECT_TARGET) {
                this.game.selectedAction = null;
                this.game.validTargets = [];
                this.game.phase = GamePhase.SELECT_ACTION;
            }
        }
        if (e.key >= '1' && e.key <= '9') {
            const index = parseInt(e.key) - 1;
            if (this.game.phase === GamePhase.SELECT_ACTION && this.game.selectedUnit) {
                if (index < this.game.selectedUnit.attacks.length) {
                    this.selectAttack(index);
                }
            }
        }
    }

    isInRect(pos, rect) {
        return pos.x >= rect.x && pos.x <= rect.x + rect.width &&
            pos.y >= rect.y && pos.y <= rect.y + rect.height;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { InputHandler };
}
