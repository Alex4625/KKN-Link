// functions/api/[[route]].ts — Entry point Cloudflare Pages Functions
// Menghubungkan Cloudflare Pages Functions dengan router Hono
import { handle } from 'hono/cloudflare-pages';
import app from '../../server/app';

export const onRequest = handle(app);
