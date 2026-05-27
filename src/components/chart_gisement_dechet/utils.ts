type Row = {
  value: number;
  l1: string;
  l2: string;
  l3: string;
};

type TreeNode = {
  name: string;
  value?: number;
  children?: TreeNode[];
};

/** IA GENERATED
 * Formatage des données pour le composant TreeMap
 */
export function toForest(rows: Row[]): TreeNode[] {
  const map: Record<string, Record<string, Record<string, number>>> = {};

  for (const { value, l1, l2, l3 } of rows) {
    map[l1] ??= {};
    map[l1][l2 ?? l1] ??= {};                    // ← fallback sur l1 si l2 absent
    map[l1][l2 ?? l1][l3 ?? l2 ?? l1] =
      (map[l1][l2 ?? l1][l3 ?? l2 ?? l1] ?? 0) + value;
  }

  return Object.entries(map).map(([l1, sub1]) => {
  const l1Children = Object.entries(sub1).map(([l2, sub2]) => {
    const l2Children = Object.entries(sub2).map(([l3, val]) => ({
      name: l3,
      value: val,
    }));

    // ✅ Si un seul enfant L3 avec le même nom que L2 → c'est une feuille
    if (l2Children.length === 1 && l2Children[0].name === l2) {
      return { name: l2, value: l2Children[0].value };
    }

    const l2Value = l2Children.reduce((sum, c) => sum + c.value, 0);
    return { name: l2, value: l2Value, children: l2Children };
  });

  // ✅ Même logique pour L1
  if (l1Children.length === 1 && l1Children[0].name === l1) {
    return { name: l1, value: l1Children[0].value };
  }

  const l1Value = l1Children.reduce((sum, c) => sum + c.value, 0);
  return { name: l1, value: l1Value, children: l1Children };
});
}
