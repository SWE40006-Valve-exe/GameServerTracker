import { Router } from 'express';
import { fetchGameServers, TRACKED_GAMES } from '../services/gameServers';
import { fetchPinnedServers } from '../services/pinnedServers';
import { fetchCSGONews, fetchHotSkins } from '../services/market';

const router = Router();

router.get('/servers/:gameId', async (req, res) => {
  const gameId = parseInt(req.params.gameId, 10);
  if (isNaN(gameId)) {
    return res.status(400).json({ error: 'Invalid game ID' });
  }
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
  const servers = await fetchGameServers(gameId, limit);
  res.json({ servers });
});

router.get('/pinned-servers', async (req, res) => {
  const pinned = await fetchPinnedServers();
  res.json({ pinned });
});

router.get('/market/news', async (req, res) => {
  const count = req.query.count ? parseInt(req.query.count as string, 10) : 6;
  const news = await fetchCSGONews(count);
  res.json({ news });
});

router.get('/market/skins', async (req, res) => {
  const appid = req.query.appid ? parseInt(req.query.appid as string, 10) : 730;
  const count = req.query.count ? parseInt(req.query.count as string, 10) : 15;
  const skins = await fetchHotSkins(appid, count);
  res.json({ skins });
});

export default router;
