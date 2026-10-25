/**
 * THE Motion Layer flag (decision 047): one switch for the whole layer.
 * Setting it to `false` restores MVP-1 behaviour exactly — every motion
 * component must read this constant and render its static form when off.
 * A code constant rather than an env var so reverting is one commit (062).
 */
export const MOTION_LAYER = true;
