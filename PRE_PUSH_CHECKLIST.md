# Checklist antes de hacer push

Antes de correr `git push` en este proyecto, repasa esta lista. Sirve para
no subir secretos ni dejar huecos de seguridad, incluso en una app que hoy
solo guarda datos en el teléfono (SQLite local) y más adelante va a sumar
backups exportables y, después, un backend con sincronización.

Cada punto indica si aplica **ahora** (Etapa 1, sin backend) o si es para
**cuando** se agregue backend/sync/API. No lo canjees por completo hasta
esa etapa, pero no lo ignores: revisa qué corresponde en cada push.

## 1. Oculta las claves API
**Ahora.** Si se agrega alguna clave (analytics, crash reporting, etc.),
va en variables de entorno (`.env`, fuera de git), nunca hardcodeada en el
código o en `app.json`.

## 2. Elimina secretos de git
**Ahora, siempre.** Antes de cada push: `git status` y revisa el diff de
todo archivo que no reconozcas. Si un secreto ya se commiteó, no alcanza
con borrarlo en el siguiente commit — hay que reescribir el historial
(`git filter-repo` o similar) y rotar la clave.

## 3. Usa una clave pública de DB
**Cuando** haya backend. No aplica a SQLite local (no hay claves de
conexión).

## 4. Activa RLS (Row Level Security)
**Cuando** haya backend con base de datos compartida (Postgres/Supabase,
etc.). No aplica a SQLite local de un solo usuario.

## 5. Cifra datos sensibles
**Ahora, parcial.** Los montos y categorías no son datos críticos, pero si
en el futuro se guardan credenciales o tokens de sincronización, usar
`expo-secure-store` (Keychain/Keystore), no `AsyncStorage` ni SQLite en
texto plano.

## 6. Fuerza autenticación del servidor
**Cuando** haya backend. No aplica todavía (no hay servidor).

## 7. Restringe acceso a registros (logs)
**Ahora.** No loguear montos, categorías ni nada del usuario en consola en
builds de producción. Revisar `console.log` antes de cada push.

## 8. Bloquea manipulación de campos
**Cuando** haya API. Mientras tanto, valida en el cliente que `amount` sea
positivo y `kind` sea `'income' | 'expense'` antes de guardar en SQLite.

## 9. Protege cookies de sesión
**Cuando** haya backend con sesiones. No aplica hoy.

## 10. Hashea contraseñas
**Cuando** haya login. No aplica hoy (no hay contraseñas).

## 11. Limita intentos de inicio de sesión
**Cuando** haya login/backend.

## 12. Añade protección contra bots
**Cuando** haya un endpoint público (API, formulario web, etc.).

## 13. Monitoriza consultas de BD
**Cuando** haya backend compartido. Localmente, cuidar sí no meter SQL
armado por concatenación de strings — usar siempre parámetros
(`runAsync(sql, params)` de `expo-sqlite`), nunca interpolar valores del
usuario directo en el SQL.

## 14. Valida todas las entradas
**Ahora.** Todo lo que el usuario tipea (monto, título, categoría, fecha)
se valida antes de guardarlo: tipos correctos, rangos razonables, strings
sin overflow de longitud.

## 15. Escapa contenido del usuario
**Ahora.** React Native escapa texto por defecto al renderizar, pero si en
algún momento se genera HTML (exportes, reportes web), escapar ahí.

## 16. Restringe subida de archivos
**Ahora, aplica a los backups.** El import de un archivo de backup
(`expo-document-picker` + `expo-file-system`) debe validar que sea el
formato esperado (JSON con el esquema propio) antes de parsearlo, y
limitar su tamaño. No confiar en la extensión del archivo.

## 17. Limita respuesta de API
**Cuando** haya backend/API propia o de terceros.

## 18. Añade cabeceras de seguridad
**Cuando** haya un servidor propio o la versión web se sirva desde un
dominio propio.

## 19. Fuerza HTTPS
**Cuando** haya cualquier llamada de red (sync, analytics, API). Ninguna
URL `http://` en el código.

## 20. Escanea dependencias
**Ahora.** Antes de cada push con cambios en `package.json`:
```bash
npm audit
```
Revisar vulnerabilidades altas/críticas antes de subir.

---

### Antes de cada push, como mínimo (aplica siempre en esta etapa):
- [ ] `git status` — nada raro, ningún archivo con secretos
- [ ] Sin `console.log` con datos del usuario
- [ ] Inputs validados (monto, fecha, categoría) antes de tocar SQLite
- [ ] SQL siempre parametrizado, nunca concatenado
- [ ] `npm audit` limpio (o vulnerabilidades conocidas y aceptadas)
- [ ] `.env` y cualquier credencial siguen fuera de git (`.gitignore`)
