export default class Tower {
  constructor(scene, x, y, id) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.id = id;
    this.hp = 300;
    this.maxHp = 300;
    this.owner = id.startsWith('ai') ? 'ai' : 'player';

    // draw
    const color = this.owner === 'player' ? 0x0077aa : 0xaa0000;
    this.sprite = scene.add.rectangle(x, y, 120, 60, color).setStrokeStyle(2, 0x000000);
    this.hpText = scene.add.text(x, y+36, `HP: ${this.hp}`, { fontSize:'14px', color:'#fff' }).setOrigin(0.5, 0);
  }

  update(dt, units) {
    // auto-target nearest hostile unit in range
    const hostiles = units.filter(u => u.owner !== this.owner);
    let nearest = null;
    let minD = 99999;
    for (let u of hostiles) {
      const d = Phaser.Math.Distance.Between(this.x, this.y, u.x, u.y);
      if (d < minD) { minD = d; nearest = u; }
    }
    if (nearest && minD < 180) {
      // deal damage over time
      nearest.hp -= 20 * (dt/1000);
    }
    // update text
    this.hpText.setText(`HP: ${Math.max(0, Math.floor(this.hp))}`);
    if (this.hp <= 0) {
      // hide tower
      this.sprite.setFillStyle(0x333333);
      this.hpText.setText('Destroyed');
    }
  }
}