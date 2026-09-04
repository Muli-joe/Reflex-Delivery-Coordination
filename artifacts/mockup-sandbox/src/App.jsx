import { useEffect, useState } from "react";

function getBasePath() {
  return import.meta.env.BASE_URL.replace(/\/$/, "");
}

function getPreviewPath() {
  const basePath = getBasePath();
  const pathname = window.location.pathname;
  const local = basePath && pathname.startsWith(basePath)
    ? pathname.slice(basePath.length) || "/"
    : pathname;
  const match = local.match(/^\/preview\/(.+)$/);
  return match ? match[1] : null;
}

const componentModules = import.meta.glob("./components/mockups/**/*.{jsx,tsx}");

function PreviewRenderer({ componentPath }) {
  const [Component, setComponent] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setComponent(null);
    setError(null);

    const modulePath = [
      `./components/mockups/${componentPath}.jsx`,
      `./components/mockups/${componentPath}.tsx`,
    ].find((path) => componentModules[path]);

    if (!modulePath) {
      setError(`No preview component found for ${componentPath}.`);
      return () => { cancelled = true; };
    }

    componentModules[modulePath]()
      .then((module) => {
        if (cancelled) return;
        const component = module.default || module.Preview ||
          Object.values(module).find((value) => typeof value === "function");
        if (!component) setError(`No React component found in ${componentPath}.`);
        else setComponent(() => component);
      })
      .catch((loadError) => {
        if (!cancelled) setError(`Failed to load preview.\n${loadError.message}`);
      });

    return () => { cancelled = true; };
  }, [componentPath]);

  if (error) return <pre style={{ color: "red", padding: "2rem" }}>{error}</pre>;
  if (!Component) return null;
  return <Component />;
}

function Gallery() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem", fontFamily: "system-ui" }}>
      <div style={{ maxWidth: 440, textAlign: "center" }}>
        <h1>Component Preview Server</h1>
        <p>This server renders individual components for the workspace canvas.</p>
        <code>{getBasePath()}/preview/ComponentName</code>
      </div>
    </div>
  );
}

export default function App() {
  const previewPath = getPreviewPath();
  return previewPath ? <PreviewRenderer componentPath={previewPath} /> : <Gallery />;
}