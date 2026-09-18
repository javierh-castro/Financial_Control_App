# Gastos — app móvil de control de gastos

App en Expo + React Native + TypeScript. **Etapa 1**: solo el Home, con la
navegación inferior completa y datos de ejemplo.

## Correr la app

```bash
npm install
npm run ios     # simulador de iPhone (requiere Xcode instalado)
npm start       # QR para abrir con Expo Go en un iPhone real
npm run web     # en el navegador
```

## Estructura

```
src/
  app/                    rutas (expo-router): index = Inicio, y las otras tres pestañas
  components/home/        componentes del Home (saludo, saldo, accesos, movimientos)
  components/navigation/  barra inferior flotante y su configuración
  components/ui/          piezas compartidas (Screen, SectionHeader, IconCircle…)
  constants/theme.ts      colores, espaciados, radios y tipografías
  data/sample-data.ts     datos de ejemplo de esta etapa
  types/finance.ts        modelos de dominio (Transaction, MonthlySummary)
  utils/format.ts         formato de montos y fechas en español
```

Los componentes reciben todo por props: cuando se reemplacen los datos de
ejemplo por almacenamiento real, solo cambia `src/data`.

## Pendiente (próximas etapas)

- Pantallas de Movimientos, Análisis y Ajustes (hoy son placeholders).
- Alta y edición de movimientos desde los accesos rápidos.
- Persistencia local y, más adelante, servidor y sincronización.
