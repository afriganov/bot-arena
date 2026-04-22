import { useEffect, useRef } from "react";

const TICKRATE = 60; //units per second
const WIDTH = 800;
const HEIGHT = 600;
const TURN_SPEED = 2;

export const Battleground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx: CanvasRenderingContext2D = canvas!.getContext("2d")!;

    let fId: number;

    let x = 400;
    let y = 300;
    let prevX = x;
    let prevY = y;
    let angle = 0;

    const keys = new Set<string>();

    const onKeyDown = (e: KeyboardEvent) => keys.add(e.code);
    const onKeyUp = (e: KeyboardEvent) => keys.delete(e.code);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    let lastTime: number | null = null;
    const grid = new Uint8Array(WIDTH * HEIGHT);

    const collisionDetected = () => {
      ctx.font = "48px sans-serif";
      ctx.fillStyle = "red";
      ctx.textAlign = "center";
      ctx.fillText("COLLISION DETECTED", WIDTH / 2, HEIGHT / 2);
    };

    const pixelIndex = (x: number, y: number) => {
      return Math.floor(y) * WIDTH + Math.floor(x);
    };

    const markLine = (x0: number, y0: number, x1: number, y1: number) => {
      const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0));

      for (let i = 0; i < steps; i++) {
        const t = steps === 0 ? 0 : i / steps;
        const ix = x0 + (x1 - x0) * t;
        const iy = y0 + (y1 - y0) * t;

        grid[pixelIndex(ix, iy)] = 1;
      }
    };

    let frameCount = 0;

    const loop = (now: number) => {
      if (lastTime === null) lastTime = now;

      const dt = Math.min((now - lastTime) / 1000, 1 / 30); // seconds since last frame

      lastTime = now;

      if (keys.has("ArrowLeft")) angle -= TURN_SPEED * dt;
      if (keys.has("ArrowRight")) angle += TURN_SPEED * dt;

      prevX = x;
      prevY = y;

      // move at exactly TICKRATE units per second regardless of frame rate
      x += Math.cos(angle) * TICKRATE * dt;
      y += Math.sin(angle) * TICKRATE * dt;

      // wall collision
      if (x < 0 || x > WIDTH || y < 0 || y > HEIGHT) {
        collisionDetected();
        return;
      }

      // self collision — check before marking
      if (grid[pixelIndex(x, y)]) {
        console.log("collision at", x, y, "frame", frameCount);
        console.log("self");
        collisionDetected();
        return;
      }

      markLine(prevX, prevY, x, y);

      // draw only the new segment — O(1) regardless of trail length
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.stroke();

      frameCount++;

      fId = requestAnimationFrame(loop);
    };

    fId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(fId);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{ border: "1px solid black" }}
        width={WIDTH}
        height={HEIGHT}
      ></canvas>
    </>
  );
};
