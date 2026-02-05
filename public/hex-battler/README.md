# Hex Battle Simulator

A tactical hex-based battle game with three factions: **Akvira**, **Liguni**, and **Dindrae**.

## 🎮 Play Online

Open `index.html` in a web browser to play locally, or deploy to GitHub Pages for online multiplayer.

## Features

- **Three Factions**: Each with unique mechanics and win conditions
- **PeerJS Multiplayer**: No server required - direct peer-to-peer connections
- **Spectator Mode**: Watch games live with the 👁 spectator feature
- **AI Opponents**: Play against faction-specific AI strategies
- **Multi-hex Units**: Dindrae units occupy 2-4 hexes with rotation

## Factions

### Akvira (Blue)
- Leader: Avian Blackbeak (10 HP, armor)
- Formation Flying combat bonus
- **Win Against**: Kill Avian Blackbeak

### Liguni (Red)
- Symbiont pairs (Agon + Dhul)
- Couple/Decouple mid-battle
- Status effects: Poison, Paralyze, Blind
- **Win Against**: Kill marked Agon (after first Agon dies)

### Dindrae (Purple)
- Multi-hex elemental units
- Powerful auras (Fire, Earth, Water, Air)
- Ascension mechanic via Echo Pool
- **Win Against**: Destroy 3 totems

## How to Play

### Local Game
1. Click "Local Game"
2. Choose your faction
3. Place your units
4. Alternate turns with the AI

### Multiplayer
1. **Host**: Click "Host Multiplayer", share Room ID
2. **Join**: Click "Join Game", enter Room ID
3. **Spectate**: Join as spectator to watch

### Controls
- Click unit to select
- Click action button (Move, Attack, Aim, Dodge)
- Click target hex
- Press `R` to restart after game over
- Press `Escape` to cancel action

## Tech Stack

- Vanilla HTML/CSS/JavaScript
- PeerJS for WebRTC multiplayer
- No build step required

## Deployment

Works with GitHub Pages - just push and enable Pages in repo settings.

```
https://yourusername.github.io/repo-name/hex-battler/
```

## Credits

Converted from Python/Pygame by Eridan Games Studio
