/**
 * Hex Battle Simulator - Unit Classes
 * All unit definitions for Akvira, Liguni, and Dindrae factions
 */

let unitIdCounter = 0;

// Base Unit class
class Unit {
    constructor(config) {
        this.id = unitIdCounter++;
        this.name = config.name;
        this.team = config.team;
        this.maxHealth = config.maxHealth;
        this.health = config.health || config.maxHealth;
        this.moveSpeed = config.moveSpeed;
        this.armor = config.armor || false;
        this.attacks = config.attacks || [];
        this.abilities = config.abilities || [];

        // Position
        this.hexPos = null;

        // Tokens and status
        this.aimToken = false;
        this.dodgeToken = false;
        this.tokenExpiryRound = -1;
        this.statuses = [];

        // Activation state
        this.exhausted = false;
        this.actionsRemaining = 2;
        this.actionsUsed = [];
        this.paralyzedActions = 0;

        // Aura buffs
        this.auraBonusDice = [];
        this.auraDamageNegation = 0;
        this.auraBonusMovement = 0;
        this.auraBonusRange = 0;
        this.auraMovementPenalty = 0;
    }

    hasStatus(effect) {
        return this.statuses.some(s => s.effect === effect);
    }

    addStatus(effect) {
        if (!this.hasStatus(effect)) {
            this.statuses.push(new StatusInstance(effect));
        }
    }

    tickStatuses() {
        // Poison damage
        if (this.hasStatus(StatusEffect.POISON)) {
            this.takeDamage(1, true);
        }

        // Decrement and remove expired
        this.statuses = this.statuses.filter(s => s.duration > 0);
        for (const s of this.statuses) {
            s.duration--;
        }
    }

    takeDamage(amount, pierce = false) {
        let actual = amount;
        if (this.armor && !pierce && actual > 0) {
            actual--;
        }
        if (this.auraDamageNegation > 0 && actual > 0) {
            actual = Math.max(0, actual - this.auraDamageNegation);
        }
        if (this.dodgeToken && actual > 0) {
            actual = 0;
            this.dodgeToken = false;
        }
        this.health = Math.max(0, this.health - actual);
        return actual;
    }

    isAlive() {
        return this.health > 0;
    }

    canUseAction(action) {
        if (this.actionsRemaining <= 0) return false;
        if ([ActionType.MOVE, ActionType.ATTACK, ActionType.AIM, ActionType.DODGE].includes(action)) {
            return !this.actionsUsed.includes(action);
        }
        return true;
    }

    useAction(action) {
        this.actionsUsed.push(action);
        this.actionsRemaining--;
    }

    startActivation(currentRound) {
        this.exhausted = false;
        this.actionsRemaining = 2 - this.paralyzedActions;
        this.paralyzedActions = 0;
        this.actionsUsed = [];

        // Reset aura buffs
        this.auraBonusDice = [];
        this.auraDamageNegation = 0;
        this.auraBonusMovement = 0;
        this.auraBonusRange = 0;
        this.auraMovementPenalty = 0;

        // Check token expiry
        if (this.tokenExpiryRound === currentRound) {
            this.aimToken = false;
            this.dodgeToken = false;
        }
    }

    endActivation(currentRound) {
        this.exhausted = true;
        if (this.aimToken || this.dodgeToken) {
            this.tokenExpiryRound = currentRound + 1;
        }
        this.tickStatuses();
    }

    getColor() {
        return getTeamColor(this.team);
    }

    // Serialize for network
    serialize() {
        return {
            id: this.id,
            name: this.name,
            team: this.team,
            health: this.health,
            maxHealth: this.maxHealth,
            hexPos: this.hexPos,
            aimToken: this.aimToken,
            dodgeToken: this.dodgeToken,
            exhausted: this.exhausted,
            actionsRemaining: this.actionsRemaining,
            actionsUsed: [...this.actionsUsed],
            statuses: this.statuses.map(s => ({ effect: s.effect, duration: s.duration }))
        };
    }
}

// ==================== AKVIRA UNITS ====================

class AvianBlackbeak extends Unit {
    constructor() {
        super({
            name: 'Avian Blackbeak',
            team: Team.AKVIRA,
            maxHealth: 10,
            moveSpeed: 2,
            armor: true,
            attacks: [
                new Attack({ dice: [[2, 8], [2, 10], [2, 12]], hitValue: 6, range: 1, pierce: true }),
                new Attack({ dice: [[3, 10]], hitValue: 5, range: 4, immobilize: true })
            ],
            abilities: ['Coordinate 1']
        });
    }
}

class EagleGuard extends Unit {
    constructor() {
        super({
            name: 'Eagle Guard',
            team: Team.AKVIRA,
            maxHealth: 5,
            moveSpeed: 3,
            armor: false,
            attacks: [
                new Attack({ dice: [[1, 10]], hitValue: 7, range: 3, diminishing: true })
            ],
            abilities: ['Formation Flying', 'Bravado']
        });
    }
}

class Sentry extends Unit {
    constructor() {
        super({
            name: 'Sentry',
            team: Team.AKVIRA,
            maxHealth: 4,
            moveSpeed: 4,
            armor: false,
            attacks: [
                new Attack({ dice: [[3, 8]], hitValue: 5, range: 4 })
            ],
            abilities: ['Peal Call', 'Thermal Grenade', 'Long Shot']
        });
    }
}

class Commando extends Unit {
    constructor() {
        super({
            name: 'Commando',
            team: Team.AKVIRA,
            maxHealth: 7,
            moveSpeed: 3,
            armor: true,
            attacks: [
                new Attack({ dice: [[3, 12]], hitValue: 5, range: 1 }),
                new Attack({ dice: [[2, 8], [1, 10]], hitValue: 5, range: 3 })
            ],
            abilities: ['Aggressive Swoop']
        });
    }
}

// ==================== LIGUNI UNITS ====================

class AgonUnit extends Unit {
    constructor(config) {
        super(config);
        this.isCoupled = false;
        this.coupledDhul = null;
        this.baseMoveSpeed = config.baseMoveSpeed || 0;
    }

    getEffectiveMoveSpeed() {
        return this.isCoupled ? this.baseMoveSpeed : 0;
    }
}

class DhulUnit extends Unit {
    constructor(config) {
        super(config);
        this.isCoupled = false;
        this.coupledAgon = null;
    }
}

class LigunUnit extends Unit {
    constructor(agon, dhul) {
        super({
            name: `${agon.name}+${dhul.name}`,
            team: Team.LIGUNI,
            maxHealth: agon.maxHealth + dhul.maxHealth,
            health: agon.health + dhul.health,
            moveSpeed: agon.baseMoveSpeed,
            armor: agon.armor || dhul.armor,
            attacks: [...agon.attacks, ...dhul.attacks],
            abilities: [...agon.abilities, ...dhul.abilities]
        });
        this.agon = agon;
        this.dhul = dhul;
        this.damageTokens = 0;
    }

    takeDamage(amount, pierce = false) {
        let actual = amount;
        if (this.armor && !pierce && actual > 0) {
            actual--;
        }
        if (this.dodgeToken && actual > 0) {
            actual = 0;
            this.dodgeToken = false;
            return 0;
        }

        // Apply to Dhul first
        const dhulDamage = Math.min(actual, this.dhul.health);
        this.dhul.health -= dhulDamage;
        const remaining = actual - dhulDamage;

        // Then to Agon
        if (remaining > 0) {
            this.agon.health -= remaining;
        }

        this.health = this.agon.health + this.dhul.health;
        this.damageTokens += actual;
        return actual;
    }

    isAlive() {
        return this.agon.health > 0 && this.dhul.health > 0;
    }
}

// Specific Agon units
class Thom extends AgonUnit {
    constructor() {
        super({
            name: 'Thom',
            team: Team.LIGUNI,
            maxHealth: 2,
            moveSpeed: 0,
            baseMoveSpeed: 2,
            armor: false,
            attacks: [new Attack({ dice: [[3, 8]], hitValue: 6, range: 3, poison: true })],
            abilities: ['Shrouded']
        });
    }
}

class Din extends AgonUnit {
    constructor() {
        super({
            name: 'Din',
            team: Team.LIGUNI,
            maxHealth: 2,
            moveSpeed: 0,
            baseMoveSpeed: 2,
            armor: true,
            attacks: [new Attack({ dice: [[2, 10]], hitValue: 7, range: 2, immobilize: true })],
            abilities: ['Armor']
        });
    }
}

class Borj extends AgonUnit {
    constructor() {
        super({
            name: 'Borj',
            team: Team.LIGUNI,
            maxHealth: 3,
            moveSpeed: 0,
            baseMoveSpeed: 1,
            armor: false,
            attacks: [new Attack({ dice: [[4, 8]], hitValue: 6, range: 1, pierce: true })],
            abilities: ['Pierce']
        });
    }
}

class Sin extends AgonUnit {
    constructor() {
        super({
            name: 'Sin',
            team: Team.LIGUNI,
            maxHealth: 2,
            moveSpeed: 0,
            baseMoveSpeed: 2,
            armor: false,
            attacks: [new Attack({ dice: [[3, 10]], hitValue: 6, range: 2, poison: true })],
            abilities: ['Blur']
        });
    }
}

// Specific Dhul units
class Mass0 extends DhulUnit {
    constructor() {
        super({
            name: 'Mass0',
            team: Team.LIGUNI,
            maxHealth: 3,
            moveSpeed: 4,
            armor: false,
            attacks: [new Attack({ dice: [[3, 10]], hitValue: 5, range: 1 })],
            abilities: ['Ethereal']
        });
    }
}

class Noh extends DhulUnit {
    constructor() {
        super({
            name: 'Noh',
            team: Team.LIGUNI,
            maxHealth: 3,
            moveSpeed: 5,
            armor: false,
            attacks: [
                new Attack({ dice: [[2, 10]], hitValue: 6, range: 3 }),
                new Attack({ dice: [[4, 8]], hitValue: 5, range: 1, push: 1 })
            ],
            abilities: ['Immobilize']
        });
    }
}

class Jahn extends DhulUnit {
    constructor() {
        super({
            name: 'Jahn',
            team: Team.LIGUNI,
            maxHealth: 4,
            moveSpeed: 4,
            armor: false,
            attacks: [new Attack({ dice: [[4, 10]], hitValue: 6, range: 2 })],
            abilities: ['Paralyze']
        });
    }
}

class Isha extends DhulUnit {
    constructor() {
        super({
            name: 'Isha',
            team: Team.LIGUNI,
            maxHealth: 4,
            moveSpeed: 5,
            armor: false,
            attacks: [new Attack({ dice: [[2, 12]], hitValue: 4, range: 1 })],
            abilities: ['Blind']
        });
    }
}

// ==================== DINDRAE UNITS ====================

class DindraeUnit extends Unit {
    constructor(config) {
        super(config);
        this.element = config.element;
        this.hexShape = config.hexShape || []; // Offsets from anchor
        this.occupiedHexes = [];
        this.hasTotem = true;
        this.isAscended = false;
        this.stampedeUsed = false;
        this.currentRotation = 0;
    }

    getColor() {
        return getElementColor(this.element);
    }

    getAllOccupiedHexes() {
        return [...this.occupiedHexes];
    }

    getAdjacentHexes(grid) {
        const adjacent = new Set();
        for (const hex of this.occupiedHexes) {
            for (const neighbor of grid.getNeighbors(hex.q, hex.r)) {
                const key = `${neighbor.q},${neighbor.r}`;
                const isOccupied = this.occupiedHexes.some(h => h.q === neighbor.q && h.r === neighbor.r);
                if (!isOccupied) {
                    adjacent.add(key);
                }
            }
        }
        return Array.from(adjacent).map(k => {
            const [q, r] = k.split(',').map(Number);
            return { q, r };
        });
    }

    getShapeHexes(anchorQ, anchorR, rotation = 0) {
        const result = [{ q: anchorQ, r: anchorR }];
        for (const [dq, dr] of this.hexShape) {
            let rq = dq, rr = dr;
            // Apply rotation (60 degrees per step)
            for (let i = 0; i < rotation % 6; i++) {
                [rq, rr] = [-rr, rq + rr];
            }
            result.push({ q: anchorQ + rq, r: anchorR + rr });
        }
        return result;
    }

    canFitAt(grid, anchorQ, anchorR, rotation = 0) {
        const targetHexes = this.getShapeHexes(anchorQ, anchorR, rotation);
        for (const hex of targetHexes) {
            if (!grid.isValidHex(hex.q, hex.r)) return false;
            const unit = grid.getUnitAt(hex.q, hex.r);
            if (unit && unit !== this) return false;
        }
        return true;
    }

    placeAt(grid, anchorQ, anchorR, rotation = 0) {
        this.currentRotation = rotation;
        this.occupiedHexes = this.getShapeHexes(anchorQ, anchorR, rotation);
        this.hexPos = { q: anchorQ, r: anchorR };
        for (const hex of this.occupiedHexes) {
            grid.units.set(`${hex.q},${hex.r}`, this);
        }
    }

    removeFromGrid(grid) {
        for (const hex of this.occupiedHexes) {
            const key = `${hex.q},${hex.r}`;
            if (grid.units.get(key) === this) {
                grid.units.delete(key);
            }
        }
        this.occupiedHexes = [];
        this.hexPos = null;
    }

    moveTo(grid, anchorQ, anchorR, rotation = null) {
        if (rotation === null) rotation = this.currentRotation;
        this.removeFromGrid(grid);
        this.placeAt(grid, anchorQ, anchorR, rotation);
    }

    canRotate(grid, direction = 1) {
        if (!this.hexPos) return false;
        const newRotation = (this.currentRotation + direction + 6) % 6;
        return this.canFitAt(grid, this.hexPos.q, this.hexPos.r, newRotation);
    }

    rotate(grid, direction = 1) {
        if (!this.hexPos) return false;
        const newRotation = (this.currentRotation + direction + 6) % 6;
        if (this.canFitAt(grid, this.hexPos.q, this.hexPos.r, newRotation)) {
            this.removeFromGrid(grid);
            this.placeAt(grid, this.hexPos.q, this.hexPos.r, newRotation);
            return true;
        }
        return false;
    }

    ascend() {
        this.isAscended = true;
    }
}

// Specific Dindrae units
class FireDindra extends DindraeUnit {
    constructor() {
        super({
            name: 'Fire Dindra',
            team: Team.DINDRAE,
            maxHealth: 12,
            moveSpeed: 3,
            armor: true,
            attacks: [
                new Attack({ dice: [[3, 10], [3, 12]], hitValue: 5, range: 1 })
            ],
            abilities: ['Fire Aura', 'Splash 1'],
            element: DindraeElement.FIRE,
            hexShape: [[1, 0], [0, 1]] // Triangle: 3 hexes
        });
    }

    ascend() {
        if (!this.isAscended) {
            this.isAscended = true;
            this.attacks = [
                new Attack({ dice: [[3, 10], [3, 12]], hitValue: 5, range: 3 })
            ];
        }
    }
}

class EarthDindra extends DindraeUnit {
    constructor() {
        super({
            name: 'Earth Dindra',
            team: Team.DINDRAE,
            maxHealth: 14,
            moveSpeed: 2,
            armor: true,
            attacks: [
                new Attack({ dice: [[2, 8], [2, 10], [2, 12]], hitValue: 5, range: 1 })
            ],
            abilities: ['Earth Aura'],
            element: DindraeElement.EARTH,
            hexShape: [[1, 0], [0, 1], [1, -1]] // Diamond: 4 hexes
        });
    }
}

class WaterDindra extends DindraeUnit {
    constructor() {
        super({
            name: 'Water Dindra',
            team: Team.DINDRAE,
            maxHealth: 7,
            moveSpeed: 3,
            armor: false,
            attacks: [
                new Attack({ dice: [[3, 8], [2, 10]], hitValue: 6, range: 3 })
            ],
            abilities: ['Water Aura', 'Heal Ally'],
            element: DindraeElement.WATER,
            hexShape: [[1, 0]] // Line: 2 hexes
        });
    }

    ascend(isLastStanding = false) {
        if (!this.isAscended) {
            this.isAscended = true;
            this.attacks = [
                new Attack({ dice: [[1, 8], [3, 10]], hitValue: 4, range: 3 })
            ];
            if (isLastStanding) {
                this.health = this.maxHealth;
            }
        }
    }
}

class AirDindra extends DindraeUnit {
    constructor() {
        super({
            name: 'Air Dindra',
            team: Team.DINDRAE,
            maxHealth: 7,
            moveSpeed: 4,
            armor: false,
            attacks: [
                new Attack({ dice: [[3, 12]], hitValue: 6, range: 4 })
            ],
            abilities: ['Air Aura'],
            element: DindraeElement.AIR,
            hexShape: [[1, 0]] // Line: 2 hexes
        });
    }

    ascend() {
        if (!this.isAscended) {
            this.isAscended = true;
            this.moveSpeed += 2;
            this.abilities.push('Haste Aura');
        }
    }
}

// Echo Pool for Dindrae
class EchoPool {
    constructor() {
        this.current = 0;
        this.cap = 15;
        this.ascensionCost = 10;
    }

    addEcho(amount) {
        this.current = Math.min(this.cap, this.current + amount);
    }

    canAscend() {
        return this.current >= this.ascensionCost;
    }

    spendForAscension() {
        if (this.canAscend()) {
            this.current -= this.ascensionCost;
            return true;
        }
        return false;
    }

    reset() {
        this.current = 0;
    }
}

// Factory function to create all Akvira units
function createAkviraUnits() {
    return [
        new AvianBlackbeak(),
        new EagleGuard(),
        new Sentry(),
        new Commando()
    ];
}

// Factory function to create Liguni units (returns coupled Liguns)
function createLiguniUnits() {
    const agons = [new Thom(), new Din(), new Borj(), new Sin()];
    const dhuls = [new Mass0(), new Noh(), new Jahn(), new Isha()];

    // Shuffle dhuls for random pairings
    for (let i = dhuls.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [dhuls[i], dhuls[j]] = [dhuls[j], dhuls[i]];
    }

    const liguns = [];
    for (let i = 0; i < agons.length; i++) {
        agons[i].isCoupled = true;
        dhuls[i].isCoupled = true;
        agons[i].coupledDhul = dhuls[i];
        dhuls[i].coupledAgon = agons[i];
        liguns.push(new LigunUnit(agons[i], dhuls[i]));
    }

    return { agons, dhuls, liguns };
}

// Factory function to create all Dindrae options
function createDindraeOptions() {
    return [
        new FireDindra(),
        new EarthDindra(),
        new WaterDindra(),
        new AirDindra()
    ];
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Unit, AvianBlackbeak, EagleGuard, Sentry, Commando,
        AgonUnit, DhulUnit, LigunUnit, Thom, Din, Borj, Sin,
        Mass0, Noh, Jahn, Isha,
        DindraeUnit, FireDindra, EarthDindra, WaterDindra, AirDindra,
        EchoPool, createAkviraUnits, createLiguniUnits, createDindraeOptions
    };
}
