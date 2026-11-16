import { describe, expect, it } from 'vitest';
import { experiences } from './experiences';
import { gallerySlides } from './gallery';
import { menuNav, primaryNav } from './navigation';
import { rooms } from './rooms';
import { pageHref, pages, type PageName } from './routes';
import { scenes } from './scenes';
import { shots } from './shots';
import { themes } from './themes';

const sceneAnchors = scenes.map((scene) => `#${scene.id}`);

describe('scenes', () => {
  it('have unique ids and known themes', () => {
    const ids = scenes.map((scene) => scene.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const scene of scenes) expect(themes).toHaveProperty(scene.theme);
  });
});

describe('navigation', () => {
  it('only links to sections that exist', () => {
    for (const link of [...primaryNav, ...menuNav]) expect(sceneAnchors).toContain(link.href);
  });
});

describe('routes', () => {
  it('send links for unbuilt pages to a homepage section', () => {
    for (const name of Object.keys(pages) as PageName[]) {
      const href = pageHref(name);
      if (pages[name].built) expect(href).toBe(pages[name].path);
      else expect(sceneAnchors).toContain(href);
    }
  });
});

describe('pictures', () => {
  it('are all listed in the shot manifest', () => {
    const used = [
      ...rooms.map((room) => room.shot),
      ...experiences.map((experience) => experience.shot),
      ...gallerySlides.map((slide) => slide.shot),
    ];
    for (const id of used) expect(shots).toHaveProperty(id);
  });

  it('all have a description for screen readers', () => {
    for (const shot of Object.values(shots)) expect(shot.alt.length).toBeGreaterThan(20);
  });
});
