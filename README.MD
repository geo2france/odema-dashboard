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

Compilation : 
```bash
npm run build
```

Le contenu généré dans le dossier `dist` peut être coller sur un serveur http sans configuration particulière.

## Sources de données

- **Ademe** : les données sont récupérés sur le [portail opendata](https://data.ademe.fr/) via l'API Datafair. Un [connecteur](https://github.com/geo2france/refine-datafair) a été développé pour cet usage.

## Learn More

To learn more about **Refine**, please check out the [Documentation](https://refine.dev/docs)

- **Ant Design** [Docs](https://refine.dev/docs/ui-frameworks/antd/tutorial/)
- **React Router** [Docs](https://refine.dev/docs/core/providers/router-provider/)
- **REST Data Provider** [Docs](https://refine.dev/docs/core/providers/data-provider/#overview)
- **Datafair Data Provier** [Docs](https://github.com/geo2france/refine-datafair)

This [Refine](https://github.com/refinedev/refine) project was generated with [create refine-app](https://github.com/refinedev/refine/tree/master/packages/create-refine-app).


## License

MIT
