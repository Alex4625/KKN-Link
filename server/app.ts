// server/app.ts — Instance Hono utama, pasang middleware dan route
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authMiddleware, securityHeaders } from './middleware/auth';
import authRoutes from './routes/auth';
import categoriesRoutes from './routes/categories';
import itemsRoutes from './routes/items';

/** Tipe environment Cloudflare Pages Functions */
export type AppEnv = {
  Bindings: {
    DB: D1Database;
    ACCESS_CODE: string;
    SESSION_SECRET: string;
    SECRET_ENC_KEY: string;
  };
};

const app = new Hono<AppEnv>().basePath('/api');

// Middleware global
app.use('*', cors());
app.use('*', securityHeaders);
app.use('*', authMiddleware);

// Route
app.route('/auth', authRoutes);
app.route('/categories', categoriesRoutes);
app.route('/items', itemsRoutes);

export default app;
