/**
 * The pending signal shared by the hairline and anything that waits on the
 * network outside a navigation (decision 063, item 6: the contact form and the
 * CV request). `NavProgress` registers itself as the one listener; a form calls
 * `beginTask()` and the function it returns when the request settles.
 *
 * Module state, not React context: the form and the hairline sit in different
 * trees, and the signal must not re-render either of them.
 */

type Listener = (delta: 1 | -1) => void;

let listener: Listener | null = null;

export function registerPendingListener(fn: Listener): () => void {
  listener = fn;
  return () => {
    if (listener === fn) listener = null;
  };
}

/** Starts the hairline for a non-navigation wait. Call the result once. */
export function beginTask(): () => void {
  listener?.(1);
  let done = false;
  return () => {
    if (done) return;
    done = true;
    listener?.(-1);
  };
}
