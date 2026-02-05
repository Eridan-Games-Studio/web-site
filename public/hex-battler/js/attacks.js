/**
 * Hex Battle Simulator - Attack System
 * Attack class and dice rolling mechanics
 */

class Attack {
    constructor(config) {
        this.dice = config.dice || []; // [[numDice, dieSize], ...]
        this.hitValue = config.hitValue || 5;
        this.range = config.range || 1;
        this.pierce = config.pierce || false;
        this.poison = config.poison || false;
        this.immobilize = config.immobilize || false;
        this.push = config.push || 0;
        this.diminishing = config.diminishing || false;
    }

    roll(numDiceOverride = null, weakened = false) {
        let hits = 0;
        const allRolls = [];

        for (const [numDice, dieSize] of this.dice) {
            let actualNum = (numDiceOverride !== null && this.diminishing) ? numDiceOverride : numDice;
            let actualDie = dieSize;

            if (weakened) {
                // Step down die type
                if (actualDie === 12) actualDie = 10;
                else if (actualDie === 10) actualDie = 8;
                // d8 is minimum
            }

            for (let i = 0; i < actualNum; i++) {
                const roll = Math.floor(Math.random() * actualDie) + 1;
                allRolls.push(roll);
                if (roll >= this.hitValue) {
                    hits++;
                }
            }
        }

        return { hits, rolls: allRolls };
    }

    // Get dice string for display
    getDiceString() {
        return this.dice.map(([n, d]) => `${n}d${d}`).join('+');
    }

    clone() {
        return new Attack({
            dice: this.dice.map(d => [...d]),
            hitValue: this.hitValue,
            range: this.range,
            pierce: this.pierce,
            poison: this.poison,
            immobilize: this.immobilize,
            push: this.push,
            diminishing: this.diminishing
        });
    }
}

// Status effect instance
class StatusInstance {
    constructor(effect, duration = 1) {
        this.effect = effect;
        this.duration = duration;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Attack, StatusInstance };
}
