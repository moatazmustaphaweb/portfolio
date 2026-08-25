/**
 * A laptop device frame around a screenshot, drawn as SVG.
 *
 * Traced from `designs/Device - Macbook Pro.svg`, not eyeballed. That file is
 * three nested rounded rectangles and one drop shadow, and every number here
 * is its own, in its own 894 x 632 viewBox:
 *
 *   body    47,21   814 x 552  r27  white, 2px stroke #E0E1E6
 *   bezel   51,25   806 x 542  r22  #EAEAEC
 *   screen  61,35   786 x 522  r18  the picture
 *   shadow  dx -7, dy 19, stdDeviation 19.5, rgb(88,89,92) @ 30%
 *
 * The viewBox is larger than the device on every side, which is what gives the
 * shadow room to fall without being clipped. Keep it.
 *
 * ── THE SCREEN CROPS, AND THAT IS THE DECISION ──────────────────────────────
 *
 * The screen is 786/522, a hair over 3:2. The screenshots are not: Cervello's
 * are 16:9, Egypt's are taller again. An earlier version of this component
 * shrink-wrapped the picture so nothing was cropped, and it was wrong. A frame
 * whose proportions change with its contents is not a device, it is a border,
 * and the whole point of a device is that it is the same object every time.
 *
 * So `object-fit: cover` crops to the screen. Some of the picture is lost. What
 * is bought is that every framed screenshot on the site is the same shape, and
 * the result reads as an export rather than as a photograph with a rule around
 * it.
 *
 * ── WHY foreignObject AND NOT <image> ───────────────────────────────────────
 *
 * `<image href="...">` needs a URL, and rule 3 says a URL is never held
 * anywhere but the moment of render, built by `CloudinaryImage` from a
 * public_id and a named preset. Putting one in an href would mean building it
 * here, which is the thing the rule exists to stop.
 *
 * `<foreignObject>` keeps the real component inside the real SVG: responsive
 * srcset, lazy loading, the alt omission, and the NDA grayscale all keep
 * working, and this file stays ignorant of every one of them.
 *
 * The rounding of the picture's corners is done by the wrapper div's own
 * `overflow: hidden`, not by a clipPath. A clipPath would also have to know the
 * radius, and then there would be two places holding the number 18.
 */
export function DeviceFrame({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 894 632"
      /*
       * Responsive by construction: no width or height attribute, so the
       * viewBox governs and CSS sets the box. `me-auto` keeps a frame narrower
       * than its column against the inline start, which is the left in English
       * and the right in Arabic. The chrome is symmetric, so nothing else
       * mirrors.
       */
      className="me-auto block h-auto w-full"
      style={{ maxWidth: 894 }}
      role="presentation"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter
          id="device-frame-shadow"
          x="0"
          y="0"
          width="894"
          height="632"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="-7" dy="19" />
          <feGaussianBlur stdDeviation="19.5" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.345098 0 0 0 0 0.34902 0 0 0 0 0.360784 0 0 0 0.3 0"
          />
          <feBlend mode="normal" in2="BackgroundImageFix" result="shadow" />
          <feBlend mode="normal" in="SourceGraphic" in2="shadow" result="shape" />
        </filter>
      </defs>

      <g filter="url(#device-frame-shadow)">
        <rect
          x="47"
          y="21"
          width="814"
          height="552"
          rx="27"
          fill="white"
          stroke="#E0E1E6"
          strokeWidth="2"
        />
        <rect x="51" y="25" width="806" height="542" rx="22" fill="#EAEAEC" />
        <rect x="61" y="35" width="786" height="522" rx="18" fill="white" />
      </g>

      <foreignObject x="61" y="35" width="786" height="522">
        {/*
          Inside a foreignObject the units are viewBox units, so 786 x 522 here
          is exactly the screen rect above. `leading-none` removes the inline
          descender space under the image, which otherwise shows as a thin strip
          of bezel along the bottom edge only and reads as a rendering fault.
        */}
        <div
          style={{
            width: 786,
            height: 522,
            borderRadius: 18,
            overflow: "hidden",
            lineHeight: 0,
          }}
        >
          {children}
        </div>
      </foreignObject>
    </svg>
  );
}
