import test from 'node:test';
import assert from 'node:assert/strict';
import { getDesktopGalleryLayout } from '../src/app/utils/propertyGallery.ts';

const image = (src) => ({ type: 'image', src });

test('desktop gallery uses the full panel for a single media item', () => {
  const layout = getDesktopGalleryLayout([image('one.jpg')]);

  assert.equal(layout.rootClassName, 'lg:grid-cols-1');
  assert.equal(layout.secondaryItems.length, 0);
});

test('desktop gallery creates a full-height secondary panel for two media items', () => {
  const layout = getDesktopGalleryLayout([image('one.jpg'), image('two.jpg')]);

  assert.equal(layout.rootClassName, 'lg:grid-cols-[1.55fr_1fr]');
  assert.equal(layout.secondaryClassName, 'grid-cols-1 grid-rows-1');
  assert.equal(layout.secondaryItems.length, 1);
});

test('desktop gallery uses two secondary columns for three media items', () => {
  const layout = getDesktopGalleryLayout([
    image('one.jpg'),
    image('two.jpg'),
    image('three.jpg'),
  ]);

  assert.equal(layout.secondaryClassName, 'grid-cols-2 grid-rows-1');
  assert.equal(layout.secondaryItems.length, 2);
});

test('desktop gallery caps secondary previews at four items', () => {
  const layout = getDesktopGalleryLayout(
    Array.from({ length: 8 }, (_, index) => image(`${index + 1}.jpg`))
  );

  assert.equal(layout.secondaryClassName, 'grid-cols-2 grid-rows-2');
  assert.equal(layout.secondaryItems.length, 4);
  assert.equal(layout.secondaryItems[3].src, '5.jpg');
});
