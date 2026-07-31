# aeropulse-live
Plataforma de monitoreo aéreo en tiempo real desarrollada con Angular y Tailwind CSS.

## Desarrollo local

```bash
npm install
npm start
```

Abre `http://localhost:4200/radar`. El servidor de Angular utiliza `proxy.conf.json` para reenviar `/adsb-api` a la API oficial de ADSB.lol, cuyo servidor no publica encabezados CORS para consumo directo desde un navegador.

## Verificación

```bash
npm run lint
npm test -- --watch=false
npm run build
```

Para alternar entre ADSB.lol y el simulador, usa el selector **Fuente** del panel de consulta. La configuración inicial también está centralizada en `src/environments/environment.ts`.
