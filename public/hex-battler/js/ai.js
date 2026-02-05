/**
 * Hex Battle Simulator - AI Players
 * AI implementations for all three factions
 */

class BaseAI {
    constructor(game, team) {
        this.game = game;
        this.team = team;
    }

    getMove() {
        const units = this.game.getActivatableUnits(this.team);
        if (units.length === 0) return null;

        // Pick unit and perform actions
        const unit = this.selectUnit(units);
        if (!unit) return null;

        return { type: 'SELECT_UNIT', unit };
    }

    getAction() {
        const unit = this.game.selectedUnit;
        if (!unit || unit.actionsRemaining === 0) {
            return { type: 'END_ACTIVATION' };
        }

        const action = this.selectAction(unit);
        return action || { type: 'END_ACTIVATION' };
    }

    selectUnit(units) {
        // Override in subclasses
        return units[0];
    }

    selectAction(unit) {
        // Override in subclasses
        return null;
    }

    findBestTarget(unit, attackIndex) {
        const targets = this.game.getValidAttackTargets(unit, attackIndex);
        if (targets.length === 0) return null;

        // Sort by priority
        targets.sort((a, b) => {
            const unitA = this.game.grid.getUnitAt(a.q, a.r);
            const unitB = this.game.grid.getUnitAt(b.q, b.r);
            return this.getTargetPriority(unitB) - this.getTargetPriority(unitA);
        });

        return targets[0];
    }

    getTargetPriority(unit) {
        if (!unit) return 0;
        // Low HP = high priority
        return 10 - unit.health;
    }

    getMoveTowardTarget(unit, targetPos) {
        if (!unit.hexPos || !targetPos) return null;

        const targets = this.game.getValidMoveTargets(unit);
        if (targets.length === 0) return null;

        // Find hex closest to target
        targets.sort((a, b) => {
            const distA = this.game.grid.hexDistance(a.q, a.r, targetPos.q, targetPos.r);
            const distB = this.game.grid.hexDistance(b.q, b.r, targetPos.q, targetPos.r);
            return distA - distB;
        });

        return targets[0];
    }

    getMoveAwayFromUnit(unit, threatPos) {
        if (!unit.hexPos || !threatPos) return null;

        const targets = this.game.getValidMoveTargets(unit);
        if (targets.length === 0) return null;

        // Find hex furthest from threat
        targets.sort((a, b) => {
            const distA = this.game.grid.hexDistance(a.q, a.r, threatPos.q, threatPos.r);
            const distB = this.game.grid.hexDistance(b.q, b.r, threatPos.q, threatPos.r);
            return distB - distA;
        });

        return targets[0];
    }

    getClosestEnemy(unit) {
        const enemies = this.game.getTeamUnits(this.game.getOtherTeam(this.team));
        if (enemies.length === 0 || !unit.hexPos) return null;

        enemies.sort((a, b) => {
            if (!a.hexPos || !b.hexPos) return 0;
            const distA = this.game.grid.hexDistance(unit.hexPos.q, unit.hexPos.r, a.hexPos.q, a.hexPos.r);
            const distB = this.game.grid.hexDistance(unit.hexPos.q, unit.hexPos.r, b.hexPos.q, b.hexPos.r);
            return distA - distB;
        });

        return enemies[0];
    }
}

class AkviraAI extends BaseAI {
    constructor(game) {
        super(game, Team.AKVIRA);
    }

    selectUnit(units) {
        // Prioritize units that can reach Blackbeak's target or deal damage
        for (const unit of units) {
            if (unit.name === 'Commando') return unit;
        }
        for (const unit of units) {
            if (unit.name === 'Sentry') return unit;
        }
        for (const unit of units) {
            if (unit.name === 'Avian Blackbeak') return unit;
        }
        return units[0];
    }

    selectAction(unit) {
        if (unit.actionsRemaining === 0) return null;

        // Attack if possible
        if (unit.canUseAction(ActionType.ATTACK)) {
            for (let i = 0; i < unit.attacks.length; i++) {
                const target = this.findBestTarget(unit, i);
                if (target) {
                    return { type: 'ATTACK', target, attackIndex: i };
                }
            }
        }

        // Aim if has attacks but can't reach
        if (unit.canUseAction(ActionType.AIM) && !unit.aimToken) {
            const hasTargetsNearby = this.getClosestEnemy(unit);
            if (hasTargetsNearby) {
                const dist = unit.hexPos ? this.game.grid.hexDistance(
                    unit.hexPos.q, unit.hexPos.r,
                    hasTargetsNearby.hexPos.q, hasTargetsNearby.hexPos.r
                ) : 999;
                // Aim if enemy is within double attack range
                if (unit.attacks[0] && dist <= unit.attacks[0].range * 2) {
                    return { type: 'AIM' };
                }
            }
        }

        // Move toward enemy
        if (unit.canUseAction(ActionType.MOVE)) {
            const enemy = this.getClosestEnemy(unit);
            if (enemy && enemy.hexPos) {
                const moveTarget = this.getMoveTowardTarget(unit, enemy.hexPos);
                if (moveTarget) {
                    return { type: 'MOVE', target: moveTarget };
                }
            }
        }

        // Dodge if no other option and enemy nearby
        if (unit.canUseAction(ActionType.DODGE) && !unit.dodgeToken) {
            const enemy = this.getClosestEnemy(unit);
            if (enemy && enemy.hexPos && unit.hexPos) {
                const dist = this.game.grid.hexDistance(
                    unit.hexPos.q, unit.hexPos.r,
                    enemy.hexPos.q, enemy.hexPos.r
                );
                if (dist <= 2) {
                    return { type: 'DODGE' };
                }
            }
        }

        return null;
    }

    getTargetPriority(unit) {
        if (!unit) return 0;
        let priority = 10 - unit.health;

        // Target marked Agon if found
        if (unit instanceof AgonUnit && this.game.markedAgon === unit) {
            priority += 50;
        }
        // Target Agons after first kill
        if (unit instanceof AgonUnit && this.game.firstAgonDied) {
            priority += 20;
        }
        // Target Ligun pairs
        if (unit instanceof LigunUnit) {
            priority += 5;
        }

        return priority;
    }
}

class LiguniAI extends BaseAI {
    constructor(game) {
        super(game, Team.LIGUNI);
    }

    selectUnit(units) {
        // Prioritize Jahn (paralyze) and units with status effects
        for (const unit of units) {
            if (unit instanceof LigunUnit && unit.dhul?.name === 'Jahn') return unit;
        }
        for (const unit of units) {
            if (unit instanceof LigunUnit && unit.dhul?.name === 'Isha') return unit;
        }
        return units[0];
    }

    selectAction(unit) {
        if (unit.actionsRemaining === 0) return null;

        // Decouple if would be useful
        if (unit instanceof LigunUnit && unit.actionsRemaining > 0) {
            const decoupleTargets = this.game.getValidDecoupleTargets(unit);
            if (decoupleTargets.length > 0 && unit.health <= unit.maxHealth * 0.4) {
                return { type: 'DECOUPLE', target: decoupleTargets[0] };
            }
        }

        // Attack if possible
        if (unit.canUseAction(ActionType.ATTACK)) {
            for (let i = 0; i < unit.attacks.length; i++) {
                const target = this.findBestTarget(unit, i);
                if (target) {
                    return { type: 'ATTACK', target, attackIndex: i };
                }
            }
        }

        // Move toward enemy
        if (unit.canUseAction(ActionType.MOVE)) {
            const enemy = this.getClosestEnemy(unit);
            if (enemy && enemy.hexPos) {
                const moveTarget = this.getMoveTowardTarget(unit, enemy.hexPos);
                if (moveTarget) {
                    return { type: 'MOVE', target: moveTarget };
                }
            }
        }

        // Dodge if low on HP
        if (unit.canUseAction(ActionType.DODGE) && !unit.dodgeToken && unit.health <= 3) {
            return { type: 'DODGE' };
        }

        return null;
    }

    getTargetPriority(unit) {
        if (!unit) return 0;
        let priority = 10 - unit.health;

        // Target Blackbeak
        if (unit.name === 'Avian Blackbeak') {
            priority += 30;
        }

        return priority;
    }
}

class DindraeAI extends BaseAI {
    constructor(game) {
        super(game, Team.DINDRAE);
    }

    selectUnit(units) {
        // Prioritize Fire for damage, then Earth for debuffs
        for (const unit of units) {
            if (unit.element === DindraeElement.FIRE) return unit;
        }
        for (const unit of units) {
            if (unit.element === DindraeElement.EARTH) return unit;
        }
        return units[0];
    }

    selectAction(unit) {
        if (unit.actionsRemaining === 0) return null;

        // Ascend if possible
        if (unit instanceof DindraeUnit && !unit.isAscended && this.game.echoPool.canAscend()) {
            return { type: 'ASCEND' };
        }

        // Attack if possible
        if (unit.canUseAction(ActionType.ATTACK)) {
            for (let i = 0; i < unit.attacks.length; i++) {
                const target = this.findBestTarget(unit, i);
                if (target) {
                    return { type: 'ATTACK', target, attackIndex: i };
                }
            }
        }

        // Move to maximize aura effectiveness
        if (unit.canUseAction(ActionType.MOVE)) {
            const enemy = this.getClosestEnemy(unit);
            if (enemy && enemy.hexPos) {
                const moveTarget = this.getMoveTowardTarget(unit, enemy.hexPos);
                if (moveTarget) {
                    return { type: 'MOVE', target: moveTarget };
                }
            }
        }

        // Use totem if damaged and in danger
        if (unit instanceof DindraeUnit && unit.hasTotem && unit.health <= unit.maxHealth * 0.3) {
            const enemy = this.getClosestEnemy(unit);
            if (enemy && enemy.hexPos) {
                return { type: 'TOTEM_BOOM', target: enemy.hexPos };
            }
        }

        return null;
    }

    getTargetPriority(unit) {
        if (!unit) return 0;
        let priority = 10 - unit.health;

        // Target Blackbeak
        if (unit.name === 'Avian Blackbeak') {
            priority += 25;
        }
        // Target Agons
        if (unit instanceof AgonUnit || (unit instanceof LigunUnit)) {
            priority += 10;
        }

        return priority;
    }
}

// Factory to create AI for any team
function createAI(game, team) {
    switch (team) {
        case Team.AKVIRA: return new AkviraAI(game);
        case Team.LIGUNI: return new LiguniAI(game);
        case Team.DINDRAE: return new DindraeAI(game);
        default: return new BaseAI(game, team);
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BaseAI, AkviraAI, LiguniAI, DindraeAI, createAI };
}
