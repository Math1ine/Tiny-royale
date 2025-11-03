import OpponentAI from '../ai/OpponentAI.js';
import Unit from '../entities/Unit.js';
import Tower from '../entities/Tower.js';
import Card from '../entities/Card.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.playerElixir = 5;
    this.aiElixir = 5;
    this.maxElixir = 10;
    this.elixirRegenRate = 1; // per second
    this.cardDefs = [
      { key: 'spear', cost: 2, hp: 30, dmg: 6, speed: 60, type: 'ranged' },
      { key: 'mini', cost: 3, hp: 60, dmg: 10, speed: 50, type: 'melee' },
      { key: 'tank', cost: 5, hp: 180, dmg: 20, speed: 30, type: 'tank' },
    ];
    this.playerDeck = [];
    this.aiDeck = [];
    this.lastDraw = 0;
    this.hand = [];
  }

  preload() {
    // none - use graphics primitives
  }

  create() {
    const w = this.scale.width, h = this.scale.height;

    // playfield line
    this.add.rectangle(w/2, h/2, w-40, h-120, 0x2b2b3a).setStrokeStyle(2, 0x111111);

    // Ground / spawn y positions
    this.playerSpawnY = h - 120;
    this.aiSpawnY = 120;

    // Towers
    this.playerTowerLeft = new Tower(this, 150, this.playerSpawnY, 'player-left');
    this.playerTowerRight = new Tower(this, w-150, this.playerSpawnY, 'player-right');
    this.aiTowerLeft = new Tower(this, 150, this.aiSpawnY, 'ai-left');
    this.aiTowerRight = new Tower(this, w-150, this.aiSpawnY, 'ai-right');

    // Groups
    this.units = this.add.group();

    // UI: elixir bars & time
    this.playerElixirText = this.add.text(20, h - 40, 'Elixir: 5', { fontSize:'18px', color:'#ffffff' });
    this.aiElixirText = this.add.text(20, 20, 'AI Elixir: 5', { fontSize:'18px', color:'#ffffff' });

    // Hand area
    this.handContainer = this.add.container(w/2, h - 60);
    this.drawStartingDeck();

    // Input: click to deploy by selecting a card then clicking position
    this.selectedCard = null;
    this.input.on('gameobjectdown', (pointer, obj) => {
      if (obj.cardInstance) {
        if (this.playerElixir >= obj.cardInstance.cost) {
          this.selectedCard = obj.cardInstance;
          this.highlight = this.add.graphics().lineStyle(2, 0xffff00).strokeRect(-35, -50, 70, 100);
          obj.add(this.highlight);
        }
      }
    });

    this.input.on('pointerdown', (pointer) => {
      if (this.selectedCard) {
        const x = Phaser.Math.Clamp(pointer.x, 50, w-50);
        const y = Phaser.Math.Clamp(pointer.y, h/2 + 10, h-80); // player deploy area
        if (this.playerElixir >= this.selectedCard.cost) {
          this.playerElixir -= this.selectedCard.cost;
          this.spawnUnit(this.selectedCard, x, y, 'player');
          this.updateUI();
        }
        this.clearSelection();
      }
    });

    // Opponent AI
    this.opponentAI = new OpponentAI(this, { deck: this.aiDeck });

    // timers
    this.time.addEvent({ delay: 1000, loop: true, callback: this.regenElixir, callbackScope: this });
    this.time.addEvent({ delay: 3000, loop: true, callback: () => this.opponentAI.tick(), callbackScope: this });

    // simple game over flag
    this.gameOver = false;
  }

  update(time, dt) {
    // update units movement and targeting
    this.units.getChildren().forEach(u => u.update(dt));

    // Towers auto attack: simple proximity DPS
    [this.playerTowerLeft, this.playerTowerRight, this.aiTowerLeft, this.aiTowerRight].forEach(t => t.update(dt, this.units.getChildren()));

    // cleanup dead units
    this.units.getChildren().forEach(u => {
      if (u.hp <= 0 || u.x < -50 || u.x > this.scale.width + 50 || u.y < -50 || u.y > this.scale.height + 50) {
        u.destroy();
      }
    });

    // Check win/lose
    if (!this.gameOver) {
      if (this.playerTowerLeft.hp <= 0 || this.playerTowerRight.hp <= 0) {
        this.endGame('AI wins');
      } else if (this.aiTowerLeft.hp <= 0 || this.aiTowerRight.hp <= 0) {
        this.endGame('Player wins');
      }
    }
  }

  spawnUnit(cardDef, x, y, owner) {
    const config = { scene: this, x, y, def: cardDef, owner, targetY: owner === 'player' ? 0 : this.scale.height };
    const u = new Unit(config);
    this.add.existing(u);
    this.units.add(u);
    // give it reference to towers for targeting
    u.setTowers([this.playerTowerLeft, this.playerTowerRight, this.aiTowerLeft, this.aiTowerRight]);
  }

  regenElixir() {
    if (this.playerElixir < this.maxElixir) {
      this.playerElixir = Math.min(this.maxElixir, this.playerElixir + this.elixirRegenRate);
    }
    if (this.aiElixir < this.maxElixir) {
      this.aiElixir = Math.min(this.maxElixir, this.aiElixir + this.elixirRegenRate);
    }
    this.updateUI();

    // draw card occasionally
    this.lastDraw++;
    if (this.lastDraw >= 2) {
      this.lastDraw = 0;
      this.drawCardForPlayer();
    }
  }

  drawStartingDeck() {
    // create decks (simple duplication)
    for (let i=0;i<20;i++) {
      const def = this.cardDefs[Phaser.Math.Between(0, this.cardDefs.length-1)];
      this.playerDeck.push(def);
      this.aiDeck.push(def);
    }
    // initial hand
    for (let i=0;i<4;i++) this.drawCardForPlayer();
  }

  drawCardForPlayer() {
    if (this.playerDeck.length === 0) return;
    const def = this.playerDeck.shift();
    const card = new Card(this, def);
    card.setPosition((this.hand.length - 1) * 90 + (this.handContainer.x - 150), this.handContainer.y);
    card.cardInstance = card;
    this.handContainer.add(card);
    this.hand.push(card);
  }

  updateUI() {
    this.playerElixirText.setText('Elixir: ' + Math.floor(this.playerElixir));
    this.aiElixirText.setText('AI Elixir: ' + Math.floor(this.aiElixir));
  }

  clearSelection() {
    this.selectedCard = null;
    if (this.highlight) {
      this.highlight.destroy();
      this.highlight = null;
    }
  }

  endGame(text) {
    this.gameOver = true;
    this.add.rectangle(this.scale.width/2, this.scale.height/2, 420, 160, 0x000000, 0.7);
    this.add.text(this.scale.width/2, this.scale.height/2 - 10, text, { fontSize:'28px', color:'#fff' }).setOrigin(0.5);
    this.add.text(this.scale.width/2, this.scale.height/2 + 30, 'Press F5 to restart', { fontSize:'16px', color:'#ccc' }).setOrigin(0.5);
  }
}