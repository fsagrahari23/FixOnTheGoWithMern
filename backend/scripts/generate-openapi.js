const fs = require('fs');
const path = require('path');

const backendDir = path.join(__dirname, '..');
const routesDir = path.join(backendDir, 'routes');
const appFile = path.join(backendDir, 'app.js');
const openapiFile = path.join(backendDir, 'openapi.json');

// read route prefixes from app.js
const appText = fs.readFileSync(appFile, 'utf8');
const prefixRegex = /app\.use\(\s*['\"]([^'\"]+)['\"]\s*,\s*(.*?)\)/g;
const prefixMap = {}; // routerFile -> prefix
let match;
while ((match = prefixRegex.exec(appText)) !== null) {
  let prefix = match[1];
  let routeVar = match[2].trim();
  const mapping = /(?:const\s+)?(\w+)\s*=\s*require\((.*?)\)?/.exec(appText);
  // easier: use known variable names
  const known = {
    authRoutes: '/auth',
    userRoutes: '/user',
    emergencyRoutes: '/user',
    mechanicRoutes: '/mechanic',
    adminRoutes: '/admin',
    chatRoutes: '/chat',
    paymentRoutes: '/payment',
    bookingRoutes: '/user',
    notificationRoutes: '/api/notifications',
  };
  if (known[routeVar]) prefixMap[routeVar] = known[routeVar];
}

// fallback mapping manual
const routeFilePrefixes = {
  auth: '/auth',
  user: '/user',
  emergency: '/user',
  mechanic: '/mechanic',
  admin: '/admin',
  chat: '/chat',
  payment: '/payment',
  booking: '/user',
  notification: '/api/notifications',
};

const getPrefixForFile = (fileName) => {
  const name = path.basename(fileName, '.js');
  if (routeFilePrefixes[name]) return routeFilePrefixes[name];
  return '/';
};

const paths = {};

const expressToOpenApiPath = (expressPath) => {
  return expressPath.replace(/:([A-Za-z0-9_]+)/g, '{$1}');
};

const isAuthPath = (basePath) => basePath.startsWith('/auth') || basePath.startsWith('/auth/forgot-password');

fs.readdirSync(routesDir).filter((f) => f.endsWith('.js')).forEach((routeFile) => {
  const filePath = path.join(routesDir, routeFile);
  const content = fs.readFileSync(filePath, 'utf8');
  const prefix = getPrefixForFile(routeFile);

  const routeRegex = /router\.(get|post|put|delete|patch)\s*\(\s*["'`]([^"'`]+)["'`]/g;
  let m;
  while ((m = routeRegex.exec(content)) !== null) {
    const method = m[1].toLowerCase();
    let expressPath = m[2];
    if (!expressPath.startsWith('/')) expressPath = '/' + expressPath;

    const fullPath = path.posix.join(prefix, expressPath).replace(/\\/g, '/');
    const openapiPath = expressToOpenApiPath(fullPath.replace(/\\/g, '/'));

    if (!paths[openapiPath]) {
      paths[openapiPath] = {};
    }

    const operation = {
      summary: `${method.toUpperCase()} ${openapiPath}`,
      tags: [routeFile.replace('.js','')],
      responses: {
        '200': {
          description: 'Successful response',
          content: {
            'application/json': {
              schema: { type: 'object' }
            }
          }
        }
      }
    };

    const parameters = [];
    const paramMatches = [...openapiPath.matchAll(/\{([^}]+)\}/g)];
    if (paramMatches.length) {
      paramMatches.forEach((p) => {
        parameters.push({
          name: p[1],
          in: 'path',
          required: true,
          schema: { type: 'string' }
        });
      });
    }

    if (parameters.length) operation.parameters = parameters;

    if (method === 'post' || method === 'put' || method === 'patch') {
      operation.requestBody = {
        required: false,
        content: {
          'application/json': {
            schema: { type: 'object' }
          }
        }
      };
    }

    if (!isAuthPath(fullPath)) {
      operation.security = [{ bearerAuth: [] }];
    } else {
      operation.security = [];
    }

    paths[openapiPath][method] = operation;
  }
});

const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'Fix on the Go API',
    version: '1.0.0',
    description: 'Auto-generated OpenAPI spec from Express routes',
  },
  servers: [{ url: 'http://localhost:3005' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths,
};

fs.writeFileSync(openapiFile, JSON.stringify(openapi, null, 2));
console.log(`Generated OpenAPI spec at ${openapiFile} with ${Object.keys(paths).length} paths.`);
