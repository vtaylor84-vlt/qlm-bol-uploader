/**
 * Vite-only middleware: serves Netlify login functions during `npm run dev`.
 * Never applied to production builds or Netlify deploy.
 *
 * Without local secrets (UPLOAD_TOKEN), uses fixture auth for Phase 1 UI preview.
 * With UPLOAD_TOKEN + ALLOWED_ORIGINS in `.env.local`, invokes the real handlers.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';
import { loadEnv } from 'vite';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const LOCAL_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'];

const FIXTURE_PROFILES: Record<
  string,
  {
    authRole: 'admin' | 'driver';
    driverId: string;
    driverName: string;
    companyCode: string;
    maskedEmail: string;
    uploaderAllowed: boolean;
    active: boolean;
    canSelectAnyDriver: boolean;
    crossCarrierAuthorized?: boolean;
  }
> = {
  'driver@local.dev': {
    authRole: 'driver',
    driverId: 'LOCAL-GLX-D',
    driverName: 'Local GLX Driver',
    companyCode: 'GLX',
    maskedEmail: 'd***@local.dev',
    uploaderAllowed: true,
    active: true,
    canSelectAnyDriver: false,
  },
  'bst@local.dev': {
    authRole: 'driver',
    driverId: 'LOCAL-BST-D',
    driverName: 'Local BST Driver',
    companyCode: 'BST',
    maskedEmail: 'b***@local.dev',
    uploaderAllowed: true,
    active: true,
    canSelectAnyDriver: false,
  },
  'admin@local.dev': {
    authRole: 'admin',
    driverId: 'LOCAL-ELM-A',
    driverName: 'Local ELM Admin',
    companyCode: 'GLX',
    maskedEmail: 'a***@local.dev',
    uploaderAllowed: true,
    active: true,
    canSelectAnyDriver: true,
    crossCarrierAuthorized: true,
  },
};

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, statusCode: number, payload: unknown) {
  const body = JSON.stringify(payload);
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(body);
}

function mergeLocalOrigins(): void {
  const existing = String(process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const merged = [...new Set([...existing, ...LOCAL_ORIGINS])];
  process.env.ALLOWED_ORIGINS = merged.join(',');
}

function fixtureLogin(email: string) {
  const profile = FIXTURE_PROFILES[email];
  if (!profile) {
    return {
      statusCode: 403,
      payload: {
        success: false,
        error:
          'Local fixture auth only. Use driver@local.dev, bst@local.dev, or admin@local.dev — or set UPLOAD_TOKEN in .env.local for live roster login.',
      },
    };
  }

  const payload: Record<string, unknown> = {
    success: true,
    profile,
    loginDiag: {
      emailNormalized: email,
      tokenPresent: false,
      routeMatched: true,
      isBridgeAdmin: profile.authRole === 'admin',
      driverMatchFound: profile.authRole === 'driver',
      localFixture: true,
    },
  };

  if (profile.authRole === 'admin' && profile.canSelectAnyDriver) {
    payload.showcaseGrant = 'local.dev.showcase.grant';
    payload.showcaseGrantExpiresAt = Date.now() + 8 * 60 * 60 * 1000;
  }

  return { statusCode: 200, payload };
}

async function invokeNetlifyHandler(
  functionName: string,
  event: { httpMethod: string; headers: Record<string, string>; body: string }
) {
  const filePath = path.resolve(process.cwd(), 'netlify', 'functions', `${functionName}.js`);
  const mod = await import(`${pathToFileURL(filePath).href}?t=${Date.now()}`);
  const handler = mod.handler || mod.default;
  if (typeof handler !== 'function') {
    throw new Error(`No handler export in ${functionName}`);
  }
  return handler(event);
}

export default function localNetlifyFunctionsPlugin(): Plugin {
  return {
    name: 'elm-local-netlify-functions',
    apply: 'serve',
    configureServer(server) {
      const env = loadEnv(server.config.mode, server.config.root, '');
      for (const [key, value] of Object.entries(env)) {
        if (process.env[key] === undefined) {
          process.env[key] = value;
        }
      }
      mergeLocalOrigins();

      const useFixture = !process.env.UPLOAD_TOKEN;
      if (useFixture) {
        console.info(
          '[elm-local-auth] UPLOAD_TOKEN unset — local fixture login enabled (driver@local.dev | bst@local.dev | admin@local.dev). Add UPLOAD_TOKEN to .env.local for live roster auth.'
        );
      } else {
        console.info('[elm-local-auth] UPLOAD_TOKEN present — proxying login through local Netlify function handlers.');
      }

      server.middlewares.use(async (req, res, next) => {
        try {
          const urlPath = (req.url || '').split('?')[0];
          const match = urlPath.match(/^\/\.netlify\/functions\/(driver-login|showcase-access)$/);
          if (!match) {
            next();
            return;
          }

          const functionName = match[1];
          const method = (req.method || 'GET').toUpperCase();
          const originHeader =
            (typeof req.headers.origin === 'string' && req.headers.origin) ||
            LOCAL_ORIGINS[0];

          if (method === 'OPTIONS') {
            res.statusCode = 204;
            res.setHeader('Access-Control-Allow-Origin', originHeader);
            res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            res.end();
            return;
          }

          const rawBody = method === 'POST' || method === 'PUT' ? await readBody(req) : '';

          if (useFixture && functionName === 'driver-login') {
            if (method !== 'POST') {
              sendJson(res, 405, { success: false, error: 'Method not allowed' });
              return;
            }
            let email = '';
            try {
              email = String(JSON.parse(rawBody || '{}').email || '')
                .trim()
                .toLowerCase();
            } catch {
              sendJson(res, 400, { success: false, error: 'Invalid JSON body' });
              return;
            }
            const result = fixtureLogin(email);
            sendJson(res, result.statusCode, result.payload);
            return;
          }

          if (useFixture && functionName === 'showcase-access') {
            if (method !== 'POST') {
              sendJson(res, 405, { success: false, error: 'Method not allowed' });
              return;
            }
            let grant = '';
            try {
              grant = String(JSON.parse(rawBody || '{}').showcaseGrant || '');
            } catch {
              sendJson(res, 400, { allowed: false, error: 'Invalid JSON body' });
              return;
            }
            if (grant === 'local.dev.showcase.grant') {
              sendJson(res, 200, {
                allowed: true,
                expiresAt: Date.now() + 8 * 60 * 60 * 1000,
              });
              return;
            }
            sendJson(res, 403, { allowed: false, error: 'Access denied' });
            return;
          }

          const event = {
            httpMethod: method,
            headers: {
              origin: originHeader,
              'content-type': String(req.headers['content-type'] || 'application/json'),
            },
            body: rawBody,
          };

          const result = await invokeNetlifyHandler(functionName, event);
          res.statusCode = result.statusCode || 500;
          const headers = result.headers || {};
          for (const [key, value] of Object.entries(headers)) {
            if (value != null) res.setHeader(key, String(value));
          }
          if (!res.getHeader('Content-Type') && typeof result.body === 'string') {
            res.setHeader('Content-Type', 'application/json');
          }
          res.end(result.body ?? '');
        } catch (err) {
          console.error('[elm-local-auth] middleware error', err);
          sendJson(res, 500, {
            success: false,
            error: 'Local auth middleware failed. Check the Vite terminal.',
          });
        }
      });
    },
  };
}
