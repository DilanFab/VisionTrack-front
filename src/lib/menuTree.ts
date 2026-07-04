import type { Menu } from "../types/rolesPermisos/Menu";

export interface MenuNode extends Menu {
  hijos: MenuNode[];
}

export const buildMenuTree = (items: Menu[]): MenuNode[] => {
  const nodes = new Map<number, MenuNode>();
  items.forEach((menu) => nodes.set(menu.menu_id, { ...menu, hijos: [] }));

  const roots: MenuNode[] = [];
  nodes.forEach((node) => {
    const padre = node.menu_padre ? nodes.get(node.menu_padre) : null;
    if (padre) {
      padre.hijos.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
};

export const collectIds = (node: MenuNode): number[] => [
  node.menu_id,
  ...node.hijos.flatMap(collectIds),
];

// Ids de todos los ancestros (padre, abuelo, ...) de un menú.
export const getAncestorIds = (menuId: number, menusById: Map<number, Menu>): number[] => {
  const ids: number[] = [];
  let actual = menusById.get(menuId);
  while (actual?.menu_padre) {
    ids.push(actual.menu_padre);
    actual = menusById.get(actual.menu_padre);
  }
  return ids;
};
