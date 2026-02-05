/**
 * Hex Battle Simulator - Constants
 * Game constants, enums, and color definitions
 */

// Screen dimensions
const SCREEN_WIDTH = 1400;
const SCREEN_HEIGHT = 900;
const HEX_SIZE = 36;
const FPS = 60;

// Teams Enum
const Team = {
    AKVIRA: 'AKVIRA',
    LIGUNI: 'LIGUNI',
    DINDRAE: 'DINDRAE'
};

// Action Types Enum
const ActionType = {
    MOVE: 'MOVE',
    ATTACK: 'ATTACK',
    AIM: 'AIM',
    DODGE: 'DODGE',
    COUPLE: 'COUPLE',
    DECOUPLE: 'DECOUPLE',
    THERMAL_GRENADE: 'THERMAL_GRENADE',
    AGGRESSIVE_SWOOP: 'AGGRESSIVE_SWOOP',
    PEAL_CALL: 'PEAL_CALL',
    TOTEM_BOOM: 'TOTEM_BOOM',
    ASCEND: 'ASCEND',
    ROTATE: 'ROTATE'
};

// Status Effects Enum
const StatusEffect = {
    POISON: 'POISON',
    IMMOBILIZE: 'IMMOBILIZE',
    PARALYZE: 'PARALYZE',
    BLIND: 'BLIND'
};

// Game Phases Enum
const GamePhase = {
    SETUP: 'SETUP',
    DINDRAE_SELECT: 'DINDRAE_SELECT',
    PLACEMENT: 'PLACEMENT',
    SELECT_UNIT: 'SELECT_UNIT',
    SELECT_ACTION: 'SELECT_ACTION',
    SELECT_TARGET: 'SELECT_TARGET',
    EXECUTE_ACTION: 'EXECUTE_ACTION',
    END_TURN: 'END_TURN',
    GAME_OVER: 'GAME_OVER'
};

// Dindrae Elements Enum
const DindraeElement = {
    FIRE: 'FIRE',
    EARTH: 'EARTH',
    WATER: 'WATER',
    AIR: 'AIR'
};

// Connection Modes
const ConnectionMode = {
    LOCAL: 'LOCAL',
    HOST: 'HOST',
    CLIENT: 'CLIENT',
    SPECTATOR: 'SPECTATOR'
};

// Colors
const Colors = {
    WHITE: '#ffffff',
    BLACK: '#000000',
    GRAY: '#646464',
    DARK_GRAY: '#32373f',
    LIGHT_GRAY: '#969696',
    RED: '#dc3c3c',
    BLUE: '#3c64c8',
    GREEN: '#3cc83c',
    YELLOW: '#ffdc32',
    ORANGE: '#ff9632',
    PURPLE: '#9632c8',
    CYAN: '#32c8c8',
    DARK_RED: '#962828',
    DARK_BLUE: '#284696',

    // Highlights (with alpha)
    HIGHLIGHT: 'rgba(255, 255, 100, 0.5)',
    MOVE_HIGHLIGHT: 'rgba(100, 255, 100, 0.5)',
    ATTACK_HIGHLIGHT: 'rgba(255, 100, 100, 0.5)',

    // Faction colors
    AKVIRA: '#3c64c8',
    LIGUNI: '#dc3c3c',
    DINDRAE_FIRE: '#ff6432',
    DINDRAE_EARTH: '#8b5a2b',
    DINDRAE_WATER: '#3296ff',
    DINDRAE_AIR: '#c8c8ff'
};

// Get faction color
function getTeamColor(team) {
    switch (team) {
        case Team.AKVIRA: return Colors.AKVIRA;
        case Team.LIGUNI: return Colors.LIGUNI;
        case Team.DINDRAE: return Colors.PURPLE;
        default: return Colors.GRAY;
    }
}

// Get Dindrae element color
function getElementColor(element) {
    switch (element) {
        case DindraeElement.FIRE: return Colors.DINDRAE_FIRE;
        case DindraeElement.EARTH: return Colors.DINDRAE_EARTH;
        case DindraeElement.WATER: return Colors.DINDRAE_WATER;
        case DindraeElement.AIR: return Colors.DINDRAE_AIR;
        default: return Colors.PURPLE;
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SCREEN_WIDTH, SCREEN_HEIGHT, HEX_SIZE, FPS,
        Team, ActionType, StatusEffect, GamePhase, DindraeElement, ConnectionMode,
        Colors, getTeamColor, getElementColor
    };
}
