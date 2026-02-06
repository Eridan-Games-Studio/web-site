/**
 * Hex Battle Simulator - Canvas Renderer
 * Renders the hex grid, units, and UI elements
 */

class Renderer {
    constructor(canvas, game) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.game = game;

        // Cache for performance
        this.hexPathCache = new Map();
    }

    draw() {
        this.ctx.fillStyle = Colors.DARK_GRAY;
        this.ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

        this.drawGrid();
        this.drawDindraeAuras();
        this.drawHighlights();
        this.drawUnits();
        this.drawUI();
        this.drawCombatLog();

        if (this.game.phase === GamePhase.GAME_OVER) {
            this.drawGameOver();
        }
    }

    drawGrid() {
        this.ctx.strokeStyle = Colors.GRAY;
        this.ctx.lineWidth = 1;

        for (const key of this.game.grid.hexes.keys()) {
            const [q, r] = key.split(',').map(Number);
            const corners = this.game.grid.getHexCorners(q, r);

            this.ctx.beginPath();
            this.ctx.moveTo(corners[0].x, corners[0].y);
            for (let i = 1; i < 6; i++) {
                this.ctx.lineTo(corners[i].x, corners[i].y);
            }
            this.ctx.closePath();
            this.ctx.stroke();
        }
    }

    drawDindraeAuras() {
        if (![GamePhase.SELECT_UNIT, GamePhase.SELECT_ACTION, GamePhase.SELECT_TARGET].includes(this.game.phase)) {
            return;
        }

        for (const unit of this.game.dindraeUnits) {
            if (!unit.isAlive() || !unit.hexPos) continue;

            const auraColor = this._getAuraColor(unit);
            if (!auraColor) continue;

            const auraHexes = unit.getAdjacentHexes(this.game.grid);

            this.ctx.fillStyle = auraColor;
            for (const hex of auraHexes) {
                const corners = this.game.grid.getHexCorners(hex.q, hex.r);
                this.ctx.beginPath();
                this.ctx.moveTo(corners[0].x, corners[0].y);
                for (let i = 1; i < 6; i++) {
                    this.ctx.lineTo(corners[i].x, corners[i].y);
                }
                this.ctx.closePath();
                this.ctx.fill();
            }
        }
    }

    _getAuraColor(unit) {
        const alpha = 0.15;
        switch (unit.element) {
            case DindraeElement.FIRE: return `rgba(255, 100, 50, ${alpha})`;
            case DindraeElement.EARTH: return `rgba(139, 90, 43, ${alpha})`;
            case DindraeElement.WATER: return `rgba(50, 150, 255, ${alpha})`;
            case DindraeElement.AIR: return `rgba(200, 200, 255, ${alpha})`;
            default: return null;
        }
    }

    drawHighlights() {
        for (const pos of this.game.validTargets) {
            const corners = this.game.grid.getHexCorners(pos.q, pos.r);

            let color;
            if (this.game.phase === GamePhase.PLACEMENT) {
                color = this.game.placementTeam === Team.AKVIRA
                    ? 'rgba(100, 150, 255, 0.4)'
                    : 'rgba(255, 150, 100, 0.4)';
            } else if (this.game.selectedAction === ActionType.MOVE) {
                color = Colors.MOVE_HIGHLIGHT;
            } else if ([ActionType.ATTACK, ActionType.THERMAL_GRENADE, ActionType.TOTEM_BOOM].includes(this.game.selectedAction)) {
                color = Colors.ATTACK_HIGHLIGHT;
            } else if (this.game.selectedAction === ActionType.DECOUPLE) {
                color = 'rgba(150, 50, 200, 0.4)';
            } else if (this.game.selectedAction === ActionType.COUPLE) {
                color = 'rgba(50, 200, 200, 0.4)';
            } else {
                color = Colors.HIGHLIGHT;
            }

            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.moveTo(corners[0].x, corners[0].y);
            for (let i = 1; i < 6; i++) {
                this.ctx.lineTo(corners[i].x, corners[i].y);
            }
            this.ctx.closePath();
            this.ctx.fill();

            this.ctx.strokeStyle = color.replace(/[\d.]+\)$/, '1)');
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    }

    drawUnits() {
        const drawnMultiHex = new Set();

        for (const [key, unit] of this.game.grid.units) {
            const [q, r] = key.split(',').map(Number);

            // Skip secondary hexes of multi-hex units
            if (unit instanceof DindraeUnit) {
                if (drawnMultiHex.has(unit.id)) {
                    // Draw hex fill only
                    const corners = this.game.grid.getHexCorners(q, r);
                    this.ctx.fillStyle = unit.getColor();
                    this.ctx.beginPath();
                    this.ctx.moveTo(corners[0].x, corners[0].y);
                    for (let i = 1; i < 6; i++) {
                        this.ctx.lineTo(corners[i].x, corners[i].y);
                    }
                    this.ctx.closePath();
                    this.ctx.fill();
                    this.ctx.strokeStyle = Colors.WHITE;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                    continue;
                }
                drawnMultiHex.add(unit.id);

                // Draw all occupied hexes
                for (const hex of unit.occupiedHexes) {
                    const corners = this.game.grid.getHexCorners(hex.q, hex.r);
                    this.ctx.fillStyle = unit.getColor();
                    this.ctx.beginPath();
                    this.ctx.moveTo(corners[0].x, corners[0].y);
                    for (let i = 1; i < 6; i++) {
                        this.ctx.lineTo(corners[i].x, corners[i].y);
                    }
                    this.ctx.closePath();
                    this.ctx.fill();
                    this.ctx.strokeStyle = Colors.WHITE;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }

            this.drawUnit(unit, { q, r });
        }
    }

    drawUnit(unit, pos) {
        // Skip if this isn't the primary position for Dindrae
        if (unit instanceof DindraeUnit && (!unit.hexPos || unit.hexPos.q !== pos.q || unit.hexPos.r !== pos.r)) {
            return;
        }

        const { x: cx, y: cy } = this.game.grid.hexToPixel(pos.q, pos.r);
        const color = unit.getColor();

        // Selection ring
        if (unit === this.game.selectedUnit) {
            this.ctx.strokeStyle = Colors.YELLOW;
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, HEX_SIZE - 8, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        // Unit circle
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, HEX_SIZE - 12, 0, Math.PI * 2);
        this.ctx.fill();

        // Ascended glow
        if (unit instanceof DindraeUnit && unit.isAscended) {
            this.ctx.strokeStyle = Colors.YELLOW;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, HEX_SIZE - 6, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        // Exhausted indicator
        if (unit.exhausted) {
            this.ctx.strokeStyle = Colors.DARK_GRAY;
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, HEX_SIZE - 12, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        // Health bar
        const healthPct = unit.health / unit.maxHealth;
        const barWidth = HEX_SIZE - 10;
        const barHeight = 6;
        const barX = cx - barWidth / 2;
        const barY = cy + HEX_SIZE - 20;

        this.ctx.fillStyle = Colors.BLACK;
        this.ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);
        this.ctx.fillStyle = Colors.RED;
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        this.ctx.fillStyle = Colors.GREEN;
        this.ctx.fillRect(barX, barY, barWidth * healthPct, barHeight);

        // Unit name
        this.ctx.fillStyle = Colors.WHITE;
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(unit.name.substring(0, 6), cx, cy - 5);

        // HP text
        this.ctx.fillText(unit.health.toString(), cx, cy + 8);

        // Token indicators
        const tokenY = cy - HEX_SIZE + 10;
        if (unit.aimToken) {
            this.ctx.fillStyle = Colors.ORANGE;
            this.ctx.beginPath();
            this.ctx.arc(cx - 8, tokenY, 5, 0, Math.PI * 2);
            this.ctx.fill();
        }
        if (unit.dodgeToken) {
            this.ctx.fillStyle = Colors.CYAN;
            this.ctx.beginPath();
            this.ctx.arc(cx + 8, tokenY, 5, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Dindrae Totem indicator
        if (unit instanceof DindraeUnit && unit.hasTotem) {
            this.ctx.fillStyle = Colors.WHITE;
            this.ctx.beginPath();
            this.ctx.arc(cx, tokenY, 5, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Status effects
        let statusX = cx - 10;
        for (const status of unit.statuses) {
            if (status.effect === StatusEffect.POISON) {
                this.ctx.fillStyle = Colors.GREEN;
            } else if (status.effect === StatusEffect.IMMOBILIZE) {
                this.ctx.fillStyle = Colors.PURPLE;
            } else if (status.effect === StatusEffect.BLIND) {
                this.ctx.fillStyle = Colors.YELLOW;
            } else {
                this.ctx.fillStyle = Colors.GRAY;
            }
            this.ctx.beginPath();
            this.ctx.arc(statusX, cy + HEX_SIZE - 8, 4, 0, Math.PI * 2);
            this.ctx.fill();
            statusX += 10;
        }
    }

    drawUI() {
        if (this.game.phase === GamePhase.DINDRAE_SELECT) {
            this.drawDindraeSelectionUI();
            return;
        }

        if (this.game.phase === GamePhase.PLACEMENT) {
            this.drawPlacementUI();
            return;
        }

        if (this.game.phase === GamePhase.SETUP) {
            // Waiting state (multiplayer setup)
            this.ctx.fillStyle = Colors.YELLOW;
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            const lastLog = this.game.combatLog[this.game.combatLog.length - 1] || 'Setting up...';
            this.ctx.fillText(lastLog, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2);
            return;
        }

        // Turn info
        this.ctx.fillStyle = Colors.WHITE;
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Round ${this.game.currentRound} - ${this.game.currentTeam}'s Turn`, 10, 30);

        this.ctx.font = '16px Arial';
        this.ctx.fillStyle = Colors.LIGHT_GRAY;
        this.ctx.fillText(`Phase: ${this.game.phase}`, 10, 55);

        // Echo Pool
        if (this.game.teamA === Team.DINDRAE || this.game.teamB === Team.DINDRAE) {
            this.drawEchoPool();
        }

        // Selected unit panel
        if (this.game.selectedUnit) {
            this.drawUnitPanel(this.game.selectedUnit, 10, 80);
        }

        // Spectator indicator
        if (this.game.isSpectator) {
            this.ctx.fillStyle = 'rgba(255, 255, 0, 0.8)';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('SPECTATOR MODE', SCREEN_WIDTH / 2, 30);
        }

        // Opponent's turn indicator (multiplayer)
        if (this.game.connectionMode !== ConnectionMode.LOCAL &&
            this.game.playerTeam !== null &&
            this.game.currentTeam !== this.game.playerTeam &&
            !this.game.isSpectator) {
            this.ctx.fillStyle = 'rgba(255, 200, 50, 0.8)';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'right';
            this.ctx.fillText("Opponent's Turn", SCREEN_WIDTH - 10, 55);
        }

        // Connection status
        if (this.game.connectionMode !== ConnectionMode.LOCAL) {
            this.ctx.fillStyle = Colors.GREEN;
            this.ctx.font = '14px Arial';
            this.ctx.textAlign = 'right';
            this.ctx.fillText(`Connected: ${this.game.connectionMode}`, SCREEN_WIDTH - 10, 30);
        }
    }

    drawEchoPool() {
        const pool = this.game.echoPool;
        const barX = SCREEN_WIDTH - 250;
        const barY = 50;
        const barWidth = 200;
        const barHeight = 20;

        // Background
        this.ctx.fillStyle = 'rgba(40, 40, 60, 0.9)';
        this.ctx.fillRect(barX - 5, barY - 25, barWidth + 60, 55);
        this.ctx.strokeStyle = Colors.PURPLE;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(barX - 5, barY - 25, barWidth + 60, 55);

        // Label
        this.ctx.fillStyle = Colors.WHITE;
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Echo Pool', barX, barY - 8);

        // Bar
        this.ctx.fillStyle = Colors.DARK_GRAY;
        this.ctx.fillRect(barX, barY, barWidth, barHeight);

        const fillWidth = (pool.current / pool.cap) * barWidth;
        this.ctx.fillStyle = pool.canAscend() ? Colors.YELLOW : Colors.PURPLE;
        this.ctx.fillRect(barX, barY, fillWidth, barHeight);

        this.ctx.strokeStyle = Colors.WHITE;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(barX, barY, barWidth, barHeight);

        // Threshold marker
        const thresholdX = barX + (pool.ascensionCost / pool.cap) * barWidth;
        this.ctx.strokeStyle = Colors.WHITE;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(thresholdX, barY - 2);
        this.ctx.lineTo(thresholdX, barY + barHeight + 2);
        this.ctx.stroke();

        // Text
        this.ctx.fillStyle = Colors.WHITE;
        this.ctx.font = '12px Arial';
        this.ctx.fillText(`${pool.current}/${pool.cap}`, barX + barWidth + 5, barY + 15);

        // Totems
        const totems = this.game.dindraeTotemsRemaining;
        this.ctx.fillStyle = totems <= 1 ? Colors.RED : Colors.WHITE;
        this.ctx.fillText(`Totems: ${totems}`, barX, barY + 35);
    }

    drawUnitPanel(unit, x, y) {
        const panelWidth = 250;
        const panelHeight = 200;

        // Background
        this.ctx.fillStyle = 'rgba(30, 30, 40, 0.9)';
        this.ctx.fillRect(x, y, panelWidth, panelHeight);
        this.ctx.strokeStyle = unit.getColor();
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, panelWidth, panelHeight);

        // Unit name
        this.ctx.fillStyle = Colors.WHITE;
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(unit.name, x + 10, y + 22);

        // Stats
        this.ctx.font = '12px Arial';
        this.ctx.fillStyle = Colors.LIGHT_GRAY;
        const stats = [
            `HP: ${unit.health}/${unit.maxHealth}`,
            `Move: ${unit.moveSpeed}`,
            `Actions: ${unit.actionsRemaining}/2`,
            `Armor: ${unit.armor ? 'Yes' : 'No'}`
        ];
        stats.forEach((stat, i) => {
            this.ctx.fillText(stat, x + 10, y + 45 + i * 18);
        });

        // Attacks
        this.ctx.fillStyle = Colors.WHITE;
        this.ctx.fillText('Attacks:', x + 10, y + 120);
        this.ctx.fillStyle = Colors.LIGHT_GRAY;
        unit.attacks.forEach((atk, i) => {
            const diceStr = atk.getDiceString();
            this.ctx.fillText(`${i + 1}: ${diceStr} HIT:${atk.hitValue} R:${atk.range}`, x + 10, y + 138 + i * 16);
        });

        // Abilities
        if (unit.abilities.length > 0) {
            this.ctx.fillStyle = Colors.CYAN;
            this.ctx.fillText(`Abilities: ${unit.abilities.slice(0, 2).join(', ')}`, x + 10, y + 185);
        }
    }

    drawPlacementUI() {
        this.ctx.fillStyle = Colors.YELLOW;
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('PLACEMENT PHASE', 10, 30);

        if (this.game.placementTeam) {
            this.ctx.fillStyle = Colors.WHITE;
            this.ctx.font = '18px Arial';
            this.ctx.fillText(`Place your ${this.game.placementTeam} units`, 10, 60);
        }

        if (this.game.currentPlacingUnit) {
            this.drawUnitPanel(this.game.currentPlacingUnit, 10, 90);

            this.ctx.fillStyle = Colors.LIGHT_GRAY;
            this.ctx.font = '14px Arial';
            this.ctx.fillText(`Units remaining: ${this.game.unitsToPlace.length}`, 10, 310);

            this.game.unitsToPlace.forEach((unit, i) => {
                this.ctx.fillStyle = unit === this.game.currentPlacingUnit ? Colors.YELLOW : Colors.LIGHT_GRAY;
                this.ctx.fillText(`${i + 1}. ${unit.name}`, 20, 335 + i * 20);
            });
        }

        this.ctx.fillStyle = Colors.LIGHT_GRAY;
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Click on a highlighted hex to place the current unit', SCREEN_WIDTH / 2, SCREEN_HEIGHT - 30);
    }

    drawDindraeSelectionUI() {
        this.ctx.fillStyle = Colors.PURPLE;
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SELECT YOUR DINDRAE (Choose 3)', SCREEN_WIDTH / 2, 40);

        const count = this.game.dindraeSelected.length;
        this.ctx.fillStyle = count === 3 ? Colors.GREEN : Colors.YELLOW;
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Selected: ${count}/3`, SCREEN_WIDTH / 2, 70);

        // Draw unit cards
        if (this.game.allDindraeOptions) {
            const cardWidth = 280;
            const cardHeight = 180;
            const spacing = 30;
            const startX = (SCREEN_WIDTH - (4 * cardWidth + 3 * spacing)) / 2;
            const cardY = 100;

            this.dindraeCardRects = [];

            this.game.allDindraeOptions.forEach((unit, i) => {
                const cardX = startX + i * (cardWidth + spacing);
                const isSelected = this.game.dindraeSelected.includes(unit);

                // Card background
                this.ctx.fillStyle = isSelected ? 'rgba(60, 60, 80, 0.9)' : 'rgba(30, 30, 40, 0.9)';
                this.ctx.fillRect(cardX, cardY, cardWidth, cardHeight);

                this.ctx.strokeStyle = isSelected ? Colors.GREEN : unit.getColor();
                this.ctx.lineWidth = isSelected ? 4 : 2;
                this.ctx.strokeRect(cardX, cardY, cardWidth, cardHeight);

                // Unit name
                this.ctx.fillStyle = unit.getColor();
                this.ctx.font = 'bold 16px Arial';
                this.ctx.textAlign = 'left';
                this.ctx.fillText(unit.name, cardX + 10, cardY + 25);

                // Size
                this.ctx.fillStyle = Colors.LIGHT_GRAY;
                this.ctx.font = '12px Arial';
                this.ctx.fillText(`Size: ${unit.hexShape.length + 1} hexes`, cardX + 10, cardY + 45);

                // Stats
                this.ctx.fillText(`HP: ${unit.maxHealth}  Move: ${unit.moveSpeed}`, cardX + 10, cardY + 65);
                this.ctx.fillText(`Armor: ${unit.armor ? 'Yes' : 'No'}`, cardX + 10, cardY + 80);

                // Attack
                if (unit.attacks.length > 0) {
                    this.ctx.fillStyle = Colors.ORANGE;
                    this.ctx.fillText(`Attack: ${unit.attacks[0].getDiceString()} R:${unit.attacks[0].range}`, cardX + 10, cardY + 100);
                }

                // Abilities
                this.ctx.fillStyle = Colors.CYAN;
                this.ctx.fillText(`Abilities: ${unit.abilities.slice(0, 2).join(', ')}`, cardX + 10, cardY + 120);

                // Selected indicator
                if (isSelected) {
                    this.ctx.fillStyle = Colors.GREEN;
                    this.ctx.font = 'bold 16px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText('✓ SELECTED', cardX + cardWidth / 2, cardY + cardHeight - 20);
                }

                this.dindraeCardRects.push({ x: cardX, y: cardY, width: cardWidth, height: cardHeight, unit });
            });
        }

        // Confirm button
        if (count === 3) {
            const btnWidth = 200;
            const btnHeight = 50;
            const btnX = SCREEN_WIDTH / 2 - btnWidth / 2;
            const btnY = SCREEN_HEIGHT - 100;

            this.confirmBtnRect = { x: btnX, y: btnY, width: btnWidth, height: btnHeight };

            this.ctx.fillStyle = Colors.GREEN;
            this.ctx.fillRect(btnX, btnY, btnWidth, btnHeight);
            this.ctx.strokeStyle = Colors.WHITE;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(btnX, btnY, btnWidth, btnHeight);

            this.ctx.fillStyle = Colors.BLACK;
            this.ctx.font = 'bold 18px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('CONFIRM SELECTION', btnX + btnWidth / 2, btnY + 32);
        } else {
            this.confirmBtnRect = null;
        }

        this.ctx.fillStyle = Colors.LIGHT_GRAY;
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Click on a unit card to select/deselect it', SCREEN_WIDTH / 2, SCREEN_HEIGHT - 30);
    }

    drawCombatLog() {
        const logX = 10;
        const logY = SCREEN_HEIGHT - 250;
        const logWidth = 350;
        const logHeight = 240;

        // Background
        this.ctx.fillStyle = 'rgba(20, 20, 30, 0.9)';
        this.ctx.fillRect(logX, logY, logWidth, logHeight);
        this.ctx.strokeStyle = Colors.GRAY;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(logX, logY, logWidth, logHeight);

        // Title
        this.ctx.fillStyle = Colors.WHITE;
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Combat Log', logX + 10, logY + 18);

        // Entries
        this.ctx.font = '11px Arial';
        this.ctx.fillStyle = Colors.LIGHT_GRAY;
        const entries = this.game.combatLog.slice(-12);
        entries.forEach((entry, i) => {
            this.ctx.fillText(entry.substring(0, 50), logX + 10, logY + 38 + i * 16);
        });
    }

    drawGameOver() {
        // Overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

        // Winner text
        this.ctx.fillStyle = Colors.YELLOW;
        this.ctx.font = 'bold 64px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${this.game.winner} WINS!`, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 50);

        // Restart instruction
        this.ctx.fillStyle = Colors.WHITE;
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Press R to restart, Q to quit', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 50);
    }

    // Get action button rectangles for click detection
    getActionButtonRects() {
        if (this.game.phase !== GamePhase.SELECT_ACTION || !this.game.selectedUnit) {
            return [];
        }

        const unit = this.game.selectedUnit;
        const buttonX = SCREEN_WIDTH - 200;
        let buttonY = 100;
        const buttonWidth = 180;
        const buttonHeight = 35;
        const spacing = 40;

        const buttons = [];

        const addButton = (action, label, enabled) => {
            buttons.push({
                x: buttonX,
                y: buttonY,
                width: buttonWidth,
                height: buttonHeight,
                action,
                label,
                enabled
            });
            buttonY += spacing;
        };

        addButton(ActionType.MOVE, 'Move', unit.canUseAction(ActionType.MOVE));
        addButton(ActionType.ATTACK, 'Attack', unit.canUseAction(ActionType.ATTACK));
        addButton(ActionType.AIM, 'Aim', unit.canUseAction(ActionType.AIM));
        addButton(ActionType.DODGE, 'Dodge', unit.canUseAction(ActionType.DODGE));

        // Ligun decouple
        if (unit instanceof LigunUnit && unit.actionsRemaining > 0) {
            const targets = this.game.getValidDecoupleTargets(unit);
            if (targets.length > 0) {
                addButton(ActionType.DECOUPLE, 'Decouple', true);
            }
        }

        // Dhul couple
        if (unit instanceof DhulUnit && !unit.isCoupled && unit.actionsRemaining > 0) {
            const targets = this.game.getValidCoupleTargets(unit);
            if (targets.length > 0) {
                addButton(ActionType.COUPLE, 'Couple', true);
            }
        }

        // Special abilities
        if (unit.abilities.includes('Peal Call') && unit.canUseAction(ActionType.DODGE)) {
            addButton(ActionType.PEAL_CALL, 'Peal Call', true);
        }
        if (unit.abilities.includes('Thermal Grenade') && unit.actionsRemaining >= 2) {
            addButton(ActionType.THERMAL_GRENADE, 'Thermal Grenade (2)', true);
        }

        // Dindrae actions
        if (unit instanceof DindraeUnit) {
            const canRotate = unit.canUseAction(ActionType.MOVE) &&
                (unit.canRotate(this.game.grid, 1) || unit.canRotate(this.game.grid, -1));
            if (canRotate) {
                addButton(ActionType.ROTATE, 'Rotate (Move)', true);
            }
            if (unit.hasTotem) {
                addButton(ActionType.TOTEM_BOOM, 'Totem Boom (Free)', true);
            }
            if (!unit.isAscended && this.game.echoPool.canAscend()) {
                addButton(ActionType.ASCEND, `Ascend (${this.game.echoPool.current}/10)`, true);
            }
        }

        addButton(null, 'End Activation', true);

        return buttons;
    }

    drawActionButtons() {
        const buttons = this.getActionButtonRects();

        for (const btn of buttons) {
            let color = btn.enabled ? Colors.GRAY : Colors.DARK_GRAY;
            if (btn.action === this.game.selectedAction) {
                color = Colors.YELLOW;
            }

            this.ctx.fillStyle = color;
            this.ctx.fillRect(btn.x, btn.y, btn.width, btn.height);
            this.ctx.strokeStyle = Colors.WHITE;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(btn.x, btn.y, btn.width, btn.height);

            this.ctx.fillStyle = btn.enabled ? Colors.WHITE : Colors.LIGHT_GRAY;
            this.ctx.font = '14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(btn.label, btn.x + btn.width / 2, btn.y + btn.height / 2 + 5);
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Renderer };
}
