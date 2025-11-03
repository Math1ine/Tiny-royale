```markdown
# Mini Royale — Player vs AI prototype

This is a small browser prototype inspired by Clash Royale mechanics, implemented with Phaser 3.
It is a single-player prototype where the opposing side is controlled by a heuristic AI.

Features:
- Elixir for player and AI (regenerates over time).
- Simple card hand for player (click a card, then click the play area to deploy).
- Three troop types (spear / mini / tank) with different stats.
- Two towers per side; towers auto-attack nearby enemies.
- AI that defends and pushes based on simple heuristics.

How to run:
1. Serve the files with a static server (recommended) or open index.html in a browser.
   - Quick way (Python): `python -m http.server 8000` in the project root, then open http://localhost:8000
2. Click a card at the bottom to select it, then click the lower play area to deploy.
3. Win by destroying one of the AI towers. Lose if AI destroys one of your towers.

Notes / How to extend:
- Replace placeholder graphics in src/entities/* with sprites.
- Add more card types and spells by extending Card and Unit logic.
- Improve AI by adding stateful planing, cooldowns, or a simple minimax on board value.
- Convert to two-lane layout by changing spawn lanes and tower positions.

This prototype is intentionally small and easy to modify. Have fun!
```