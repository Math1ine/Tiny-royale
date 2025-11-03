// Simple heuristic AI: tries to defend if player units are near its towers,
// otherwise starts pushes when it has enough elixir. Uses deck and elixir reference from scene.
export default class OpponentAI {
  constructor(scene, opts = {}) {
    this.scene = scene;
    this.deck = opts.deck || scene.aiDeck;
    this.thinkDelay = 500; // ms
    this.lastThink = 0;
  }

  tick() {
    if (this.scene.gameOver) return;

    // easy randomness to avoid predictable play
    const r = Math.random();

    // defend: if player units are close to AI towers, spawn a counter near tower
    const threats = this.scene.units.getChildren().filter(u => u.owner === 'player' && u.y < this.scene.scale.height/2 + 60);
    if (threats.length > 0 && this.scene.aiElixir >= 2) {
      // pick cheapest card that AI can afford
      const affordable = this.deck.filter(d => d.cost <= Math.floor(this.scene.aiElixir));
      if (affordable.length > 0) {
        const pick = this.chooseDefensiveCard(affordable, threats);
        if (pick) {
          const tx = Phaser.Math.Between(120, this.scene.scale.width - 120);
          const ty = this.scene.aiSpawnY + 40;
          this.scene.aiElixir -= pick.cost;
          this.scene.spawnUnit(pick, tx, ty, 'ai');
          return;
        }
      }
    }

    // otherwise, sometimes push
    if (r > 0.5 && this.scene.aiElixir >= 3) {
      const affordable = this.deck.filter(d => d.cost <= Math.floor(this.scene.aiElixir));
      if (affordable.length > 0) {
        // pick a unit to push with - prefer higher cost occasionally
        let pick;
        if (Math.random() > 0.6) pick = affordable[Phaser.Math.Between(0, affordable.length-1)];
        else pick = affordable.reduce((a,b)=>a.cost>b.cost?a:b, affordable[0]);
        const tx = Phaser.Math.Between(120, this.scene.scale.width - 120);
        const ty = this.scene.aiSpawnY + 40;
        this.scene.aiElixir -= pick.cost;
        this.scene.spawnUnit(pick, tx, ty, 'ai');
      }
    }
    // else do nothing this tick
  }

  chooseDefensiveCard(affordable, threats) {
    // naive: if there is a tank, pick mini or spear; if many low hp pick splash (not implemented) else pick cheapest
    // For now pick cheapest non-tank if exists
    let nonTank = affordable.filter(d => d.key !== 'tank');
    if (nonTank.length > 0) return nonTank[Phaser.Math.Between(0, nonTank.length-1)];
    return affordable[Phaser.Math.Between(0, affordable.length-1)];
  }
}