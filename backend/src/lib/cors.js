const configuredOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
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

  callback(new Error("Origin is not allowed by CORS"));
}
