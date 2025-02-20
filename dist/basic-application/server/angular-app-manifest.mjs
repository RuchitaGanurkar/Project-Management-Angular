
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 0,
    "preload": [
      "chunk-YH4J5AUA.js",
      "chunk-GZTVTIHO.js"
    ],
    "redirectTo": "/auth/login",
    "route": "/auth"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-YH4J5AUA.js",
      "chunk-GZTVTIHO.js"
    ],
    "route": "/auth/login"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-YH4J5AUA.js",
      "chunk-GZTVTIHO.js"
    ],
    "route": "/auth/signup"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-T6VLDAWN.js",
      "chunk-VBEBLBJG.js"
    ],
    "route": "/dashboard"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-GM75VY2E.js",
      "chunk-GZTVTIHO.js",
      "chunk-VBEBLBJG.js",
      "chunk-FK6H3RFT.js"
    ],
    "route": "/project"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-GM75VY2E.js",
      "chunk-GZTVTIHO.js",
      "chunk-VBEBLBJG.js",
      "chunk-FK6H3RFT.js"
    ],
    "route": "/project/create"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-GM75VY2E.js",
      "chunk-GZTVTIHO.js",
      "chunk-VBEBLBJG.js",
      "chunk-FK6H3RFT.js"
    ],
    "route": "/project/*"
  },
  {
    "renderMode": 0,
    "redirectTo": "/dashboard",
    "route": "/"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 5478, hash: '1b8a98e2d45fb7c1042e15c243fe6e4230a50f8b9448620df7362f17119b749f', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1594, hash: '6fe632f8a1188150f829c1be5292cd6bfc731a2d740a79d9ba4304d46c0ac2f0', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-DZ6UBGXD.css': {size: 231612, hash: 'B2Fy9V+bfZo', text: () => import('./assets-chunks/styles-DZ6UBGXD_css.mjs').then(m => m.default)}
  },
};
