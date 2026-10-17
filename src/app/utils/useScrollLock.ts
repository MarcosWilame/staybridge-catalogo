import { useEffect } from 'react';

type ScrollLockState = {
  count: number;
  htmlOverflow: string;
  htmlOverscrollBehavior: string;
  bodyOverflow: string;
  bodyOverscrollBehavior: string;
};

const activeLocks = new WeakMap<Document, ScrollLockState>();

export function lockDocumentScroll(targetDocument: Document) {
  const existingState = activeLocks.get(targetDocument);

  if (existingState) {
    existingState.count += 1;
  } else {
    const html = targetDocument.documentElement;
    const body = targetDocument.body;

    activeLocks.set(targetDocument, {
      count: 1,
      htmlOverflow: html.style.overflow,
      htmlOverscrollBehavior: html.style.overscrollBehavior,
      bodyOverflow: body.style.overflow,
      bodyOverscrollBehavior: body.style.overscrollBehavior,
    });

    html.style.overflow = 'hidden';
    html.style.overscrollBehavior = 'none';
    body.style.overflow = 'hidden';
    body.style.overscrollBehavior = 'none';
  }

  let released = false;

  return () => {
    if (released) return;
    released = true;

    const state = activeLocks.get(targetDocument);
    if (!state) return;

    state.count -= 1;
    if (state.count > 0) return;

    const html = targetDocument.documentElement;
    const body = targetDocument.body;
    html.style.overflow = state.htmlOverflow;
    html.style.overscrollBehavior = state.htmlOverscrollBehavior;
    body.style.overflow = state.bodyOverflow;
    body.style.overscrollBehavior = state.bodyOverscrollBehavior;
    activeLocks.delete(targetDocument);
  };
}

export function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked || typeof document === 'undefined') return;
    return lockDocumentScroll(document);
  }, [isLocked]);
}
