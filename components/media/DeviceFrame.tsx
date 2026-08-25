/**
 * A laptop device frame around a screenshot.
 *
 * ── WHY THIS IS CSS AND NOT SVG ─────────────────────────────────────────────
 *
 * The first version of this component was a real SVG, traced from
 * `designs/Device - Macbook Pro.svg`, and it was correct about the chrome and
 * wrong about the job. An SVG is a fixed coordinate system: the `viewBox` is
 * declared before anything is drawn, so the frame's proportions are decided at
 * author time and every picture inside has to be cropped to fit them. Making
 * that frame follow its contents would mean computing a viewBox per image from
 * the media row's width and height — three nested rectangles recalculated for
 * every screenshot, and a `foreignObject` whose inner HTML lays out in viewBox
 * units rather than CSS pixels, which is what made the picture render at the
 * wrong scale.
 *
 * CSS has the opposite default. Three nested boxes with padding, a radius and a
 * shadow describe the same object, and a box in normal flow already grows to
 * whatever is inside it. The image keeps its own aspect ratio, nothing is
 * cropped, and the bezel wraps whatever shape arrives — 16:9 from Cervello,
 * taller from Egypt, a phone screenshot if one is ever framed.
 *
 * So the frame is dynamic by construction rather than by calculation, and no
 * component has to know a picture's dimensions to draw a border around it.
 *
 * ── THE NUMBERS ARE STILL THE DESIGN'S ──────────────────────────────────────
 *
 * From `designs/Device - Macbook Pro.svg`, which is three rounded rectangles
 * and one drop shadow. Read as insets rather than as absolute rects:
 *
 *   body    r27  white, 2px stroke #E0E1E6, 4px of padding around the bezel
 *   bezel   r22  #EAEAEC, 10px of padding around the screen
 *   screen  r18  the picture
 *   shadow  dx -7, dy 19, blur 39 (2 x stdDeviation 19.5), rgb(88,89,92) @ 30%
 *
 * The insets stay in absolute pixels on purpose. A bezel is a physical part of
 * a physical object: it does not get thinner because the picture is smaller,
 * and scaling it proportionally is what makes a frame read as a border.
 *
 * `maxWidth: 894` is the design's own outer width, so a framed picture never
 * renders larger than the frame was drawn.
 */
export function DeviceFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      /*
       * `me-auto` keeps a frame narrower than its column against the inline
       * start — the left in English, the right in Arabic. The chrome is
       * symmetric, so nothing else mirrors.
       */
      className="me-auto w-full"
      style={{ maxWidth: 894 }}
    >
      <div
        style={{
          padding: 4,
          borderRadius: 27,
          background: "white",
          border: "2px solid #E0E1E6",
          boxShadow: "-7px 19px 39px rgba(88, 89, 92, 0.3)",
        }}
      >
        <div style={{ padding: 10, borderRadius: 22, background: "#EAEAEC" }}>
          {/*
            `overflow: hidden` is what rounds the picture's corners, rather than
            a radius on the image itself — the image is a child component and
            this file does not reach into its class list. `lineHeight: 0`
            removes the inline descender space under the image, which otherwise
            shows as a thin strip of bezel along the bottom edge only and reads
            as a rendering fault.
          */}
          <div style={{ borderRadius: 18, overflow: "hidden", lineHeight: 0 }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
