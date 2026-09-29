/**
 * Performs `update` within a view transition with the given `types`, so CSS
 * can target this particular transition with `:active-view-transition-type()`.
 *
 * The update is performed without a transition if view transition types are
 * unsupported, or the user prefers reduced motion.
 */
export async function viewTransitionWithTypes(
  types: string[],
  update: () => void
): Promise<void> {
  if (
    typeof ViewTransition === 'undefined' ||
    !('types' in ViewTransition.prototype) ||
    matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    update();
    return;
  }

  const transition = document.startViewTransition({
    types,
    async update() {
      update();
      // Wait for Preact to render.
      await new Promise((resolve) => setTimeout(resolve));
    },
  });

  await transition.finished;
}
