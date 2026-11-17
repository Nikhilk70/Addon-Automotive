/**
 * A tiny Express-style router that runs in the browser, so the route files in
 * src/mock/routes/ read exactly like Express handlers (req, res, next).
 */
export function Router() {
  const stack = [];
  const add = (method) => (path, ...handlers) => stack.push({ method, path, handlers });
  return {
    stack,
    get: add('GET'),
    post: add('POST'),
    put: add('PUT'),
    patch: add('PATCH'),
    delete: add('DELETE'),
    use: (prefix, ...handlers) => stack.push({ use: prefix, handlers }),
  };
}

function matchPath(pattern, path) {
  const p = pattern.split('/').filter(Boolean);
  const a = path.split('/').filter(Boolean);
  if (p.length !== a.length) return null;
  const params = {};
  for (let i = 0; i < p.length; i += 1) {
    if (p[i].startsWith(':')) params[p[i].slice(1)] = decodeURIComponent(a[i]);
    else if (p[i] !== a[i]) return null;
  }
  return params;
}

/** Runs a request through the routers. Resolves with { status, body }. */
export function dispatch(routers, { method, path, query = {}, body, headers = {} }) {
  const layers = routers.flatMap((r) => r.stack);
  return new Promise((resolve) => {
    const req = { method, path, query, body, headers, params: {}, ip: 'browser' };
    const res = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        resolve({ status: this.statusCode, body: data });
        return this;
      },
    };

    let i = 0;
    const next = (err) => {
      if (err) {
        const status = err.status || 500;
        if (status >= 500) console.error(err);
        resolve({
          status,
          body: { error: status >= 500 ? 'Something went wrong' : err.message, ...(err.details || {}) },
        });
        return;
      }
      while (i < layers.length) {
        const layer = layers[i++];
        if (layer.use !== undefined) {
          if (path === layer.use || path.startsWith(`${layer.use}/`)) return runChain(layer.handlers);
          continue;
        }
        if (layer.method !== method) continue;
        const params = matchPath(layer.path, path);
        if (params) {
          req.params = params;
          return runChain(layer.handlers);
        }
      }
      resolve({ status: 404, body: { error: 'Not found' } });
    };

    function runChain(handlers) {
      let j = 0;
      const step = (err) => {
        if (err) return next(err);
        if (j >= handlers.length) return next();
        const h = handlers[j++];
        try {
          const out = h(req, res, step);
          if (out && typeof out.catch === 'function') out.catch(next);
        } catch (e) {
          next(e);
        }
      };
      step();
    }

    next();
  });
}
