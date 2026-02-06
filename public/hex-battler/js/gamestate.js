/**
 * Hex Battle Simulator - Game State Management
 * Core game logic, phases, turn management, action execution
 */

class GameState {
    constructor() {
        this.grid = new HexGrid(HEX_SIZE);
        this.phase = GamePhase.SETUP;
        this.currentTeam = Team.AKVIRA;
        this.currentRound = 1;

        // Units
        this.akviraUnits = [];
        this.liguniUnits = [];
        this.dindraeUnits = [];
        this.allUnits = [];

        // Liguni specific
        this.agons = [];
        this.dhuls = [];
        this.liguns = [];
        this.firstAgonDied = false;
        this.markedAgon = null;

        // Dindrae specific
        this.allDindraeOptions = [];
        this.echoPool = new EchoPool();
        this.dindraeTotemsRemaining = 3;
        this.dindraeSelected = [];

        // Battle config
        this.teamA = Team.AKVIRA;
        this.teamB = Team.LIGUNI;

        // Selection state
        this.selectedUnit = null;
        this.selectedAction = null;
        this.validTargets = [];
        this.selectedAttackIndex = 0;

        // Placement
        this.unitsToPlace = [];
        this.currentPlacingUnit = null;
        this.placementTeam = null;

        // Combat log
        this.combatLog = [];

        // Game mode
        this.playerTeam = null;
        this.aiDelay = 1000;
        this.lastAiActionTime = 0;

        // Winner
        this.winner = null;

        // Multiplayer
        this.connectionMode = ConnectionMode.LOCAL;
        this.isSpectator = false;
    }

    setupGame(playerTeam = null, teamA = Team.AKVIRA, teamB = Team.LIGUNI) {
        this.playerTeam = playerTeam;
        this.teamA = teamA;
        this.teamB = teamB;

        // Create faction units
        this._createFactionUnits(teamA);
        this._createFactionUnits(teamB);

        // Build allUnits
        this.allUnits = [];
        if (teamA === Team.AKVIRA || teamB === Team.AKVIRA) {
            this.allUnits.push(...this.akviraUnits);
        }
        if (teamA === Team.LIGUNI || teamB === Team.LIGUNI) {
            this.allUnits.push(...this.liguniUnits);
        }
        if (teamA === Team.DINDRAE || teamB === Team.DINDRAE) {
            this.allUnits.push(...this.dindraeUnits);
        }

        this.currentTeam = teamA;

        // Check if Dindrae selection needed
        if (playerTeam !== null) {
            if (playerTeam === Team.DINDRAE) {
                this.startDindraeSelection(playerTeam);
            } else {
                this._autoSelectDindraeForAI();
                this.startPlacementPhase(playerTeam);
            }
        } else {
            // AI vs AI
            this._autoSelectDindraeForAI();
            this.placeUnitsDefault();
            this.phase = GamePhase.SELECT_UNIT;
            this.log(`Battle begins! ${teamA} vs ${teamB}`);
        }
    }

    _createFactionUnits(team) {
        if (team === Team.AKVIRA) {
            this.akviraUnits = createAkviraUnits();
        } else if (team === Team.LIGUNI) {
            const { agons, dhuls, liguns } = createLiguniUnits();
            this.agons = agons;
            this.dhuls = dhuls;
            this.liguns = liguns;
            this.liguniUnits = [...liguns];
        } else if (team === Team.DINDRAE) {
            this.allDindraeOptions = createDindraeOptions();
            this.dindraeUnits = [];
            this.echoPool = new EchoPool();
            this.dindraeTotemsRemaining = 3;
        }
    }

    _autoSelectDindraeForAI() {
        if (this.allDindraeOptions.length > 0) {
            // Randomly select 3 of 4
            const shuffled = [...this.allDindraeOptions].sort(() => Math.random() - 0.5);
            this.dindraeUnits = shuffled.slice(0, 3);
            if (this.teamA === Team.DINDRAE || this.teamB === Team.DINDRAE) {
                this.allUnits.push(...this.dindraeUnits);
            }
        }
    }

    startDindraeSelection(team) {
        this.selectingDindraeTeam = team;
        this.dindraeSelected = [];
        this.phase = GamePhase.DINDRAE_SELECT;
        this.log('Select 3 Dindrae units for battle!');
    }

    selectDindraeUnit(unit) {
        const idx = this.dindraeSelected.indexOf(unit);
        if (idx >= 0) {
            this.dindraeSelected.splice(idx, 1);
            this.log(`Deselected ${unit.name}`);
            return true;
        } else if (this.dindraeSelected.length < 3) {
            this.dindraeSelected.push(unit);
            this.log(`Selected ${unit.name} (${this.dindraeSelected.length}/3)`);
            return true;
        }
        return false;
    }

    confirmDindraeSelection() {
        if (this.dindraeSelected.length !== 3) {
            this.log(`Must select exactly 3 units`);
            return false;
        }
        this.dindraeUnits = [...this.dindraeSelected];
        this.allUnits.push(...this.dindraeUnits);
        this.startPlacementPhase(this.selectingDindraeTeam);
        return true;
    }

    getDeploymentZone(team) {
        const validHexes = [];
        const targetRows = (team === this.teamA) ? [-5, -4] : [4, 5];

        for (const key of this.grid.hexes.keys()) {
            const [q, r] = key.split(',').map(Number);
            if (targetRows.includes(r)) {
                validHexes.push({ q, r });
            }
        }
        return validHexes;
    }

    getAvailableDeploymentHexes(team) {
        return this.getDeploymentZone(team).filter(pos =>
            !this.grid.units.has(`${pos.q},${pos.r}`)
        );
    }

    startPlacementPhase(team) {
        this.placementTeam = team;
        this.phase = GamePhase.PLACEMENT;

        this.unitsToPlace = [...this._getFactionUnits(team)];

        // Auto-place enemy
        // Auto-place enemy ONLY if:
        // 1. We are NOT a Host (so local game vs AI or hotseat)
        // 2. OR we are Host but playing against AI (handled by not connecting? No, gamestate doesn't know connection status easily)
        // Ideally: In Multiplayer HOST mode, we do NOT auto-place the enemy (Client).
        // In Multiplayer CLIENT mode, we do NOT auto-place the enemy (Host) either (handled below by Client logic).

        if (this.connectionMode !== ConnectionMode.HOST) {
            const enemyTeam = this.getOtherTeam(team);
            this._placeTeamUnits(enemyTeam, team === this.teamB);
        }

        this.currentPlacingUnit = this.unitsToPlace[0] || null;
        this.validTargets = this.getAvailableDeploymentHexes(team);

        this.log(`Placement Phase: Place your ${team} units!`);
    }

    placeUnitManual(pos) {
        if (!this.currentPlacingUnit || !this.validTargets.some(t => t.q === pos.q && t.r === pos.r)) {
            return false;
        }

        if (this.currentPlacingUnit instanceof DindraeUnit) {
            if (!this.currentPlacingUnit.canFitAt(this.grid, pos.q, pos.r)) {
                this.log(`Cannot place ${this.currentPlacingUnit.name} there`);
                return false;
            }
            this.currentPlacingUnit.placeAt(this.grid, pos.q, pos.r);
        } else {
            this.grid.placeUnit(this.currentPlacingUnit, pos.q, pos.r);
        }

        this.log(`Placed ${this.currentPlacingUnit.name} at (${pos.q}, ${pos.r})`);

        const idx = this.unitsToPlace.indexOf(this.currentPlacingUnit);
        if (idx >= 0) this.unitsToPlace.splice(idx, 1);

        if (this.unitsToPlace.length === 0) {
            this.finishPlacement();
            return true;
        }

        this.currentPlacingUnit = this.unitsToPlace[0];
        this.validTargets = this.getAvailableDeploymentHexes(this.placementTeam);
        return true;
    }

    placeSpecificUnit(unitId, q, r) {
        // Find unit by ID
        const units = this._getFactionUnits(this.teamA).concat(this._getFactionUnits(this.teamB));
        const unit = units.find(u => u.id === unitId);

        if (!unit) {
            console.error(`Unit not found for placement: ${unitId}`);
            return false;
        }

        if (unit instanceof DindraeUnit) {
            if (!unit.canFitAt(this.grid, q, r)) return false;
            unit.placeAt(this.grid, q, r);
        } else {
            this.grid.placeUnit(unit, q, r);
        }

        this.log(`Placed ${unit.name} at (${q}, ${r})`);
        return true;
    }

    finishPlacement() {
        this.phase = GamePhase.SELECT_UNIT;
        this.currentPlacingUnit = null;
        this.unitsToPlace = [];
        this.validTargets = [];
        this.placementTeam = null;
        this.log(`Battle begins! ${this.teamA} vs ${this.teamB}`);
    }

    placeUnitsDefault() {
        this._placeTeamUnits(this.teamA, true);
        this._placeTeamUnits(this.teamB, false);
    }

    _placeTeamUnits(team, isTop) {
        let positions;
        if (isTop) {
            positions = team === Team.DINDRAE
                ? [{ q: -4, r: -4 }, { q: -2, r: -4 }, { q: 0, r: -4 }, { q: 2, r: -4 }]
                : [{ q: -1, r: -4 }, { q: 1, r: -4 }, { q: 0, r: -5 }, { q: 2, r: -5 }];
        } else {
            positions = team === Team.DINDRAE
                ? [{ q: -3, r: 4 }, { q: -1, r: 4 }, { q: 1, r: 3 }, { q: -4, r: 3 }]
                : [{ q: -1, r: 4 }, { q: 1, r: 4 }, { q: -2, r: 5 }, { q: 0, r: 5 }];
        }

        const units = this._getFactionUnits(team);
        for (let i = 0; i < units.length && i < positions.length; i++) {
            const pos = positions[i];
            if (units[i] instanceof DindraeUnit) {
                if (units[i].canFitAt(this.grid, pos.q, pos.r)) {
                    units[i].placeAt(this.grid, pos.q, pos.r);
                }
            } else {
                this.grid.placeUnit(units[i], pos.q, pos.r);
            }
        }
    }

    _getFactionUnits(team) {
        switch (team) {
            case Team.AKVIRA: return this.akviraUnits;
            case Team.LIGUNI: return this.liguniUnits;
            case Team.DINDRAE: return this.dindraeUnits;
            default: return [];
        }
    }

    log(message) {
        this.combatLog.push(message);
        if (this.combatLog.length > 15) {
            this.combatLog.shift();
        }
        console.log(message);
    }

    getTeamUnits(team) {
        switch (team) {
            case Team.AKVIRA: return this.akviraUnits.filter(u => u.isAlive() && u.hexPos);
            case Team.LIGUNI: return this.liguniUnits.filter(u => u.isAlive() && u.hexPos);
            case Team.DINDRAE: return this.dindraeUnits.filter(u => u.isAlive() && u.hexPos);
            default: return [];
        }
    }

    getActivatableUnits(team) {
        return this.getTeamUnits(team).filter(u => !u.exhausted);
    }

    getOtherTeam(team) {
        return team === this.teamA ? this.teamB : this.teamA;
    }

    switchTurn() {
        this.currentTeam = this.getOtherTeam(this.currentTeam);

        if (!this.getActivatableUnits(this.currentTeam).length) {
            const otherTeam = this.getOtherTeam(this.currentTeam);
            if (!this.getActivatableUnits(otherTeam).length) {
                this.startNewRound();
            } else {
                this.currentTeam = otherTeam;
            }
        }

        this.phase = GamePhase.SELECT_UNIT;
        this.selectedUnit = null;
        this.selectedAction = null;
        this.validTargets = [];
    }

    startNewRound() {
        this.currentRound++;
        this.log(`Round ${this.currentRound} begins!`);

        for (const unit of this.allUnits) {
            if (unit.isAlive()) {
                unit.exhausted = false;
                unit.actionsRemaining = 2;
                unit.actionsUsed = [];
            }
        }

        this.currentTeam = this.teamA;
        this.phase = GamePhase.SELECT_UNIT;
    }

    selectUnit(unit) {
        if (unit.team !== this.currentTeam || unit.exhausted) return;

        this.selectedUnit = unit;
        unit.startActivation(this.currentRound);
        this.phase = GamePhase.SELECT_ACTION;
        this.log(`${unit.name} activates!`);

        if (unit instanceof DindraeUnit) {
            this.applyDindraeAuras(unit);
        }
    }

    applyDindraeAuras(dindra) {
        if (!dindra.hexPos) return;

        const adjacentHexes = dindra.getAdjacentHexes(this.grid);

        for (const hex of adjacentHexes) {
            const target = this.grid.getUnitAt(hex.q, hex.r);
            if (!target || target === dindra) continue;

            const isAlly = target.team === Team.DINDRAE;
            const isEnemy = target.team !== Team.DINDRAE;

            if (dindra.element === DindraeElement.FIRE) {
                if (isAlly) {
                    if (!target.auraBonusDice.some(d => d[0] === 1 && d[1] === 10)) {
                        target.auraBonusDice.push([1, 10]);
                        this.log(`  Fire Aura: ${target.name} gains +1d10 damage!`);
                    }
                } else if (isEnemy) {
                    const dmg = target.takeDamage(1);
                    if (dmg > 0) {
                        this.log(`  Fire Aura: ${target.name} takes 1 damage!`);
                        if (target instanceof DindraeUnit) {
                            this.echoPool.addEcho(dmg);
                        }
                        if (!target.isAlive()) {
                            this.handleUnitDeath(target);
                        }
                    }
                }
            } else if (dindra.element === DindraeElement.EARTH) {
                if (isAlly) {
                    if (target.auraDamageNegation < 1) {
                        target.auraDamageNegation = 1;
                        this.log(`  Earth Aura: ${target.name} negates 1 damage!`);
                    }
                } else if (isEnemy) {
                    target.auraMovementPenalty = Math.max(target.auraMovementPenalty, 2);
                    this.log(`  Earth Aura: ${target.name} has -2 movement!`);
                }
            } else if (dindra.element === DindraeElement.WATER) {
                if (isAlly && target instanceof DindraeUnit) {
                    if (target.health < target.maxHealth) {
                        target.health = Math.min(target.maxHealth, target.health + 1);
                        this.log(`  Water Aura: ${target.name} regenerates 1 HP!`);
                    }
                } else if (isEnemy) {
                    target.dodgeToken = false;
                    this.log(`  Water Aura: ${target.name} cannot Dodge!`);
                }
            } else if (dindra.element === DindraeElement.AIR) {
                if (isAlly) {
                    if (target.auraBonusMovement < 1) {
                        target.auraBonusMovement = 1;
                        this.log(`  Air Aura: ${target.name} gains +1 movement!`);
                    }
                    if (dindra.isAscended && dindra.abilities.includes('Haste Aura')) {
                        if (target.auraBonusRange < 1) {
                            target.auraBonusRange = 1;
                            this.log(`  Haste Aura: ${target.name} gains +1 range!`);
                        }
                    }
                } else if (isEnemy) {
                    target.aimToken = false;
                    target.auraMovementPenalty = Math.max(target.auraMovementPenalty, 1);
                    this.log(`  Air Aura: ${target.name} cannot Aim, -1 movement!`);
                }
            }
        }
    }

    getValidMoveTargets(unit) {
        if (!unit.hexPos) return [];

        let moveSpeed = unit.moveSpeed;
        moveSpeed += unit.auraBonusMovement;
        moveSpeed -= unit.auraMovementPenalty;
        moveSpeed = Math.max(0, moveSpeed);

        if (unit.hasStatus(StatusEffect.IMMOBILIZE)) return [];

        const canPass = unit.abilities.includes('Ethereal');

        if (unit instanceof DindraeUnit) {
            return this._getDindraeReachableHexes(unit, moveSpeed);
        }

        return this.grid.getReachableHexes(unit.hexPos.q, unit.hexPos.r, moveSpeed, canPass);
    }

    _getDindraeReachableHexes(unit, moveSpeed) {
        if (!unit.hexPos) return [];

        const startPos = unit.hexPos;
        const visited = new Map();
        visited.set(`${startPos.q},${startPos.r}`, 0);
        const frontier = [startPos];
        const reachable = [];

        while (frontier.length > 0) {
            const current = frontier.shift();
            const currentCost = visited.get(`${current.q},${current.r}`);

            if (currentCost >= moveSpeed) continue;

            for (const neighbor of this.grid.getNeighbors(current.q, current.r)) {
                const key = `${neighbor.q},${neighbor.r}`;
                if (visited.has(key)) continue;

                if (unit.canFitAt(this.grid, neighbor.q, neighbor.r)) {
                    visited.set(key, currentCost + 1);
                    frontier.push(neighbor);
                    reachable.push(neighbor);
                }
            }
        }

        return reachable;
    }

    getValidAttackTargets(unit, attackIndex) {
        if (!unit.hexPos || attackIndex >= unit.attacks.length) return [];

        const attack = unit.attacks[attackIndex];
        const effectiveRange = attack.range + unit.auraBonusRange;

        let originHexes = [unit.hexPos];
        if (unit instanceof DindraeUnit) {
            originHexes = unit.getAllOccupiedHexes();
        }

        const targets = new Set();

        for (const origin of originHexes) {
            const possible = this.grid.getHexesInRange(origin.q, origin.r, effectiveRange);

            for (const pos of possible) {
                const target = this.grid.getUnitAt(pos.q, pos.r);
                if (!target || target === unit || target.team === unit.team) continue;
                if (!target.isAlive()) continue;

                if (this.grid.hasLineOfSight(origin.q, origin.r, pos.q, pos.r, unit)) {
                    targets.add(`${pos.q},${pos.r}`);
                }
            }
        }

        return Array.from(targets).map(k => {
            const [q, r] = k.split(',').map(Number);
            return { q, r };
        });
    }

    executeMove(unit, targetPos) {
        const oldPos = unit.hexPos;

        if (unit instanceof DindraeUnit) {
            unit.moveTo(this.grid, targetPos.q, targetPos.r);
        } else {
            this.grid.moveUnit(unit, targetPos.q, targetPos.r);
        }

        unit.useAction(ActionType.MOVE);
        this.log(`${unit.name} moves from (${oldPos?.q},${oldPos?.r}) to (${targetPos.q},${targetPos.r})`);
    }

    executeAttack(attacker, targetPos, attackIndex) {
        const defender = this.grid.getUnitAt(targetPos.q, targetPos.r);
        if (!defender) return 0;

        const attack = attacker.attacks[attackIndex];
        const weakened = defender.abilities.includes('Blur');

        let numDiceOverride = null;
        if (attack.diminishing) {
            numDiceOverride = attacker.health;
        }

        let { hits, rolls } = attack.roll(numDiceOverride, weakened);

        // Fire Aura bonus dice
        for (const [num, sides] of attacker.auraBonusDice) {
            for (let i = 0; i < num; i++) {
                const bonusRoll = Math.floor(Math.random() * sides) + 1;
                rolls.push(bonusRoll);
                if (bonusRoll >= attack.hitValue) hits++;
                this.log(`  Fire Aura bonus: d${sides} = ${bonusRoll}`);
            }
        }

        // Aim token rerolls
        if (attacker.aimToken && hits < rolls.length) {
            const misses = rolls.filter(r => r < attack.hitValue);
            const rerollCount = Math.min(2, misses.length);
            if (rerollCount > 0) {
                const rerolled = [];
                for (let i = 0; i < rerollCount; i++) {
                    const newRoll = Math.floor(Math.random() * attack.dice[0][1]) + 1;
                    if (newRoll >= attack.hitValue) hits++;
                    rerolled.push(newRoll);
                }
                attacker.aimToken = false;
                this.log(`  ${attacker.name} uses Aim token, rerolls: [${rerolled.join(', ')}]`);
            }
        }

        // Formation Flying bonus
        if (attacker.abilities.includes('Formation Flying') && attacker.hexPos) {
            for (const neighbor of this.grid.getNeighbors(attacker.hexPos.q, attacker.hexPos.r)) {
                const ally = this.grid.getUnitAt(neighbor.q, neighbor.r);
                if (ally && ally.team === attacker.team && ally !== attacker) {
                    hits++;
                    this.log(`  Formation Flying: +1 damage!`);
                    break;
                }
            }
        }

        // Blind effect
        if (attacker.hasStatus(StatusEffect.BLIND) && hits > 0) {
            hits--;
            this.log(`  ${attacker.name} is Blinded: -1 damage`);
        }

        // Long Shot
        if (attacker.abilities.includes('Long Shot')) {
            const distance = this.grid.hexDistance(attacker.hexPos.q, attacker.hexPos.r, targetPos.q, targetPos.r);
            if (distance <= 1) {
                hits = 0;
                this.log(`  Long Shot: Too close to deal damage!`);
            }
        }

        // Apply damage
        const pierce = attack.pierce || attacker.abilities.includes('Pierce');
        const damageDealt = defender.takeDamage(hits, pierce);

        // Echo generation
        if (defender instanceof DindraeUnit && damageDealt > 0) {
            this.echoPool.addEcho(damageDealt);
            this.log(`  Echo generated: +${damageDealt} (Pool: ${this.echoPool.current}/${this.echoPool.cap})`);
        }

        this.log(`${attacker.name} attacks ${defender.name}!`);
        this.log(`  Rolls: [${rolls.join(', ')}] -> ${hits} hits`);
        if (defender.armor && !pierce) this.log(`  Armor blocks 1 hit`);
        if (defender.dodgeToken) this.log(`  ${defender.name} uses Dodge - attack negated!`);
        this.log(`  ${defender.name} takes ${damageDealt} damage (${defender.health}/${defender.maxHealth} HP)`);

        // Status effects
        if (damageDealt > 0) {
            if (attack.poison || attacker.abilities.includes('Poison')) {
                defender.addStatus(StatusEffect.POISON);
                this.log(`  ${defender.name} is Poisoned!`);
            }
            if (attack.immobilize || attacker.abilities.includes('Immobilize')) {
                defender.addStatus(StatusEffect.IMMOBILIZE);
                this.log(`  ${defender.name} is Immobilized!`);
            }
            if (attacker.abilities.includes('Paralyze')) {
                defender.paralyzedActions = 1;
                this.log(`  ${defender.name} is Paralyzed!`);
            }
            if (attacker.abilities.includes('Blind')) {
                defender.addStatus(StatusEffect.BLIND);
                this.log(`  ${defender.name} is Blinded!`);
            }
            if (attack.push > 0) {
                this.executePush(attacker, defender, attack.push);
            }
        }

        // Splash 1
        if (attacker.abilities.includes('Splash 1')) {
            for (const neighbor of this.grid.getNeighbors(targetPos.q, targetPos.r)) {
                const splashTarget = this.grid.getUnitAt(neighbor.q, neighbor.r);
                if (splashTarget && splashTarget.team !== attacker.team && splashTarget !== defender && splashTarget.isAlive()) {
                    const splashDmg = splashTarget.takeDamage(1);
                    if (splashDmg > 0) {
                        this.log(`  Splash 1: ${splashTarget.name} takes ${splashDmg} damage!`);
                        if (splashTarget instanceof DindraeUnit) {
                            this.echoPool.addEcho(splashDmg);
                        }
                        if (!splashTarget.isAlive()) {
                            this.handleUnitDeath(splashTarget);
                        }
                    }
                }
            }
        }

        attacker.useAction(ActionType.ATTACK);

        if (!defender.isAlive()) {
            this.handleUnitDeath(defender);
        }

        return damageDealt;
    }

    executePush(pusher, target, distance) {
        if (!pusher.hexPos || !target.hexPos) return;

        let dq = target.hexPos.q - pusher.hexPos.q;
        let dr = target.hexPos.r - pusher.hexPos.r;

        if (dq !== 0) dq = Math.sign(dq);
        if (dr !== 0) dr = Math.sign(dr);

        let tq = target.hexPos.q, tr = target.hexPos.r;
        for (let i = 0; i < distance; i++) {
            const newQ = tq + dq, newR = tr + dr;
            if (this.grid.isValidHex(newQ, newR) && !this.grid.getUnitAt(newQ, newR)) {
                this.grid.moveUnit(target, newQ, newR);
                tq = newQ; tr = newR;
                this.log(`  ${target.name} is pushed to (${newQ}, ${newR})`);
            } else {
                break;
            }
        }
    }

    handleUnitDeath(unit) {
        this.log(`${'!'.repeat(20)}`);
        this.log(`${unit.name} has been destroyed!`);

        if (unit instanceof DindraeUnit) {
            unit.removeFromGrid(this.grid);
        } else {
            this.grid.removeUnit(unit);
        }

        const enemyTeam = this.getOtherTeam(unit.team);

        // Check win conditions
        if (unit.team === Team.AKVIRA) {
            if (unit.name === 'Avian Blackbeak') {
                this.winner = enemyTeam;
                this.phase = GamePhase.GAME_OVER;
                this.log(`Avian Blackbeak falls! ${enemyTeam} WINS!`);
            }
        } else if (unit.team === Team.LIGUNI) {
            let isAgonDeath = false;
            let deadAgon = null;

            if (unit instanceof LigunUnit) {
                isAgonDeath = true;
                deadAgon = unit.agon;
                unit.agon.health = 0;
            } else if (unit instanceof AgonUnit) {
                isAgonDeath = true;
                deadAgon = unit;
            }

            if (isAgonDeath && deadAgon) {
                if (!this.firstAgonDied) {
                    this.firstAgonDied = true;
                    const remainingAgons = this.agons.filter(a => a.health > 0 && a !== deadAgon);
                    if (remainingAgons.length) {
                        this.markedAgon = remainingAgons[Math.floor(Math.random() * remainingAgons.length)];
                        this.log(`First Agon destroyed! Secret marked Agon selected...`);
                    } else {
                        this.winner = enemyTeam;
                        this.phase = GamePhase.GAME_OVER;
                        this.log(`All Agons destroyed! ${enemyTeam} WINS!`);
                    }
                } else if (deadAgon === this.markedAgon) {
                    this.winner = enemyTeam;
                    this.phase = GamePhase.GAME_OVER;
                    this.log(`The marked Agon falls! ${enemyTeam} WINS!`);
                }
            }
        } else if (unit.team === Team.DINDRAE) {
            if (unit instanceof DindraeUnit && unit.hasTotem) {
                this.dindraeTotemsRemaining--;
                this.log(`Dindrae Totem lost! (${this.dindraeTotemsRemaining} remaining)`);

                if (this.dindraeTotemsRemaining <= 0) {
                    this.winner = enemyTeam;
                    this.phase = GamePhase.GAME_OVER;
                    this.log(`All Dindrae Totems lost! ${enemyTeam} WINS!`);
                }
            }

            // Water's Last Standing Ascension
            if (this.phase !== GamePhase.GAME_OVER) {
                const livingDindrae = this.dindraeUnits.filter(u => u.isAlive());
                for (const d of livingDindrae) {
                    if (d.element === DindraeElement.WATER && !d.isAscended && livingDindrae.length === 1) {
                        this.log(`${d.name} is the last Dindrae standing!`);
                        this.executeAscension(d);
                    }
                }
            }
        }

        // Remove from lists
        const removeFromList = (list, unit) => {
            const idx = list.indexOf(unit);
            if (idx >= 0) list.splice(idx, 1);
        };

        removeFromList(this.allUnits, unit);
        removeFromList(this.akviraUnits, unit);
        removeFromList(this.liguniUnits, unit);
        removeFromList(this.dindraeUnits, unit);
    }

    executeAim(unit) {
        unit.aimToken = true;
        unit.useAction(ActionType.AIM);
        this.log(`${unit.name} takes Aim (reroll up to 2 dice)`);
    }

    executeDodge(unit) {
        unit.dodgeToken = true;
        unit.useAction(ActionType.DODGE);
        this.log(`${unit.name} prepares to Dodge (cancel next attack)`);
    }

    executeRotation(unit, direction = 1) {
        if (!(unit instanceof DindraeUnit)) return false;
        if (unit.rotate(this.grid, direction)) {
            unit.useAction(ActionType.MOVE);
            const dirName = direction === 1 ? 'clockwise' : 'counter-clockwise';
            this.log(`${unit.name} rotates ${dirName}`);
            return true;
        }
        return false;
    }

    executePealCall(unit) {
        if (!unit.hexPos) return;

        const affected = [];
        for (const pos of this.grid.getHexesInRange(unit.hexPos.q, unit.hexPos.r, 2)) {
            const target = this.grid.getUnitAt(pos.q, pos.r);
            if (target && target.team === unit.team && target !== unit) {
                target.dodgeToken = true;
                affected.push(target.name);
            }
        }

        unit.useAction(ActionType.DODGE);
        this.log(`${unit.name} uses Peal Call!`);
        if (affected.length) {
            this.log(`  Dodge granted to: ${affected.join(', ')}`);
        }
    }

    executeThermalGrenade(unit, targetPos) {
        const roll = Math.floor(Math.random() * 12) + 1;
        this.log(`${unit.name} throws Thermal Grenade at (${targetPos.q}, ${targetPos.r})!`);
        this.log(`  Roll: ${roll}`);

        if (roll >= 6) {
            const affectedHexes = [targetPos, ...this.grid.getNeighbors(targetPos.q, targetPos.r)];
            for (const hex of affectedHexes) {
                const target = this.grid.getUnitAt(hex.q, hex.r);
                if (target && target.team !== unit.team) {
                    const dmg = target.takeDamage(1);
                    this.log(`  ${target.name} takes ${dmg} damage!`);
                    if (!target.isAlive()) {
                        this.handleUnitDeath(target);
                    }
                }
            }
        } else {
            this.log(`  Grenade fizzles!`);
        }

        unit.useAction(ActionType.ATTACK);
        unit.useAction(ActionType.MOVE);
    }

    executeTotemBoom(unit, targetPos) {
        if (!(unit instanceof DindraeUnit) || !unit.hasTotem) return;

        unit.hasTotem = false;
        this.dindraeTotemsRemaining--;
        this.log(`${unit.name} deploys Totem at (${targetPos.q}, ${targetPos.r})!`);

        const range = unit.element === DindraeElement.AIR ? 4 :
            unit.element === DindraeElement.WATER ? 3 : 2;
        const affected = [targetPos, ...this.grid.getHexesInRange(targetPos.q, targetPos.r, range)];

        for (const hex of affected) {
            const target = this.grid.getUnitAt(hex.q, hex.r);
            if (!target) continue;

            if (unit.element === DindraeElement.FIRE && target.team !== Team.DINDRAE) {
                const dmg = target.takeDamage(3);
                this.log(`  Fire Totem: ${target.name} takes ${dmg} damage!`);
                if (!target.isAlive()) this.handleUnitDeath(target);
            } else if (unit.element === DindraeElement.EARTH && target.team !== Team.DINDRAE) {
                target.addStatus(StatusEffect.IMMOBILIZE);
                const dmg = target.takeDamage(1);
                this.log(`  Earth Totem: ${target.name} immobilized, takes ${dmg} damage!`);
                if (!target.isAlive()) this.handleUnitDeath(target);
            } else if (unit.element === DindraeElement.WATER) {
                if (target.team === Team.DINDRAE && target instanceof DindraeUnit) {
                    const heal = Math.min(3, target.maxHealth - target.health);
                    target.health += heal;
                    if (heal > 0) this.log(`  Water Totem: ${target.name} heals ${heal} HP!`);
                } else if (target.team !== Team.DINDRAE) {
                    this.log(`  Water Totem: ${target.name} deals -2 damage this round!`);
                }
            } else if (unit.element === DindraeElement.AIR && target.team !== Team.DINDRAE) {
                this.log(`  Air Totem: ${target.name} can be repositioned!`);
            }
        }

        if (this.dindraeTotemsRemaining <= 0) {
            this.winner = this.getOtherTeam(Team.DINDRAE);
            this.phase = GamePhase.GAME_OVER;
            this.log('All Dindrae Totems lost! DINDRAE LOSES!');
        }
    }

    executeAscension(unit) {
        if (!(unit instanceof DindraeUnit) || unit.isAscended) return false;

        // Water's Last Standing
        if (unit.element === DindraeElement.WATER) {
            const livingDindrae = this.dindraeUnits.filter(u => u.isAlive());
            if (livingDindrae.length === 1 && livingDindrae[0] === unit) {
                this.log(`${unit.name} is the last Dindrae standing - FREE ASCENSION!`);
                unit.ascend(true);
                return true;
            }
        }

        if (!this.echoPool.canAscend()) {
            this.log(`Not enough Echo! (${this.echoPool.current}/${this.echoPool.ascensionCost})`);
            return false;
        }

        this.echoPool.spendForAscension();
        this.log(`${unit.name} ASCENDS! (Echo: ${this.echoPool.current}/${this.echoPool.cap})`);

        unit.ascend();

        if (unit.element === DindraeElement.FIRE) {
            this.log(`  Fire Ascension: Attacks now Range 3!`);
        } else if (unit.element === DindraeElement.EARTH) {
            this.log(`  Earth Ascension: STAMPEDE triggered!`);
        } else if (unit.element === DindraeElement.WATER) {
            this.log(`  Water Ascension: Gains offensive attack!`);
        } else if (unit.element === DindraeElement.AIR) {
            this.log(`  Air Ascension: +2 movement, allies in aura +1 range!`);
        }

        return true;
    }

    getValidDecoupleTargets(ligun) {
        if (!(ligun instanceof LigunUnit) || !ligun.hexPos) return [];
        const dhul = ligun.dhul;
        return this.grid.getReachableHexes(ligun.hexPos.q, ligun.hexPos.r, dhul.moveSpeed,
            dhul.abilities.includes('Ethereal'));
    }

    getValidCoupleTargets(dhul) {
        if (!(dhul instanceof DhulUnit) || dhul.isCoupled || !dhul.hexPos) return [];
        const targets = [];
        for (const neighbor of this.grid.getNeighbors(dhul.hexPos.q, dhul.hexPos.r)) {
            const unit = this.grid.getUnitAt(neighbor.q, neighbor.r);
            if (unit instanceof AgonUnit && !unit.isCoupled) {
                targets.push(neighbor);
            }
        }
        return targets;
    }

    executeDecouple(ligun, dhulTargetPos) {
        if (!(ligun instanceof LigunUnit)) return;

        const agon = ligun.agon;
        const dhul = ligun.dhul;
        const originalPos = ligun.hexPos;

        this.grid.removeUnit(ligun);

        const removeFromList = (list, unit) => {
            const idx = list.indexOf(unit);
            if (idx >= 0) list.splice(idx, 1);
        };

        removeFromList(this.liguniUnits, ligun);
        removeFromList(this.allUnits, ligun);
        removeFromList(this.liguns, ligun);

        agon.isCoupled = false;
        agon.coupledDhul = null;
        dhul.isCoupled = false;
        dhul.coupledAgon = null;

        this.grid.placeUnit(agon, originalPos.q, originalPos.r);
        agon.exhausted = false;
        agon.actionsRemaining = 2;
        agon.actionsUsed = [];

        this.grid.placeUnit(dhul, dhulTargetPos.q, dhulTargetPos.r);

        this.liguniUnits.push(agon, dhul);
        this.allUnits.push(agon, dhul);

        dhul.exhausted = false;
        dhul.actionsRemaining = 1;
        dhul.actionsUsed = [ActionType.MOVE];

        this.log(`${ligun.name} decouples!`);
        this.log(`  ${agon.name} stays at (${originalPos.q}, ${originalPos.r}) (ready to activate)`);
        this.log(`  ${dhul.name} moves to (${dhulTargetPos.q}, ${dhulTargetPos.r}) (1 action remaining)`);

        this.selectedUnit = dhul;
    }

    executeCouple(dhul, agon) {
        if (dhul.isCoupled || agon.isCoupled) return;

        const agonPos = agon.hexPos;

        this.grid.removeUnit(dhul);
        this.grid.removeUnit(agon);

        const removeFromList = (list, unit) => {
            const idx = list.indexOf(unit);
            if (idx >= 0) list.splice(idx, 1);
        };

        removeFromList(this.liguniUnits, dhul);
        removeFromList(this.liguniUnits, agon);
        removeFromList(this.allUnits, dhul);
        removeFromList(this.allUnits, agon);

        agon.isCoupled = true;
        agon.coupledDhul = dhul;
        dhul.isCoupled = true;
        dhul.coupledAgon = agon;

        const ligun = new LigunUnit(agon, dhul);
        this.grid.placeUnit(ligun, agonPos.q, agonPos.r);

        this.liguniUnits.push(ligun);
        this.allUnits.push(ligun);
        this.liguns.push(ligun);

        dhul.useAction(ActionType.COUPLE);
        ligun.exhausted = true;

        this.log(`${dhul.name} couples with ${agon.name}!`);
        this.log(`  Formed: ${ligun.name} at (${agonPos.q}, ${agonPos.r})`);

        this.selectedUnit = ligun;
    }

    endUnitActivation() {
        if (this.selectedUnit) {
            this.selectedUnit.endActivation(this.currentRound);
            this.log(`${this.selectedUnit.name}'s activation ends`);
        }
        this.switchTurn();
    }

    checkGameOver() {
        return this.phase === GamePhase.GAME_OVER;
    }

    // Serialize entire game state for network sync
    serialize() {
        return {
            phase: this.phase,
            currentTeam: this.currentTeam,
            currentRound: this.currentRound,
            teamA: this.teamA,
            teamB: this.teamB,
            winner: this.winner,
            combatLog: [...this.combatLog],
            selectedUnitId: this.selectedUnit?.id,
            selectedAction: this.selectedAction,
            validTargets: this.validTargets,
            selectedAttackIndex: this.selectedAttackIndex,
            echoPool: { current: this.echoPool.current, cap: this.echoPool.cap },
            dindraeTotemsRemaining: this.dindraeTotemsRemaining,
            units: this.allUnits.map(u => u.serialize())
        };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameState };
}
