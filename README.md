# aeropulse-live
Plataforma de monitoreo aéreo en tiempo real desarrollada con Angular y Tailwind CSS.

## Desarrollo local

```bash
npm install
npm start
```

Abre `http://localhost:4200/radar`. El servidor de Angular utiliza `proxy.conf.json` para reenviar `/opensky-api` a la API oficial de OpenSky Network. La pantalla inicia con cobertura mundial real y permite cambiar a continentes, regiones o países —incluyendo toda Centroamérica— sin introducir coordenadas.

En producción debe conservarse el mismo proxy inverso para `/opensky-api`; la API pública de OpenSky no habilita CORS para navegadores. La documentación del endpoint real está en [OpenSky REST API](https://openskynetwork.github.io/opensky-api/rest.html).

## Verificación

```bash
npm run lint
npm test -- --watch=false
npm run build
```

No existe un proveedor alternativo de datos inventados: los estados de carga, vacío y error nunca fabrican aeronaves. La cobertura inicial y el intervalo de actualización están centralizados en `src/environments/environment.ts`.
