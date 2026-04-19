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
    let angle = 0;

    const keys = new Set<string>();

    const onKeyDown = (e: KeyboardEvent) => keys.add(e.code);
    const onKeyUp = (e: KeyboardEvent) => keys.delete(e.code);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    let lastTime: number | null = null;
    const trail: [number, number][] = [[x, y]];

    const loop = (now: number) => {
      if (lastTime === null) lastTime = now;

      const dt = (now - lastTime) / 1000; // seconds since last frame

      lastTime = now;

      console.log(keys);

      if (keys.has("ArrowLeft")) angle -= TURN_SPEED * dt;
      if (keys.has("ArrowRight")) angle += TURN_SPEED * dt;

      // move at exactly TICKRATE units per second regardless of frame rate
      x += Math.cos(angle) * TICKRATE * dt;
      y += Math.sin(angle) * TICKRATE * dt;

      trail.push([x, y]);

      ctx.beginPath();
      ctx.moveTo(trail[0][0], trail[0][1]);

      for (const [tx, ty] of trail) {
        ctx.lineTo(tx, ty);
      }

      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;

      ctx.stroke();

      fId = requestAnimationFrame(loop);
    };

    fId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(fId);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  });

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
