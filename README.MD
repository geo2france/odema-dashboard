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



## Learn More

To learn more about **Refine**, please check out the [Documentation](https://refine.dev/docs)

- **G2F-Dashboards** [Docs](https://github.com/geo2france/g2f-dashboard)
- **Ant Design** [Docs](https://refine.dev/docs/ui-frameworks/antd/tutorial/)
- **React Router** [Docs](https://refine.dev/docs/core/providers/router-provider/)
- **REST Data Provider** [Docs](https://refine.dev/docs/core/providers/data-provider/#overview)
- **Datafair Data Provider** [Docs](https://github.com/geo2france/refine-datafair)
- **WFS Data Provider** [Docs](https://github.com/geo2france/refine-wfs)

This [Refine](https://github.com/refinedev/refine) project was generated with [create refine-app](https://github.com/refinedev/refine/tree/master/packages/create-refine-app).


## License

MIT
