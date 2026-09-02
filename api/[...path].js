import app from '../artifacts/api-server/src/app.js';

// Vercel invokes the Express app as a serverless function for every /api/*
// request. The app already mounts its router under /api.
export default app;
