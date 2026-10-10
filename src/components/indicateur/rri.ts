/** Utilitaires pour le standard Référentiel Régional d'intéropérabilité */

import { SimpleRecord } from "@geo2france/api-dashboard";
import { from, op } from "arquero";


type ColumnCategory = "group" | "value";


interface Columns {
  groupCols: string[];
  valueCols: string[];

  /** Axe d'analyse, plusieurs valeurs différentes par territoire */
  dimensionCols: string[]; 

  /** Attribut territorial, une seule valeur par territorie */
  attributeCols: string[]; 

  /** Axe (toutes les colonnes sauf les groupCols et ValueCols = dimensionCols + attributeCols */
  axisCols: string[]
}


const reserved_cols: Record<ColumnCategory, RegExp[]> = {
  group: [
    /^date_mesure$/,
    /^annee$/,
    /^libelle_.+$/,
    /^geocode_.+$/,
  ],

  value: [
    /^valeur$/,
    /^numerateur$/,
    /^denominateur$/,
  ],
};


const matchColumnCategory = (column: string): ColumnCategory | undefined => {
  for (const [category, patterns] of Object.entries(reserved_cols)) {
    if (patterns.some(pattern => pattern.test(column))) {
      return category as ColumnCategory;
    }
  }

  return undefined;
};



// Dev note : prévoir une méthode plus efficace pour avoir la catégorie d'une seule colonne ?
export const rri_get_cols = (data: SimpleRecord[]):Columns => {
  const columns = Object.keys(data[0])

  const groupCols = columns.filter(column => matchColumnCategory(column) === "group")
  const valueCols = columns.filter(column => matchColumnCategory(column) === "value")
  const axisCols = columns.filter(column => matchColumnCategory(column) === undefined)

  // Calcule le nombre max de valeur distinct par colonne (valeur distinct pour 1 territoire 1 année donnée)
  const distinctValuesByCols = from(data).groupby(...groupCols).rollup(
      Object.fromEntries(
        axisCols.map(col => [
          col,
          op.distinct(col)
        ])
      )
    )
    .rollup(
        Object.fromEntries(
        axisCols.map(col => [
          col,
          op.max(col)
        ])
      )
    )
    .object()

    const dimensionCols = Object.entries(distinctValuesByCols)
      .filter(([_, count]) => count > 1)
      .map(([col]) => col);

  const attributeCols = axisCols.filter(
    col => !dimensionCols.includes(col)
  );


  return ({
    groupCols: groupCols,
    valueCols: valueCols,
    axisCols: axisCols,
    dimensionCols:dimensionCols,
    attributeCols:attributeCols
  });
};


interface RriAggProps {
  data: SimpleRecord[];

  /** Liste d'axe pour aggrégation */
  axis?: string[];
}

/** 
 * Cette fonction permet d'agréger un jeu de données au format "rri"
 * Si aucun axe n'est indiqué, alors le jdd est agréger par territoire et par année (les différents axes pour une meme territoire sont sommés)
*/
export const rri_agg = ({ data, axis }: RriAggProps) => {

    if (data == undefined) {
        return undefined
    }


    const { groupCols } = rri_get_cols( data ) 
    // TODO vérifier la présence des axes dans axisCols ?

    const out = from(data)
                .groupby(...groupCols, ...(axis ? axis : []) ) // Group by groupCols AND axis (id definied)
                .rollup({valeur: op.sum('valeur')})

    return out.objects() as SimpleRecord[]  // TODO typer la sortie
}
