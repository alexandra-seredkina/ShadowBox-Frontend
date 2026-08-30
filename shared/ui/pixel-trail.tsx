import type { ReactElement } from "react";

type PixelTrailProps = {
  /** Top-left corner of the trail. */
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly className?: string;
};

// Columns thin out to the right, so the object reads as dissolving into pixels.
const PATTERN = [
  [0, 1, 2, 3, 4, 5],
  [0, 2, 3, 5],
  [1, 2, 4],
  [0, 3, 5],
  [2, 4],
  [1],
] as const;

export function PixelTrail({ x, y, size, className = "fill-paper" }: PixelTrailProps): ReactElement {
  return (
    <g className={className}>
      {PATTERN.flatMap((rows, column) =>
        rows.map((row) => (
          <rect key={`${column}-${row}`} x={x + column * size * 1.5} y={y + row * size * 1.5} width={size} height={size} />
        )),
      )}
    </g>
  );
}
