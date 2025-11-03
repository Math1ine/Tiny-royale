export default class Card extends Phaser.GameObjects.Container {
  constructor(scene, def) {
    super(scene, 0, 0);
    this.scene = scene;
    this.def = def;
    this.cost = def.cost;

    // visuals
    const bg = scene.add.rectangle(0, 0, 80, 110, 0x141427).setStrokeStyle(2, 0x999999);
    const icon = scene.add.circle(0, -10, 22, def.key === 'tank' ? 0x888888 : (def.key === 'mini' ? 0x66ff66 : 0xffff66));
    const name = scene.add.text(0, 30, `${def.key}\n${def.cost}`, { fontSize:'14px', color:'#fff', align:'center' }).setOrigin(0.5);

    this.add([bg, icon, name]);
    scene.add.existing(this);

    // interactive
    bg.setInteractive({ useHandCursor: true });
    bg.cardInstance = this;
    this.setSize(80, 110);
  }
}