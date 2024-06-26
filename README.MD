# Odema-dashboard

![](screenshot1.png)

## Mise en route

```bash
git clone git@github.com:geo2france/odema-dashboard.git
git submodule init
git submodule update
npm install
npm run dev
```

Compilation et génération de la doc : 
```bash
npm run build
npm run generate-docs
```


Le contenu généré dans le dossier `dist` peut être coller sur un serveur http sans configuration particulière.


## Sources de données

- **Ademe** : depuis le [portail opendata](https://data.ademe.fr/) de l'Ademe via l'API Datafair.
- **Odema** : depuis le [datahub](https://www.geo2france.fr/datahub/search?q=odema) de Géo2France par flux WFS.

Les connecteurs [Datafair Data Provider](https://github.com/geo2france/refine-datafair) et [WFS Data Provider](https://github.com/geo2france/refine-wfs) ont été développés pour cet usage et sont utilisables par d'autres applications [Refine](https://github.com/refinedev/refine).



## A propos

Les composants et _hooks_ génériques développés pour ce projet sont disponibles ici : [g2f-dashboard](https://github.com/geo2france/g2f-dashboard). Ils peuvent être utilisés pour créer d'autres tableaux de bord.

Connecteurs :
- **Datafair Data Provider** [Docs](https://github.com/geo2france/refine-datafair)
- **WFS Data Provider** [Docs](https://github.com/geo2france/refine-wfs)


## License

MIT
