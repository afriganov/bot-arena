import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

class Player {
  angle: number;
  id: number;
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  dead: boolean = false;

  collisionDetected = (tickCount: number) => {
    console.log(
      `collision detected player: ${this.id}, tick: ${tickCount}, x: ${this.x}, y: ${this.y}`,
    );

    this.dead = true;
  };

  constructor(id: number) {
    this.id = id;
    this.angle = Math.random() * 360;
    this.x = Math.random() * Battleground.WIDTH;
    this.y = Math.random() * Battleground.HEIGHT;
    this.prevX = this.x;
    this.prevY = this.y;
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

  markLine = (player: Player) => {
    const { x: x1, y: y1, prevX: x0, prevY: y0, id } = player;
    const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0));

    for (let i = 0; i < steps; i++) {
      const t = steps === 0 ? 0 : i / steps;

      const ix = x0 + (x1 - x0) * t;
      const iy = y0 + (y1 - y0) * t;

      console.log("ix", ix);
      console.log("iy", iy);

      console.log("this.pixelIndex(ix, iy)", this.pixelIndex(ix, iy));

      this.grid[this.pixelIndex(ix, iy)] = 1 + id;
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
        if (this.grid[this.pixelIndex(player.x, player.y)] > 0) {
          player.collisionDetected(this.tickCount);
          return;
        }

        this.markLine(player);
      }
    });

    const alive = this.players.filter((player) => !player.dead);

    if (alive.length === 0) {
      throw new Error("DRAW");
    }

    if (this.players.filter((player) => !player.dead).length === 1) {
      this.winner =
        this.players[this.players.findIndex((player) => !player.dead)];

      console.log("We have a winner" + this.winner.id);
    }

    this.tickCount++;
  }

  constructor(players: number[]) {
    this.players = players.map((player) => new Player(player));

    this.battle();
  }
}

app.get("/simulation", (req, res) => {
  const battleground = new Battleground([1, 2, 3]);
  res.send({ grid: battleground.grid });
});

app.listen("3000");
