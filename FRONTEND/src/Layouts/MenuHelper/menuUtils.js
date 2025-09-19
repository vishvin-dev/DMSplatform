// utils/menuUtils.js
export function findLabelByLink(menuItems, currentLink) {
  for (const item of menuItems) {
    if (item.link === currentLink) {
      return item.label;
    }
    if (item.childItems && item.childItems.length) {
      const found = findLabelByLink(item.childItems, currentLink);
      if (found) return found;
    }
    if (item.subItems && item.subItems.length) {
      const found = findLabelByLink(item.subItems, currentLink);
      if (found) return found;
    }
  }
  return null;
}
