/* IA GENERATED PAGE */

type Row = {
  value: number | number[];
  l1: string;
  l2: string;
  l3: string;
};

type TreeNode = {
  name: string;
  value?: number | number[];
  children?: TreeNode[];
};

function addValues(a: number[], b: number[]): number[] {
  return a.map((v, i) => v + (b[i] ?? 0));
}

function toArray(v: number | number[]): number[] {
  return Array.isArray(v) ? v : [v];
}

export function toForest(rows: Row[]): TreeNode[] {
  const map: Record<string, Record<string, Record<string, number[]>>> = {};

  for (const { value, l1, l2, l3 } of rows) {
    const val = toArray(value);
    const k1 = l1;
    const k2 = l2 ?? l1;
    const k3 = l3 ?? l2 ?? l1;

    map[k1] ??= {};
    map[k1][k2] ??= {};
    map[k1][k2][k3] = map[k1][k2][k3]
      ? addValues(map[k1][k2][k3], val)
      : [...val];
  }

  return Object.entries(map).map(([l1, sub1]) => {
    const l1Children = Object.entries(sub1).map(([l2, sub2]) => {
      const l2Children = Object.entries(sub2).map(([l3, val]) => ({
        name: l3,
        value: val.length === 1 ? val[0] : val,
      }));

      if (l2Children.length === 1 && l2Children[0].name === l2) {
        return { name: l2, value: l2Children[0].value };
      }

      const l2Value = l2Children.reduce(
        (sum, c) => addValues(sum, toArray(c.value)),
        new Array(toArray(l2Children[0].value).length).fill(0)
      );

      return {
        name: l2,
        value: l2Value.length === 1 ? l2Value[0] : l2Value,
        children: l2Children,
      };
    });

    if (l1Children.length === 1 && l1Children[0].name === l1) {
      return { name: l1, value: l1Children[0].value };
    }

    const l1Value = l1Children.reduce(
      (sum, c) => addValues(sum, toArray(c.value)),
      new Array(toArray(l1Children[0].value).length).fill(0)
    );

    return {
      name: l1,
      value: l1Value.length === 1 ? l1Value[0] : l1Value,
      children: l1Children,
    };
  });
}