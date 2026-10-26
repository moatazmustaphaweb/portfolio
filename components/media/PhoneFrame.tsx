/**
 * A phone device frame around a portrait screenshot, in CSS.
 *
 * The sibling of `DeviceFrame` (the laptop) and built the same way and for the
 * same reason — a CSS box grows to what is inside it, an SVG viewBox cannot.
 * Read that file's header first; it carries the argument, and this one only
 * records where the phone differs.
 *
 * ── WHAT IS SHARED, AND WHAT IS NOT ─────────────────────────────────────────
 *
 * SHARED, because `designs/MockUp.svg` uses the identical values: white body,
 * `#E0E1E6` hairline, `#EAEAEC` screen, and the same drop shadow to the pixel
 * (dx -7, dy 19, stdDeviation 19.5, rgb(88,89,92) @ 30%). So the phone reads
 * the same `--device-*` tokens the laptop does and inherits its dark theme —
 * coal gradient, no shadow — for free. Only the notch and the camera lens
 * needed tokens of their own — and, since task `002221026`, the hairlines:
 * `--device-phone-edge` is `--device-edge` in light and a lighter grey in
 * dark, where the shared edge vanished into the body gradient.
 *
 * NOT SHARED: the radii. A laptop's corners are a small constant; a phone's
 * are 17% of its width, and that is the difference between the two objects
 * rather than a detail. Which forces the next decision.
 *
 * ── WHY cqw AND NOT PIXELS ──────────────────────────────────────────────────
 *
 * The laptop keeps its insets in absolute pixels, deliberately: a bezel is a
 * physical part that does not thin out as the picture shrinks.
 *
 * ⚠️ THE SAME CHOICE WOULD BE WRONG HERE, AND VISIBLY SO. The mockup's outer
 * radius is 82.5 on a body 478.42 wide. Held at 82.5px while the frame renders
 * at 300px, the corner eats 27% of the width and the phone turns into a
 * lozenge. A phone is defined by its proportions in a way a laptop bezel is
 * not, so every value here scales.
 *
 * `container-type: inline-size` on the wrapper makes `1cqw` = 1% of the
 * frame's own width, which is exactly the unit the mockup is drawn in. Every
 * number below is `<svg value> / 478.42`, so the file can be checked against
 * the design with a calculator rather than by eye. Percentages could not do
 * this: `border-radius: 17%` resolves against each axis separately and would
 * draw an ellipse on a box this tall.
 *
 * ── THE GEOMETRY, FROM designs/MockUp.svg ───────────────────────────────────
 *
 *   body    49.60,  20.50   478.42 x 987.85  r 82.50  white, 1px #E0E1E6
 *   inner   55.50,  25.92   466.62 x 975.66  r 77.79  white, 1px #E0E1E6
 *   screen  70.59,  40.53   436.45 x 946.44  r 61.24  #EAEAEC
 *   island 220.37,  53.87   138.27 x  39.32  pill     #F5F5F6, 1px #ECECEF
 *   lens   338.30,  73.54   r 11.10 over r 6.01
 *
 * The screen is 436.45 x 946.44, a ratio of 0.4612. The phone screenshots in
 * `media` are 786 x 1704, a ratio of 0.4613. The mockup was drawn around these
 * exact pictures, which is why nothing has to be cropped to fit it.
 *
 * ── THE BUTTONS AND THE LENS DO NOT MIRROR ──────────────────────────────────
 *
 * They are positioned with `left` and `right`, which `rtl-guard` otherwise
 * forbids, and the exception is deliberate. That skill's own test is: if the
 * answer depends on which page you are on it is layout, and if it depends on
 * what the thing is it is not. A phone's volume keys do not move to the other
 * side in Arabic. `start`/`end` here would flip a physical object.
 *
 * ── THE SECOND VARIANT: `variant="android"` ─────────────────────────────────
 *
 * Added 2026-10-22, task `002221026`, for Moataz to look at. It is NOT wired
 * to any page and nothing selects it yet; `variant` defaults to "default" and
 * that path renders the same markup as before the prop existed.
 *
 * Named for what the object is, not for how it looks: its keys sit where an
 * Android phone's do (volume rocker and power, both on the right), and the
 * pictures it was drawn for are Android screens (Kshemam, 720x1600). A
 * looks-based name like "flat" would read as "no shadow", which it is not.
 *
 * Same construction, tokens, shadow, dark theme, `cqw` unit and max width.
 * What differs, in the same 478.42-wide units as the mockup:
 *
 *   body    r 48.00  (10.0% of width; default 82.50 = 17.2%)
 *   ring    r 42.10  = 48.00 - 5.90 inset, concentric with the body
 *   screen  r 26.00  = 42.10 - 15.09 inset - 1 hairline, concentric again
 *   insets  5.90 and 15.09 on all four sides (the default's horizontal
 *           values; the default runs 0.48 thinner top and bottom)
 *   no Dynamic Island, no lens — nothing is drawn over the screen
 *   power   right, y 250, h 72     volume rocker  right, y 352, h 150
 *
 * At the 320px cap that is a 32px outer corner against the default's 55px.
 * The radii step down by their insets so the three rings stay parallel; a
 * screen radius chosen independently is what makes a bezel look uneven.
 *
 * Fit: the screen box follows its picture (see `DeviceFrame`), so a 720x1600
 * image (0.45) renders at its own ratio, uncropped and unletterboxed, exactly
 * as a 786x1704 one (0.461) does. Only the height changes, and the buttons
 * are placed in % of height, so they ride with it.
 */

/** The rendered cap. See the note at its use site for why it is not 478.42. */
export const PHONE_FRAME_MAX_W = 320;

/** Every measurement in the mockup, as a percentage of the body's width. */
const SVG_W = 478.42;
const pc = (n: number) => `${((n / SVG_W) * 100).toFixed(3)}cqw`;

/*
 * Vertical button offsets are percentages of the frame's HEIGHT, not `cqw`.
 * The height comes from whatever picture is inside, so a screenshot that is
 * not exactly 786x1704 shifts the buttons proportionally instead of leaving
 * them at an absolute offset that no longer means anything.
 */
const SVG_BODY_TOP = 20.5;
const SVG_BODY_H = 987.85;
const vy = (n: number) => `${(((n - SVG_BODY_TOP) / SVG_BODY_H) * 100).toFixed(3)}%`;
const vh = (n: number) => `${((n / SVG_BODY_H) * 100).toFixed(3)}%`;

type Button = { side: "left" | "right"; top: string; height: string };

/** silent switch, volume up, volume down — all on the left edge. */
const LEFT_BUTTONS = [
  { top: vy(209.32), height: vh(37.78) },
  { top: vy(281.07), height: vh(74.76) },
  { top: vy(376.38), height: vh(74.76) },
];

export type PhoneFrameVariant = "default" | "android";

/**
 * Everything that differs between the variants, and nothing else. The JSX
 * below is shared, so a change to the construction reaches both.
 */
const GEOMETRY: Record<
  PhoneFrameVariant,
  {
    bodyPadding: string;
    bodyRadius: string;
    ringPadding: string;
    ringRadius: string;
    screenRadius: string;
    buttons: Button[];
    island: boolean;
  }
> = {
  default: {
    bodyPadding: `${pc(5.42)} ${pc(5.9)}`,
    bodyRadius: pc(82.5),
    ringPadding: `${pc(14.61)} ${pc(15.09)}`,
    ringRadius: pc(77.79),
    screenRadius: pc(61.24),
    buttons: [
      ...LEFT_BUTTONS.map((b) => ({ side: "left" as const, ...b })),
      // Power, on the right, longer than any of the left three.
      { side: "right", top: vy(332.68), height: vh(118.42) },
    ],
    island: true,
  },
  /*
   * See the header for the numbers and the reasoning. Both keys on the right,
   * power above the volume rocker, in the same `left`/`right` physical
   * exception as the default's.
   */
  android: {
    bodyPadding: pc(5.9),
    bodyRadius: pc(48),
    ringPadding: pc(15.09),
    ringRadius: pc(42.1),
    screenRadius: pc(26),
    buttons: [
      { side: "right", top: vy(250), height: vh(72) },
      { side: "right", top: vy(352), height: vh(150) },
    ],
    island: false,
  },
};

function SideButton({ side, top, height }: Button) {
  return (
    <span
      aria-hidden="true"
      style={{
        position: "absolute",
        [side]: pc(-3.6),
        top,
        height,
        width: pc(3.6),
        background: "var(--device-bezel)",
        borderTop: `${pc(1)} solid var(--device-phone-edge)`,
        borderBottom: `${pc(1)} solid var(--device-phone-edge)`,
        // Rounded on the outer end only, the way a real key is.
        borderRadius:
          side === "left"
            ? `${pc(2)} 0 0 ${pc(2)}`
            : `0 ${pc(2)} ${pc(2)} 0`,
      }}
    />
  );
}

/*
 * The Dynamic Island, and the lens inside it. Centred with `left: 50%` and a
 * transform because the island IS centred; the lens inside it is not, and
 * uses `right`. Default variant only.
 */
function DynamicIsland() {
  return (
    <span
      aria-hidden="true"
      style={{
        position: "absolute",
        top: pc(13.34),
        left: "50%",
        transform: "translateX(-50%)",
        width: pc(138.27),
        height: pc(39.32),
        borderRadius: pc(19.66),
        background: "var(--device-notch)",
        border: `${pc(1)} solid var(--device-notch-edge)`,
        display: "block",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "50%",
          right: pc(9.24),
          transform: "translateY(-50%)",
          width: pc(22.2),
          height: pc(22.2),
          borderRadius: "50%",
          background: "var(--device-notch-edge)",
          display: "block",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: pc(12.02),
            height: pc(12.02),
            borderRadius: "50%",
            background: "var(--device-lens)",
            display: "block",
          }}
        />
      </span>
    </span>
  );
}

export function PhoneFrame({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: PhoneFrameVariant;
}) {
  const g = GEOMETRY[variant];
  return (
    <div
      /*
       * `me-auto` keeps a frame narrower than its column against the inline
       * start — left in English, right in Arabic. That IS layout and does
       * mirror, unlike the buttons.
       *
       * `maxWidth` is 320, NOT the mockup's own 478.42. At its drawn width the
       * frame is 987px tall — a full screen of scrolling for one picture, and
       * a wall between two paragraphs of the kind `--figure-max-h` exists to
       * prevent elsewhere. 320 renders it around 660px, which is also roughly
       * the size a phone appears beside a laptop in the real world.
       *
       * Because every value is in `cqw`, shrinking the frame is one number
       * here and nothing else changes.
       *
       * EXPORTED, because `ChapterFigure` has to cap the <figure> to the same
       * number: the floating caption centres on the figure box, so if the two
       * disagree the chip drifts off the device. One constant, two readers.
       * Both variants share it.
       */
      className="me-auto w-full"
      style={{ maxWidth: PHONE_FRAME_MAX_W, containerType: "inline-size" }}
    >
      <div style={{ position: "relative" }}>
        {g.buttons.map((b) => (
          <SideButton key={`${b.side}-${b.top}`} {...b} />
        ))}

        {/* Body. */}
        <div
          style={{
            padding: g.bodyPadding,
            borderRadius: g.bodyRadius,
            background: "var(--device-body)",
            border: `${pc(1)} solid var(--device-phone-edge)`,
            boxShadow: "var(--device-shadow)",
          }}
        >
          {/* The second hairline ring. It is what makes the edge read as
              metal rather than as a single drawn outline. */}
          <div
            style={{
              padding: g.ringPadding,
              borderRadius: g.ringRadius,
              background: "var(--device-body)",
              border: `${pc(1)} solid var(--device-phone-edge)`,
            }}
          >
            {/* Screen. `overflow: hidden` rounds the picture's corners, so
                this file never touches the image's own class list. */}
            <div
              style={{
                position: "relative",
                borderRadius: g.screenRadius,
                overflow: "hidden",
                background: "var(--device-bezel)",
                lineHeight: 0,
              }}
            >
              {children}
              {g.island ? <DynamicIsland /> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
