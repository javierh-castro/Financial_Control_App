// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// expo-sqlite en web corre sobre wasm (wa-sqlite); sin esto Metro no
// resuelve el import de wa-sqlite.wasm. Ver:
// https://docs.expo.dev/versions/v57.0.0/sdk/sqlite/#web-setup
config.resolver.assetExts.push('wasm');

// SharedArrayBuffer (que usa wa-sqlite) requiere estas cabeceras en el
// servidor. Esto solo cubre el servidor de desarrollo de Metro; para
// producción en web hay que agregarlas en el hosting.
config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    middleware(req, res, next);
  };
};

module.exports = config;
