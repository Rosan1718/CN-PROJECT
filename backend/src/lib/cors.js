const configuredOriginValues = [
  process.env.FRONTEND_URL,
  // Render serves the frontend and API from this same public origin in the
  // single-service deployment. Render provides this value at runtime.
  process.env.RENDER_EXTERNAL_URL,
].filter(Boolean);

if (!configuredOriginValues.length) configuredOriginValues.push("http://localhost:5173");

const configuredOrigins = configuredOriginValues
  .join(",")
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

export function isAllowedFrontendOrigin(origin) {
  if (!origin) return true;
  const normalizedOrigin = origin.replace(/\/+$/, "");
  if (configuredOrigins.includes(normalizedOrigin)) return true;

  try {
    const url = new URL(normalizedOrigin);
    const configuredAppIsLocal = configuredOrigins.some((configuredOrigin) => {
      try {
        const configuredUrl = new URL(configuredOrigin);
        return configuredUrl.hostname === "localhost" || configuredUrl.hostname === "127.0.0.1";
      } catch {
        return false;
      }
    });

    return (
      (process.env.NODE_ENV !== "production" || configuredAppIsLocal) &&
      url.protocol === "http:" &&
      (url.hostname === "localhost" || url.hostname === "127.0.0.1")
    );
  } catch {
    return false;
  }
}

export function frontendCorsOrigin(origin, callback) {
  if (isAllowedFrontendOrigin(origin)) {
    callback(null, true);
    return;
  }

  // Reject this origin without turning a normal cross-origin browser request
  // into an application error and noisy stack trace.
  callback(null, false);
}
