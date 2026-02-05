/**
 * Hex Battle Simulator - Hex Grid System
 * Axial coordinate hex grid with pathfinding
 */

class HexGrid {
    constructor(hexSize) {
        this.hexSize = hexSize;
        this.hexes = new Map(); // (q,r) -> exists
        this.units = new Map(); // (q,r) -> unit
        this._buildGrid();

        // Offset for centering
        this.offsetX = SCREEN_WIDTH / 2;
        this.offsetY = SCREEN_HEIGHT / 2 - 50;
    }

    _buildGrid() {
        // Build 91-hex grid (radius 5)
        const radius = 5;
        for (let q = -radius; q <= radius; q++) {
            const r1 = Math.max(-radius, -q - radius);
            const r2 = Math.min(radius, -q + radius);
            for (let r = r1; r <= r2; r++) {
                this.hexes.set(`${q},${r}`, true);
            }
        }
    }

    hexToPixel(q, r) {
        const x = this.hexSize * (3 / 2 * q);
        const y = this.hexSize * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r);
        return { x: x + this.offsetX, y: y + this.offsetY };
    }

    pixelToHex(x, y) {
        x = x - this.offsetX;
        y = y - this.offsetY;

        const q = (2 / 3 * x) / this.hexSize;
        const r = (-1 / 3 * x + Math.sqrt(3) / 3 * y) / this.hexSize;

        return this._axialRound(q, r);
    }

    _axialRound(q, r) {
        const s = -q - r;

        let rq = Math.round(q);
        let rr = Math.round(r);
        let rs = Math.round(s);

        const qDiff = Math.abs(rq - q);
        const rDiff = Math.abs(rr - r);
        const sDiff = Math.abs(rs - s);

        if (qDiff > rDiff && qDiff > sDiff) {
            rq = -rr - rs;
        } else if (rDiff > sDiff) {
            rr = -rq - rs;
        }

        return { q: rq, r: rr };
    }

    getHexCorners(q, r) {
        const { x: cx, y: cy } = this.hexToPixel(q, r);
        const corners = [];
        for (let i = 0; i < 6; i++) {
            const angle = Math.PI / 180 * (60 * i);
            corners.push({
                x: cx + this.hexSize * Math.cos(angle),
                y: cy + this.hexSize * Math.sin(angle)
            });
        }
        return corners;
    }

    isValidHex(q, r) {
        return this.hexes.has(`${q},${r}`);
    }

    getNeighbors(q, r) {
        const directions = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
        const neighbors = [];
        for (const [dq, dr] of directions) {
            const nq = q + dq;
            const nr = r + dr;
            if (this.isValidHex(nq, nr)) {
                neighbors.push({ q: nq, r: nr });
            }
        }
        return neighbors;
    }

    hexDistance(q1, r1, q2, r2) {
        return (Math.abs(q1 - q2) + Math.abs(q1 + r1 - q2 - r2) + Math.abs(r1 - r2)) / 2;
    }

    getHexesInRange(q, r, range) {
        const results = [];
        for (let dq = -range; dq <= range; dq++) {
            for (let dr = Math.max(-range, -dq - range); dr <= Math.min(range, -dq + range); dr++) {
                if (dq === 0 && dr === 0) continue;
                const nq = q + dq;
                const nr = r + dr;
                if (this.isValidHex(nq, nr)) {
                    results.push({ q: nq, r: nr });
                }
            }
        }
        return results;
    }

    getLine(q1, r1, q2, r2) {
        const n = this.hexDistance(q1, r1, q2, r2);
        if (n === 0) return [{ q: q1, r: r1 }];

        const results = [];
        for (let i = 0; i <= n; i++) {
            const t = i / n;
            const q = q1 + (q2 - q1) * t;
            const r = r1 + (r2 - r1) * t;
            results.push(this._axialRound(q, r));
        }
        return results;
    }

    hasLineOfSight(q1, r1, q2, r2, ignoreUnit = null) {
        const line = this.getLine(q1, r1, q2, r2);
        for (let i = 1; i < line.length - 1; i++) {
            const { q, r } = line[i];
            const key = `${q},${r}`;
            if (this.units.has(key)) {
                const unit = this.units.get(key);
                if (ignoreUnit && unit === ignoreUnit) continue;
                return false;
            }
        }
        return true;
    }

    getReachableHexes(q, r, moveRange, canPassThrough = false) {
        const visited = new Map();
        visited.set(`${q},${r}`, 0);
        const frontier = [{ q, r }];

        while (frontier.length > 0) {
            const current = frontier.shift();
            const currentKey = `${current.q},${current.r}`;
            const currentCost = visited.get(currentKey);

            if (currentCost >= moveRange) continue;

            for (const neighbor of this.getNeighbors(current.q, current.r)) {
                const key = `${neighbor.q},${neighbor.r}`;
                if (visited.has(key)) continue;

                // Check if occupied
                if (this.units.has(key)) {
                    if (canPassThrough) {
                        visited.set(key, currentCost + 1);
                        frontier.push(neighbor);
                    }
                    continue;
                }

                visited.set(key, currentCost + 1);
                frontier.push(neighbor);
            }
        }

        // Remove occupied hexes and starting hex
        const reachable = [];
        for (const [key, cost] of visited) {
            if (key === `${q},${r}`) continue;
            if (this.units.has(key)) continue;
            const [hq, hr] = key.split(',').map(Number);
            reachable.push({ q: hq, r: hr });
        }
        return reachable;
    }

    placeUnit(unit, q, r) {
        if (!this.isValidHex(q, r)) {
            throw new Error(`Invalid hex position: (${q}, ${r})`);
        }
        unit.hexPos = { q, r };
        this.units.set(`${q},${r}`, unit);
    }

    moveUnit(unit, newQ, newR) {
        if (unit.hexPos) {
            this.units.delete(`${unit.hexPos.q},${unit.hexPos.r}`);
        }
        unit.hexPos = { q: newQ, r: newR };
        this.units.set(`${newQ},${newR}`, unit);
    }

    removeUnit(unit) {
        if (unit.hexPos) {
            this.units.delete(`${unit.hexPos.q},${unit.hexPos.r}`);
            unit.hexPos = null;
        }
    }

    getUnitAt(q, r) {
        return this.units.get(`${q},${r}`) || null;
    }

    // Serialize for network sync
    serialize() {
        const unitData = [];
        for (const [key, unit] of this.units) {
            unitData.push({
                key,
                unitId: unit.id
            });
        }
        return { unitData };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HexGrid };
}
