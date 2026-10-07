export type GalleryMediaItem =
  | { type: 'image'; src: string }
  | { type: 'video'; src: string; embedSrc: string };

export type DesktopGalleryLayout = {
  rootClassName: string;
  secondaryClassName: string;
  secondaryItems: GalleryMediaItem[];
};

export function getDesktopGalleryLayout(mediaItems: GalleryMediaItem[]): DesktopGalleryLayout {
  const secondaryItems = mediaItems.slice(1, 5);

  if (mediaItems.length <= 1) {
    return {
      rootClassName: 'lg:grid-cols-1',
      secondaryClassName: '',
      secondaryItems: [],
    };
  }

  if (secondaryItems.length === 1) {
    return {
      rootClassName: 'lg:grid-cols-[1.55fr_1fr]',
      secondaryClassName: 'grid-cols-1 grid-rows-1',
      secondaryItems,
    };
  }

  if (secondaryItems.length === 2) {
    return {
      rootClassName: 'lg:grid-cols-[1.55fr_1fr]',
      secondaryClassName: 'grid-cols-2 grid-rows-1',
      secondaryItems,
    };
  }

  return {
    rootClassName: 'lg:grid-cols-[1.55fr_1fr]',
    secondaryClassName: 'grid-cols-2 grid-rows-2',
    secondaryItems,
  };
}
