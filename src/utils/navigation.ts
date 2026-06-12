import { navigation, type NavItem } from '../config/navigation';

export interface FlatNavItem {
  title: string;
  slug: string;
}

export function getFlatNavigation(): FlatNavItem[] {
  const flat: FlatNavItem[] = [];

  function recurse(item: NavItem) {
    // Top-level or leaf items with a slug are added to the sequential sequence
    if (item.slug !== undefined) {
      flat.push({ title: item.title, slug: item.slug });
    }
    if (item.items) {
      item.items.forEach(recurse);
    }
  }

  navigation.forEach(recurse);
  return flat;
}

export interface PrevNextResult {
  prev: FlatNavItem | null;
  next: FlatNavItem | null;
}

export function getPrevNext(currentSlug: string): PrevNextResult {
  const flat = getFlatNavigation();
  
  // Normalize slugs for comparison (strip leading/trailing slashes)
  const normCurrent = currentSlug.replace(/^\/|\/$/g, '');
  
  const currentIndex = flat.findIndex(
    (item) => item.slug.replace(/^\/|\/$/g, '') === normCurrent
  );

  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  const prev = currentIndex > 0 ? flat[currentIndex - 1] : null;
  const next = currentIndex < flat.length - 1 ? flat[currentIndex + 1] : null;

  return { prev, next };
}
