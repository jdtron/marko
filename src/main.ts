// Defer the app start, so that env variables can be properly set
// before the app reads them

process.env.FORCE_COLOR = '3'; // force color output

await import('./app.ts');
