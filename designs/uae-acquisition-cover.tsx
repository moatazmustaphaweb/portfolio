/**
 * Case File Cover — UAE Acquisition.
 *
 * MOATAZ'S ARTWORK, VERBATIM. The geometry is his: all 100 <path> elements and
 * 4 <rect>s from `designs/OBJECTS.svg` are copied across unchanged — same
 * coordinates, same transform matrices, same node structure, same order. Not
 * one point was redrawn, simplified or regenerated. `designs/OBJECTS.svg`
 * stays exactly where it is, under exactly that name, as the source of record.
 *
 * ── WHAT CHANGED, AND ONLY THIS ─────────────────────────────────────────────
 *
 * 1. COLOUR → TOKENS. A cover lives in the repo instead of on Cloudinary
 *    precisely so it follows the theme; baked colour renders identically in
 *    dark and light, which is the failure the whole approach exists to avoid.
 *
 *      stroke rgb(0,255,255)  ×51  →  var(--color-fg-body)   the mesh
 *      stroke white           ×51  →  var(--color-fg)        structural lines
 *      fill   rgb(0,255,255)  ×2   →  var(--color-accent)    ← the accent
 *
 *    The accent lands on the only two FILLED cyan shapes in the file: the
 *    circular endpoint markers of the scan beam, at eye level. They are the
 *    capture moment — the same role the lock ring played in the generated
 *    cover this replaces — and they are used twice because the composition is
 *    symmetric, one marker per side of a single element.
 *
 * 2. THE 9 EMBEDDED RASTERS ARE GONE (approved, not assumed — option 1).
 *    The export carried 9 base64 PNGs, 79% of its 141KB: the glow bloom, the
 *    dark navy panel, the perspective grid floor, and four glow blobs. Pixels
 *    cannot take a token — they would have rendered fixed cyan in both themes
 *    and punched a dark square into the light page. Dropping them costs the
 *    bloom, the panel and the grid; the mesh itself was always vector and is
 *    untouched. This was Moataz's call after seeing both rendered.
 *
 * 3. The `_clip1` clipPath is dropped — it was a 500×500 rect identical to the
 *    viewBox, so it clipped nothing, and its id would have collided with the
 *    Egypt cover on the gallery page. No ids or classes remain: the OBJECTS
 *    group carried none, so there is nothing left to namespace.
 *
 * No <text>, no fonts, no <style>, no script, no animation or SMIL in the
 * source — nothing to strip for decision 023, and no typeface question.
 *
 * NDA (decision 050): UAE carries nda = true. All 9 PNGs were decoded and
 * viewed before any of this — a low-poly facial-recognition mesh over a grid.
 * No screen geometry, no field layouts, no interface fragments. Rule 6 is not
 * engaged, and the badge on the card carries the NDA signal.
 *
 * Ground is transparent by design: the page's own --color-bg shows through,
 * which is what lets the mesh sit on either theme.
 */

export type UaeAcquisitionCoverProps = {
  /** Accessible name — what a screen reader announces. */
  alt: string;
  /** Read after the name. What the artwork shows. */
  description: string;
  uid?: string;
  className?: string;
};

export function UaeAcquisitionCover({
  alt,
  description,
  uid = "uae-acquisition-cover",
  className,
}: UaeAcquisitionCoverProps) {
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;

  return (
    <svg
      viewBox="0 0 500 500"
      className={className}
      role="img"
      aria-labelledby={`${titleId} ${descId}`}
      xmlns="http://www.w3.org/2000/svg"
      fillRule="evenodd"
      clipRule="evenodd"
      strokeMiterlimit={10}
    >
      <title id={titleId}>{alt}</title>
      <desc id={descId}>{description}</desc>

      {/* Moataz's geometry, verbatim. Decorative — the artwork is named above. */}
      <g aria-hidden="true">

      <g transform="matrix(0,-1,-1,0,417.343,155.1086)">
      <path d="M-2.781,-2.781C-4.317,-2.781 -5.562,-1.536 -5.562,0C-5.562,1.535 -4.317,2.781 -2.781,2.781C-1.245,2.781 0,1.535 0,0C0,-1.536 -1.245,-2.781 -2.781,-2.781" fill="var(--color-accent)" fillRule="nonzero"/>
      </g>
      <g transform="matrix(0,-1,-1,0,82.657,155.1086)">
      <path d="M-2.781,-2.781C-4.317,-2.781 -5.562,-1.536 -5.562,0C-5.562,1.536 -4.317,2.781 -2.781,2.781C-1.245,2.781 0,1.536 0,0C0,-1.536 -1.245,-2.781 -2.781,-2.781" fill="var(--color-accent)" fillRule="nonzero"/>
      </g>
      <g transform="matrix(1,0,0,1,356.5674,336.3263)">
      <path d="M0,-202.295L-37.805,-258.506L-107.112,-274.573L-176.419,-258.506L-214.223,-202.295L-220.523,-130.949L-199.521,-1.23L-144.916,72.278L-69.308,72.278L-14.702,-1.23L6.3,-130.949L0,-202.295Z" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(1,0,0,1,215.9897,222.1499)">
      <path d="M0,0L-7.957,-10.795L-42.877,-10.795L-49.354,-0.323L-36.214,10.795L-2.482,9.545L0,0Z" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(-1,0,0,1,498.911,38.322)">
      <rect x="242.257" y="190.433" width="14.397" height="80.812" fill="none" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(1,0,0,1,249.4556,228.756)">
      <path d="M20.163,-22.088L-20.162,-22.088L-7.199,0L7.199,0L20.163,-22.088Z" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(1,0,0,1,229.2935,300.116)">
      <path d="M0,-93.448L-13.304,-99.748L-75.608,-102.899L-86.004,-82.404L-56.706,-51.233L-7.329,-56.589L12.963,-71.36L-7.329,-3.672L12.963,9.451" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(1,0,0,1,153.6855,77.8203)">
      <path d="M0,119.397L6.931,50.089L33.394,8.978L26.463,0" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(0.948194,-0.317691,-0.317691,-0.948194,143.789948,136.775146)">
      <path d="M-0.499,3.061C2.955,5.716 18.771,3.061 18.771,3.061" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(0.586553,-0.809911,-0.809911,-0.586553,214.127343,212.30546)">
      <path d="M-2.804,5.494L10.761,5.494" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(0.651743,-0.75844,-0.75844,-0.651743,224.177389,224.499185)">
      <path d="M-3.554,7.741L16.858,7.741" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(0.581537,0.81352,0.81352,-0.581537,220.089761,230.73055)">
      <path d="M-3.043,-5.916L11.501,-5.916" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(-0.808572,-0.588397,-0.588397,0.808572,159.703817,192.855214)">
      <path d="M-21.727,7.069L2.3,7.068" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(-0.411121,0.911581,0.911581,0.411121,181.96822,247.466743)">
      <path d="M-12.336,-7.969L5.148,-7.969" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(1,0,0,1,287.752,345.2032)">
      <path d="M0,-8.505L-28.724,-10.868L-38.298,-6.143L-47.873,-10.868L-76.596,-8.505L-83.378,-1.89L-38.298,2.363L6.782,-1.89L0,-8.505Z" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(1,0,0,1,249.4541,354.9694)">
      <path d="M0,-7.403L-45.081,-11.656L-18.883,4.253L18.883,4.253L45.08,-11.656L0,-7.403Z" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(-0.892299,0.451444,0.451444,0.892299,133.738917,256.410273)">
      <path d="M-60.651,75.551L-21.554,75.551L-6.901,45.895L-25.992,-30.218L-44.967,-16.008" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(-0.139249,0.990257,0.990257,0.139249,258.524784,346.502726)">
      <path d="M-22.144,-75.262L9.828,-75.262L68.024,-37.768L32.979,-19.314L16.297,-24.548" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(-0.923092,-0.38458,-0.38458,0.923092,160.078556,330.587587)">
      <path d="M-26.648,5.329L1.066,5.329" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(-0.731891,0.681421,0.681421,0.731891,155.603006,304.725567)">
      <path d="M-10.809,-4.253L1.673,-4.253" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(0.448478,0.893794,0.893794,-0.448478,233.548371,244.546631)">
      <path d="M-6.106,-9.896L16.037,-9.896" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(0.351388,-0.93623,-0.93623,-0.351388,232.018442,336.348219)">
      <path d="M-16.235,23.434L33.826,23.434" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(1,0,0,1,282.9687,222.1363)">
      <path d="M0,-0.001L7.956,-10.796L42.877,-10.796L49.353,-0.324L36.214,10.795L2.482,9.544L0,-0.001Z" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(1,0,0,1,0,38.294)">
      <rect x="242.303" y="190.447" width="14.398" height="80.812" fill="none" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(1,0,0,1,249.502,228.7413)">
      <path d="M-20.162,-22.088L20.162,-22.088L7.199,0L-7.199,0L-20.162,-22.088Z" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(1,0,0,1,269.6641,300.1013)">
      <path d="M0,-93.448L13.305,-99.748L75.608,-102.899L86.004,-82.404L56.706,-51.233L7.329,-56.589L-12.963,-71.36L7.329,-3.672L-12.963,9.451" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(1,0,0,1,345.2725,77.8056)">
      <path d="M0,119.397L-6.931,50.089L-33.394,8.978L-26.463,0" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(-0.948189,-0.317706,-0.317706,0.948189,339.788117,125.150786)">
      <path d="M-18.77,3.061C-15.317,0.406 0.499,3.061 0.499,3.061" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(-0.586505,-0.809946,-0.809946,0.586505,289.063121,199.402372)">
      <path d="M-10.761,5.494L2.805,5.494" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(-0.651771,-0.758416,-0.758416,0.651771,277.851188,204.303579)">
      <path d="M-16.859,7.741L3.554,7.741" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(-0.581537,0.81352,0.81352,0.581537,283.575661,244.47745)">
      <path d="M-11.501,-5.916L3.043,-5.916" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(0.808572,-0.588397,-0.588397,-0.808572,331.864217,215.702086)">
      <path d="M-2.3,7.068L21.727,7.069" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(0.411095,0.911593,0.911593,-0.411095,328.562857,234.348084)">
      <path d="M-5.148,-7.968L12.335,-7.968" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(1,0,0,1,211.2061,345.1886)">
      <path d="M0,-8.505L28.724,-10.868L38.298,-6.143L47.872,-10.868L76.596,-8.505L83.378,-1.89L38.298,2.363L-6.782,-1.89L0,-8.505Z" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(1,0,0,1,249.5039,354.9548)">
      <path d="M0,-7.403L45.08,-11.656L18.883,4.253L-18.883,4.253L-45.08,-11.656L0,-7.403Z" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(0.892299,0.451444,0.451444,-0.892299,267.442317,275.381727)">
      <path d="M18.024,-14.469L57.121,-14.469L71.774,15.187L52.683,91.3L33.708,77.09" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(0.139249,0.990257,0.990257,-0.139249,340.048584,376.182074)">
      <path d="M-65.42,-19.248L-33.448,-19.248L24.748,-56.742L-10.297,-75.196L-26.979,-69.962" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(0.923087,-0.384592,-0.384592,-0.923087,319.364354,350.249456)">
      <path d="M-1.066,5.329L26.647,5.329" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(0.731891,0.681421,0.681421,-0.731891,342.464606,292.259933)">
      <path d="M-1.673,-4.253L10.809,-4.253" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(-0.448478,0.893794,0.893794,0.448478,278.645771,262.284469)">
      <path d="M-16.037,-9.896L6.106,-9.896" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(-0.350414,-0.936595,-0.936595,0.350414,304.646051,303.442689)">
      <path d="M-33.799,23.442L16.258,23.442" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(1,-0.000224,-0.000224,-1,215.989703,200.3752)">
      <path d="M-0,0.007L66.979,0.007" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(0.985156,-0.171663,-0.171663,-0.985156,188.474967,92.071457)">
      <path d="M-0.47,5.435L62.846,5.434" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(0,-1,-1,0,256.5436,68.8412)">
      <path d="M-7.088,7.088L7.088,7.088" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(0.985218,0.171308,0.171308,-0.985218,250.84667,70.662649)">
      <path d="M-0.468,-5.427L62.891,-5.427" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(0.97374,0.227662,0.227662,-0.97374,162.704862,122.088855)">
      <path d="M-0.709,-6.143L53.262,-6.143" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(0.999915,-0.013017,-0.013017,-0.999915,213.174018,140.43276)">
      <path d="M-0.002,0.236L36.336,0.237" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(-0.085615,0.996328,0.996328,0.085615,240.156312,175.197942)">
      <path d="M-32.563,-29.885L27.427,-29.885" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(-0.973741,0.227658,0.227658,0.973741,289.139125,146.017557)">
      <path d="M-53.263,-6.143L0.709,-6.143" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(-0.999921,-0.012597,-0.012597,0.999921,249.508269,139.486838)">
      <path d="M-37.548,0.237L0.001,0.237" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(0.085632,0.996327,0.996327,-0.085632,319.174084,164.962669)">
      <path d="M-27.426,-29.885L32.563,-29.885" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(0.190213,-0.981743,-0.981743,-0.190213,247.310928,121.618671)">
      <path d="M-24.733,29.985L36.352,29.985" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(-0.141591,-0.989925,-0.989925,0.141591,311.367692,102.449579)">
      <path d="M-33.923,29.416L25.508,29.416" fill="none" fillRule="nonzero" stroke="var(--color-fg-body)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(1,0,0,1,356.5674,336.3263)">
      <path d="M0,-202.295L-37.805,-258.506L-107.112,-274.573L-176.419,-258.506L-214.223,-202.295L-220.523,-130.949L-199.521,-1.23L-144.916,72.278L-69.308,72.278L-14.702,-1.23L6.3,-130.949L0,-202.295Z" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(1,0,0,1,215.9897,222.1499)">
      <path d="M0,0L-7.957,-10.795L-42.877,-10.795L-49.354,-0.323L-36.214,10.795L-2.482,9.545L0,0Z" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(-1,0,0,1,498.911,38.322)">
      <rect x="242.257" y="190.433" width="14.397" height="80.812" fill="none" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(1,0,0,1,249.4556,228.756)">
      <path d="M20.163,-22.088L-20.162,-22.088L-7.199,0L7.199,0L20.163,-22.088Z" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(1,0,0,1,229.2935,300.116)">
      <path d="M0,-93.448L-13.304,-99.748L-75.608,-102.899L-86.004,-82.404L-56.706,-51.233L-7.329,-56.589L12.963,-71.36L-7.329,-3.672L12.963,9.451" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(1,0,0,1,153.6855,77.8203)">
      <path d="M0,119.397L6.931,50.089L33.394,8.978L26.463,0" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(0.948194,-0.317691,-0.317691,-0.948194,143.789948,136.775146)">
      <path d="M-0.499,3.061C2.955,5.716 18.771,3.061 18.771,3.061" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(0.586553,-0.809911,-0.809911,-0.586553,214.127343,212.30546)">
      <path d="M-2.804,5.494L10.761,5.494" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(0.651743,-0.75844,-0.75844,-0.651743,224.177389,224.499185)">
      <path d="M-3.554,7.741L16.858,7.741" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(0.581537,0.81352,0.81352,-0.581537,220.089761,230.73055)">
      <path d="M-3.043,-5.916L11.501,-5.916" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(-0.808572,-0.588397,-0.588397,0.808572,159.703817,192.855214)">
      <path d="M-21.727,7.069L2.3,7.068" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(-0.411121,0.911581,0.911581,0.411121,181.96822,247.466743)">
      <path d="M-12.336,-7.969L5.148,-7.969" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(1,0,0,1,287.752,345.2032)">
      <path d="M0,-8.505L-28.724,-10.868L-38.298,-6.143L-47.873,-10.868L-76.596,-8.505L-83.378,-1.89L-38.298,2.363L6.782,-1.89L0,-8.505Z" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(1,0,0,1,249.4541,354.9694)">
      <path d="M0,-7.403L-45.081,-11.656L-18.883,4.253L18.883,4.253L45.08,-11.656L0,-7.403Z" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(-0.892299,0.451444,0.451444,0.892299,133.738917,256.410273)">
      <path d="M-60.651,75.551L-21.554,75.551L-6.901,45.895L-25.992,-30.218L-44.967,-16.008" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(-0.139249,0.990257,0.990257,0.139249,258.524784,346.502726)">
      <path d="M-22.144,-75.262L9.828,-75.262L68.024,-37.768L32.979,-19.314L16.297,-24.548" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(-0.923092,-0.38458,-0.38458,0.923092,160.078556,330.587587)">
      <path d="M-26.648,5.329L1.066,5.329" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(-0.731891,0.681421,0.681421,0.731891,155.603006,304.725567)">
      <path d="M-10.809,-4.253L1.673,-4.253" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(0.448478,0.893794,0.893794,-0.448478,233.548371,244.546631)">
      <path d="M-6.106,-9.896L16.037,-9.896" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(0.351388,-0.93623,-0.93623,-0.351388,232.018442,336.348219)">
      <path d="M-16.235,23.434L33.826,23.434" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(1,0,0,1,282.9687,222.1363)">
      <path d="M0,-0.001L7.956,-10.796L42.877,-10.796L49.353,-0.324L36.214,10.795L2.482,9.544L0,-0.001Z" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(1,0,0,1,0,38.294)">
      <rect x="242.303" y="190.447" width="14.398" height="80.812" fill="none" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(1,0,0,1,249.502,228.7413)">
      <path d="M-20.162,-22.088L20.162,-22.088L7.199,0L-7.199,0L-20.162,-22.088Z" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(1,0,0,1,269.6641,300.1013)">
      <path d="M0,-93.448L13.305,-99.748L75.608,-102.899L86.004,-82.404L56.706,-51.233L7.329,-56.589L-12.963,-71.36L7.329,-3.672L-12.963,9.451" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(1,0,0,1,345.2725,77.8056)">
      <path d="M0,119.397L-6.931,50.089L-33.394,8.978L-26.463,0" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(-0.948189,-0.317706,-0.317706,0.948189,339.788117,125.150786)">
      <path d="M-18.77,3.061C-15.317,0.406 0.499,3.061 0.499,3.061" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(-0.586505,-0.809946,-0.809946,0.586505,289.063121,199.402372)">
      <path d="M-10.761,5.494L2.805,5.494" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(-0.651771,-0.758416,-0.758416,0.651771,277.851188,204.303579)">
      <path d="M-16.859,7.741L3.554,7.741" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(-0.581537,0.81352,0.81352,0.581537,283.575661,244.47745)">
      <path d="M-11.501,-5.916L3.043,-5.916" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(0.808572,-0.588397,-0.588397,-0.808572,331.864217,215.702086)">
      <path d="M-2.3,7.068L21.727,7.069" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(0.411095,0.911593,0.911593,-0.411095,328.562857,234.348084)">
      <path d="M-5.148,-7.968L12.335,-7.968" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(1,0,0,1,211.2061,345.1886)">
      <path d="M0,-8.505L28.724,-10.868L38.298,-6.143L47.872,-10.868L76.596,-8.505L83.378,-1.89L38.298,2.363L-6.782,-1.89L0,-8.505Z" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(1,0,0,1,249.5039,354.9548)">
      <path d="M0,-7.403L45.08,-11.656L18.883,4.253L-18.883,4.253L-45.08,-11.656L0,-7.403Z" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(0.892299,0.451444,0.451444,-0.892299,267.442317,275.381727)">
      <path d="M18.024,-14.469L57.121,-14.469L71.774,15.187L52.683,91.3L33.708,77.09" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(0.139249,0.990257,0.990257,-0.139249,340.048584,376.182074)">
      <path d="M-65.42,-19.248L-33.448,-19.248L24.748,-56.742L-10.297,-75.196L-26.979,-69.962" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(0.923087,-0.384592,-0.384592,-0.923087,319.364354,350.249456)">
      <path d="M-1.066,5.329L26.647,5.329" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(0.731891,0.681421,0.681421,-0.731891,342.464606,292.259933)">
      <path d="M-1.673,-4.253L10.809,-4.253" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(-0.448478,0.893794,0.893794,0.448478,278.645771,262.284469)">
      <path d="M-16.037,-9.896L6.106,-9.896" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(-0.350414,-0.936595,-0.936595,0.350414,304.646051,303.442689)">
      <path d="M-33.799,23.442L16.258,23.442" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(1,-0.000224,-0.000224,-1,215.989703,200.3752)">
      <path d="M-0,0.007L66.979,0.007" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(0.985156,-0.171663,-0.171663,-0.985156,188.474967,92.071457)">
      <path d="M-0.47,5.435L62.846,5.434" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(0,-1,-1,0,256.5436,68.8412)">
      <path d="M-7.088,7.088L7.088,7.088" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(0.985218,0.171308,0.171308,-0.985218,250.84667,70.662649)">
      <path d="M-0.468,-5.427L62.891,-5.427" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(0.97374,0.227662,0.227662,-0.97374,162.704862,122.088855)">
      <path d="M-0.709,-6.143L53.262,-6.143" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(0.999915,-0.013017,-0.013017,-0.999915,213.174018,140.43276)">
      <path d="M-0.002,0.236L36.336,0.237" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(-0.085615,0.996328,0.996328,0.085615,240.156312,175.197942)">
      <path d="M-32.563,-29.885L27.427,-29.885" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(-0.973741,0.227658,0.227658,0.973741,289.139125,146.017557)">
      <path d="M-53.263,-6.143L0.709,-6.143" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(-0.999921,-0.012597,-0.012597,0.999921,249.508269,139.486838)">
      <path d="M-37.548,0.237L0.001,0.237" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(0.085632,0.996327,0.996327,-0.085632,319.174084,164.962669)">
      <path d="M-27.426,-29.885L32.563,-29.885" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(0.190213,-0.981743,-0.981743,-0.190213,247.310928,121.618671)">
      <path d="M-24.733,29.985L36.352,29.985" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      <g transform="matrix(-0.141591,-0.989925,-0.989925,0.141591,311.367692,102.449579)">
      <path d="M-33.923,29.416L25.508,29.416" fill="none" fillRule="nonzero" stroke="var(--color-fg)" strokeWidth={0.63}/>
      </g>
      </g>
    </svg>
  );
}
