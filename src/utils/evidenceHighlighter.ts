/**
 * Utility for smooth scrolling to clinical evidence elements and applying
 * a distinct pulsating glow highlight (amber-teal ring) to assist clinicians in
 * tracing AI summaries to the exact supporting patient records.
 */

export function scrollToAndHighlight(
  elementId: string,
  options?: {
    customPulseClass?: string;
    durationMs?: number;
    block?: ScrollLogicalPosition;
  }
): boolean {
  if (!elementId) return false;

  const duration = options?.durationMs ?? 3500;
  const block = options?.block ?? 'center';

  const findAndApply = (retryCount = 0) => {
    const el = document.getElementById(elementId);

    if (!el) {
      // Element might be in a tab that is rendering; retry up to 3 times
      if (retryCount < 5) {
        setTimeout(() => findAndApply(retryCount + 1), 80);
      }
      return false;
    }

    // Smooth scroll into view
    try {
      el.scrollIntoView({ behavior: 'smooth', block });
    } catch {
      el.scrollIntoView();
    }

    // Clinical pulsating glow classes
    const highlightClasses = [
      'ring-4',
      'ring-amber-400',
      'ring-offset-2',
      'ring-offset-white',
      'bg-amber-50/80',
      'shadow-lg',
      'animate-pulse',
      'transition-all',
      'duration-300',
      'evidence-highlight-active',
    ];

    // Apply classes
    el.classList.add(...highlightClasses);

    // Subtle scale feedback
    el.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
    el.style.transform = 'scale(1.015)';

    // Remove classes after duration
    setTimeout(() => {
      el.classList.remove(...highlightClasses);
      el.style.transform = '';
    }, duration);

    return true;
  };

  return findAndApply();
}
