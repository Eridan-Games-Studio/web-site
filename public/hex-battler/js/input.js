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

    handleClick(e) {
        if (this.game.isSpectator) return;

        const pos = this.getCanvasPosition(e);

        // Handle different phases
        switch (this.game.phase) {
            case GamePhase.DINDRAE_SELECT:
                this.handleDindraeSelectClick(pos);
                break;
            case GamePhase.PLACEMENT:
                this.handlePlacementClick(pos);
                break;
            case GamePhase.SELECT_UNIT:
                this.handleSelectUnitClick(pos);
                break;
            case GamePhase.SELECT_ACTION:
                this.handleSelectActionClick(pos);
                break;
            case GamePhase.SELECT_TARGET:
                this.handleSelectTargetClick(pos);
                break;
        }
    }

    handleDindraeSelectClick(pos) {
        // Check card clicks
        if (this.renderer.dindraeCardRects) {
            for (const card of this.renderer.dindraeCardRects) {
                if (this.isInRect(pos, card)) {
                    this.game.selectDindraeUnit(card.unit);
                    return;
                }
            }
        }

        // Check confirm button
        if (this.renderer.confirmBtnRect && this.isInRect(pos, this.renderer.confirmBtnRect)) {
            this.game.confirmDindraeSelection();
        }
    }

    handlePlacementClick(pos) {
        const hexPos = this.game.grid.pixelToHex(pos.x, pos.y);

        // If Client, send to Host
        if (this.game.connectionMode === ConnectionMode.CLIENT && window.app && window.app.multiplayer) {
            if (this.game.currentPlacingUnit) {
                window.app.multiplayer.sendAction({
                    type: 'PLACE_UNIT',
                    unitId: this.game.currentPlacingUnit.id,
                    q: hexPos.q,
                    r: hexPos.r
                });
                // Optimistic placement or wait for sync?
                // Wait for sync to avoid ID conflicts or state mismatch
                return;
            }
        }

        if (this.game.validTargets.some(t => t.q === hexPos.q && t.r === hexPos.r)) {
            this.game.placeUnitManual(hexPos);
        }
    }

    handleSelectUnitClick(pos) {
        // Only allow selecting own units if not AI turn
        if (this.game.playerTeam !== null && this.game.currentTeam !== this.game.playerTeam) {
            return; // AI's turn
        }

        const hexPos = this.game.grid.pixelToHex(pos.x, pos.y);
        const unit = this.game.grid.getUnitAt(hexPos.q, hexPos.r);

        // If Client, send selection to Host
        if (this.game.connectionMode === ConnectionMode.CLIENT && window.app && window.app.multiplayer) {
            if (unit && unit.team === this.game.currentTeam && !unit.exhausted) {
                window.app.multiplayer.sendAction({
                    type: 'SELECT_UNIT',
                    unitId: unit.id
                });
                return;
            }
        }

        if (unit && unit.team === this.game.currentTeam && !unit.exhausted) {
            this.game.selectUnit(unit);
        }
    }

    handleSelectActionClick(pos) {
        // Check action button clicks
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
                // Clicked on selected unit again - maybe show menu
            }
        }
    }

    handleSelectTargetClick(pos) {
        const hexPos = this.game.grid.pixelToHex(pos.x, pos.y);

        // Check if clicking valid target
        const isValid = this.game.validTargets.some(t => t.q === hexPos.q && t.r === hexPos.r);

        if (isValid) {
            this.executeTargetSelection(hexPos);
        } else {
            // Cancel selection
            this.game.selectedAction = null;
            this.game.validTargets = [];
            this.game.phase = GamePhase.SELECT_ACTION;
        }
    }

    executeAction(action) {
        const unit = this.game.selectedUnit;

        // If Client, send immediate actions to Host
        if (this.game.connectionMode === ConnectionMode.CLIENT && window.app && window.app.multiplayer) {
            if (action === null) {
                window.app.multiplayer.sendAction({
                    type: 'ACTION',
                    actionType: 'END_ACTIVATION'
                });
                return;
            }

            const immediateActions = [ActionType.AIM, ActionType.DODGE, ActionType.PEAL_CALL, ActionType.ROTATE, ActionType.ASCEND];
            if (immediateActions.includes(action)) {
                window.app.multiplayer.sendAction({
                    type: 'ACTION',
                    actionType: action,
                    direction: 1 // Default for ROTATE
                });
                return;
            }
        }

        if (action === null) {
            // End Activation
            this.game.endUnitActivation();
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
                break;

            case ActionType.DODGE:
                this.game.executeDodge(unit);
                break;

            case ActionType.PEAL_CALL:
                this.game.executePealCall(unit);
                break;

            case ActionType.THERMAL_GRENADE:
                this.game.selectedAction = ActionType.THERMAL_GRENADE;
                // Get hexes in range 4
                if (unit.hexPos) {
                    this.game.validTargets = this.game.grid.getHexesInRange(unit.hexPos.q, unit.hexPos.r, 4);
                    this.game.phase = GamePhase.SELECT_TARGET;
                }
                break;

            case ActionType.ROTATE:
                this.game.executeRotation(unit, 1);
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
            // Try next attack
            this.selectAttack(index + 1);
        } else {
            this.game.log('No valid attack targets in range!');
            this.game.selectedAction = null;
            this.game.validTargets = [];
        }
    }

    executeTargetSelection(targetPos) {
        const unit = this.game.selectedUnit;

        // If Client, send ACTION to Host
        if (this.game.connectionMode === ConnectionMode.CLIENT && window.app && window.app.multiplayer) {
            window.app.multiplayer.sendAction({
                type: 'ACTION',
                actionType: this.game.selectedAction,
                target: targetPos,
                attackIndex: this.game.selectedAttackIndex,
                // Add specific params if needed (e.g. rotation direction? Defaults to 1 for now)
            });

            // Clear local selection state to avoid confusion? 
            // Or keep it until sync?
            this.game.selectedAction = null;
            this.game.validTargets = [];
            return;
        }

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

        // Check if unit still active
        if (this.game.selectedUnit && this.game.selectedUnit.actionsRemaining > 0) {
            this.game.phase = GamePhase.SELECT_ACTION;
        } else if (this.game.selectedUnit) {
            this.game.endUnitActivation();
        }

        // Check game over
        if (this.game.checkGameOver()) {
            this.game.phase = GamePhase.GAME_OVER;
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
        // Number keys for attack selection
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
