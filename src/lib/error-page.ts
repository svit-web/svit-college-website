export function renderErrorPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>500 - Internal Server Error</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #0b1329; color: #ffffff; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1rem; text-align: center; }
    .card { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 1rem; padding: 2.5rem; max-width: 420px; }
    h1 { color: #d4af37; font-size: 2.5rem; margin: 0 0 1rem; }
    p { color: rgba(255, 255, 255, 0.8); font-size: 0.95rem; line-height: 1.5; margin: 0 0 1.5rem; }
    a { display: inline-block; background: #d4af37; color: #0b1329; font-weight: 700; text-decoration: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; }
    a:hover { background: #e5c158; }
  </style>
</head>
<body>
  <div class="card">
    <h1>SVIT Vasad</h1>
    <p>We encountered a temporary server error. Please refresh or head back to the home page.</p>
    <a href="/">Go Home</a>
  </div>
</body>
</html>`;
}
