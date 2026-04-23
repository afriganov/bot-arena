class Player {
  angle: number;
  id: string;
  x: number;
  y: number;
  prevX?: number;
  prevY?: number;
  dead: boolean = false;

  collisionDetected = (tickCount: number) => {
    console.log(
      `collision detected player: ${this.id}, tick: ${tickCount}, x: ${this.x}, y: ${this.y}`,
    );
    this.dead = true;
  };

  constructor(id: string) {
    this.id = id;
    this.angle = Math.random() * 360;
    this.x = Math.random() * Battleground.WIDTH;
    this.y = Math.random() * Battleground.HEIGHT;
  }
}

class Battleground {
  static TICKRATE = 1; //units per tick
  static WIDTH = 800;
  static HEIGHT = 600;
  static TURN_SPEED = 2;

  grid = new Int8Array(Battleground.WIDTH * Battleground.HEIGHT);

  winner: Player | null = null;

  tickCount: number = 0;

  players: Player[];

  pixelIndex = (x: number, y: number) => {
    return Math.floor(y) * Battleground.WIDTH + Math.floor(x);
  };

  markLine = (x0: number, y0: number, x1: number, y1: number) => {
    const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0));

    for (let i = 0; i < steps; i++) {
      const t = steps === 0 ? 0 : i / steps;
      const ix = x0 + (x1 - x0) * t;
      const iy = y0 + (y1 - y0) * t;

      this.grid[this.pixelIndex(ix, iy)] = 1;
    }
  };

  battle() {
    while (this.winner === null) {
      this.tick();
    }
  }

  tick() {
    this.players.forEach((player) => {
      if (!player.dead) {
        player.prevX = player.x;
        player.prevY = player.y;

        // move at exactly TICKRATE units per turn;
        player.x += Math.cos(player.angle) * Battleground.TICKRATE;
        player.y += Math.sin(player.angle) * Battleground.TICKRATE;

        // wall collision
        if (
          player.x < 0 ||
          player.x > Battleground.WIDTH ||
          player.y < 0 ||
          player.y > Battleground.HEIGHT
        ) {
          player.collisionDetected(this.tickCount);
          return;
        }

        // self collision — check before marking
        if (this.grid[this.pixelIndex(player.x, player.y)]) {
          player.collisionDetected(this.tickCount);
          return;
        }

        this.markLine(player.prevX, player.prevY, player.x, player.y);
      }
    });

    const alive = this.players.filter((player) => !player.dead);

    if (alive.length === 0) {
      throw new Error("ALL DEAD");
    }

    if (this.players.filter((player) => !player.dead).length === 1) {
      this.winner =
        this.players[this.players.findIndex((player) => !player.dead)];

      console.log("We have a winner" + this.winner.id);
    }

    this.tickCount++;
  }

  constructor(players: string[]) {
    this.players = players.map((player) => new Player(player));

    this.battle();
  }
}

const battleground = new Battleground(["1", "2", "3"]);
