import { Fragment, type CSSProperties } from "react";
import type { CategoryKind } from "@/features/categories/category-input";
import { KindMark } from "@/features/categories/kind-mark";

type Point = [x: number, y: number, z: number];

const COS_30 = Math.sqrt(3) / 2;

// Isometric view: the floor's x axis runs down to the right, its y axis down
// to the left, and z points straight up.
function toScreen([x, y, z]: Point): [number, number] {
  return [(x - y) * COS_30, (x + y) / 2 - z];
}

function points(corners: Point[]): string {
  return corners.map((corner) => toScreen(corner).join(",")).join(" ");
}

// The same hours every day, with more of them going into execution.
const DAYS = [
  { preparation: 76, execution: 20 },
  { preparation: 64, execution: 36 },
  { preparation: 50, execution: 52 },
  { preparation: 37, execution: 67 },
  { preparation: 26, execution: 82 },
];

const SIZE = 40;
const GAP = 30;
// A sliver of the preparation block's top shows between the two blocks.
const SEAM = 3;
const PLATE_MARGIN = 18;
const PLATE_DEPTH = 10;
const SOCKET_RIM = 3;

// Days step back along the y axis, so later days stand further up the page.
function dayY(index: number): number {
  return -index * (SIZE + GAP);
}

function columnHeight(day: (typeof DAYS)[number]): number {
  return day.preparation + SEAM + day.execution;
}

const PLATE = {
  x: -PLATE_MARGIN,
  y: dayY(DAYS.length - 1) - PLATE_MARGIN,
  w: SIZE + 2 * PLATE_MARGIN,
  d: (DAYS.length - 1) * (SIZE + GAP) + SIZE + 2 * PLATE_MARGIN,
};

const VIEW = (() => {
  const corners: Point[] = [
    [PLATE.x, PLATE.y, -PLATE_DEPTH],
    [PLATE.x + PLATE.w, PLATE.y, -PLATE_DEPTH],
    [PLATE.x, PLATE.y + PLATE.d, -PLATE_DEPTH],
    [PLATE.x + PLATE.w, PLATE.y + PLATE.d, -PLATE_DEPTH],
    ...DAYS.map((day, index): Point => [0, dayY(index), columnHeight(day)]),
  ];
  const xs = corners.map((corner) => toScreen(corner)[0]);
  const ys = corners.map((corner) => toScreen(corner)[1]);
  // Room for the plate's shadow.
  const margin = 32;
  const minX = Math.min(...xs) - margin;
  const minY = Math.min(...ys) - margin;
  return {
    x: minX,
    y: minY,
    width: Math.max(...xs) + margin - minX,
    height: Math.max(...ys) + margin - minY,
  };
})();

// The caption starts at the plate's corner, so it reads as part of the
// drawing. Container units keep it there as the drawing scales.
const CAPTION_INDENT = `${
  ((toScreen([PLATE.x, PLATE.y + PLATE.d, 0])[0] - VIEW.x) / VIEW.width) * 100
}cqw`;

/** The fill of each visible face: a color, or a gradient's url(). */
type Faces = { top: string; left: string; right: string };

const KINDS: CategoryKind[] = ["preparation", "execution"];

function mix(kind: CategoryKind, other: string): string {
  return `color-mix(in oklch, var(--${kind}), ${other})`;
}

// Lit from above and to the left: the top is lightest, the right side
// darkest, and both sides darken toward the floor.
const SIDE_STOPS = {
  left: ["white 8%", "black 10%"],
  right: ["black 10%", "black 26%"],
} as const;

function kindFaces(kind: CategoryKind): Faces {
  return {
    top: mix(kind, "white 38%"),
    left: `url(#week-${kind}-left)`,
    right: `url(#week-${kind}-right)`,
  };
}

const PLATE_FACES: Faces = {
  top: "var(--muted)",
  left: "color-mix(in oklch, var(--muted), var(--foreground) 8%)",
  right: "color-mix(in oklch, var(--muted), var(--foreground) 15%)",
};

/** A box resting on z, with the three faces the viewer can see. */
function Box({
  x,
  y,
  z,
  w,
  d,
  h,
  faces,
}: {
  x: number;
  y: number;
  z: number;
  w: number;
  d: number;
  h: number;
  faces: Faces;
}) {
  const top = z + h;
  return (
    <>
      <polygon
        style={{ fill: faces.left }}
        points={points([
          [x, y + d, z],
          [x + w, y + d, z],
          [x + w, y + d, top],
          [x, y + d, top],
        ])}
      />
      <polygon
        style={{ fill: faces.right }}
        points={points([
          [x + w, y + d, z],
          [x + w, y, z],
          [x + w, y, top],
          [x + w, y + d, top],
        ])}
      />
      <polygon
        style={{ fill: faces.top }}
        points={points([
          [x, y, top],
          [x + w, y, top],
          [x + w, y + d, top],
          [x, y + d, top],
        ])}
      />
    </>
  );
}

/**
 * Everything above the front edges of a day's footprint. A column moved down
 * inside it disappears into the plate, so sliding it back up raises it out of
 * its socket.
 */
function riseClip(index: number): string {
  const y = dayY(index);
  const [leftX, leftY] = toScreen([0, y + SIZE, 0]);
  const [frontX, frontY] = toScreen([SIZE, y + SIZE, 0]);
  const [rightX, rightY] = toScreen([SIZE, y, 0]);
  return [
    [leftX, leftY],
    [frontX, frontY],
    [rightX, rightY],
    [rightX, -1000],
    [leftX, -1000],
  ]
    .map((point) => point.join(","))
    .join(" ");
}

function Column({ index }: { index: number }) {
  const day = DAYS[index];
  const y = dayY(index);
  const style = {
    // Deep enough that the column's top face is hidden too.
    "--rise": `${columnHeight(day) + SIZE + 2}px`,
    animationDelay: `${250 + index * 160}ms`,
  } as CSSProperties;

  return (
    <g clipPath={`url(#week-rise-${index})`}>
      <g className="motion-safe:animate-rise" style={style}>
        <Box
          x={0}
          y={y}
          z={0}
          w={SIZE}
          d={SIZE}
          h={day.preparation}
          faces={kindFaces("preparation")}
        />
        <Box
          x={0}
          y={y}
          z={day.preparation + SEAM}
          w={SIZE}
          d={SIZE}
          h={day.execution}
          faces={kindFaces("execution")}
        />
      </g>
    </g>
  );
}

/**
 * A week of work drawn as columns rising out of a plate, one per day:
 * preparation below, execution on top. The hours stay level while the
 * execution share grows, which is the shift the product exists to show.
 */
function WeekDrawing() {
  const days = DAYS.map((_, index) => index);

  return (
    <svg
      viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.width} ${VIEW.height}`}
      aria-hidden
      className="w-full"
    >
      <defs>
        <filter
          id="week-shadow"
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
        >
          <feGaussianBlur stdDeviation="14" />
        </filter>
        {KINDS.map((kind) => (
          <Fragment key={kind}>
            {(["left", "right"] as const).map((side) => (
              <linearGradient
                key={side}
                id={`week-${kind}-${side}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                {SIDE_STOPS[side].map((other, index) => (
                  <stop
                    key={other}
                    offset={index}
                    style={{ stopColor: mix(kind, other) }}
                  />
                ))}
              </linearGradient>
            ))}
          </Fragment>
        ))}
        {days.map((index) => (
          <clipPath key={index} id={`week-rise-${index}`}>
            <polygon points={riseClip(index)} />
          </clipPath>
        ))}
      </defs>

      <polygon
        filter="url(#week-shadow)"
        className="fill-black opacity-15 dark:opacity-60"
        transform="translate(0 18)"
        points={points([
          [PLATE.x, PLATE.y, -PLATE_DEPTH],
          [PLATE.x + PLATE.w, PLATE.y, -PLATE_DEPTH],
          [PLATE.x + PLATE.w, PLATE.y + PLATE.d, -PLATE_DEPTH],
          [PLATE.x, PLATE.y + PLATE.d, -PLATE_DEPTH],
        ])}
      />
      <Box {...PLATE} z={-PLATE_DEPTH} h={PLATE_DEPTH} faces={PLATE_FACES} />

      {days.map((index) => {
        const y = dayY(index);
        return (
          <polygon
            key={index}
            style={{
              fill: "color-mix(in oklch, var(--muted), var(--foreground) 7%)",
            }}
            points={points([
              [-SOCKET_RIM, y - SOCKET_RIM, 0],
              [SIZE + SOCKET_RIM, y - SOCKET_RIM, 0],
              [SIZE + SOCKET_RIM, y + SIZE + SOCKET_RIM, 0],
              [-SOCKET_RIM, y + SIZE + SOCKET_RIM, 0],
            ])}
          />
        );
      })}

      {/* Back to front, so nearer columns are drawn over further ones. */}
      {days.toReversed().map((index) => (
        <Column key={index} index={index} />
      ))}
    </svg>
  );
}

/** The drawing with its legend and pitch, for the wide sign-in panel. */
export function WeekIllustration() {
  return (
    <figure className="@container flex w-full max-w-xl flex-col gap-8">
      <WeekDrawing />
      <figcaption
        style={{ paddingLeft: CAPTION_INDENT }}
        className="flex flex-col gap-3"
      >
        <span className="flex gap-5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <KindMark kind="preparation" />
            Preparation
          </span>
          <span className="flex items-center gap-1.5">
            <KindMark kind="execution" />
            Execution
          </span>
        </span>
        <span className="max-w-prose text-lg leading-snug text-muted-foreground">
          For people with more ideas than hours. Time every session, see what
          it actually produced, and get a straight answer on where your next
          hour should go.
        </span>
      </figcaption>
    </figure>
  );
}
