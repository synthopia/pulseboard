import { Router, Request, Response } from 'express';
import db from '../../db';

const router: Router = Router();

// GET /api/v1/status - list all services and their latest check
router.get('/', async (_req: Request, res: Response) => {
  const services = await db.service.findMany({
    include: {
      checks: {
        orderBy: { checkedAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { id: 'asc' },
  });
  res.json(
    services.map(s => ({
      id: s.id,
      name: s.name,
      url: s.url,
      method: s.method,
      headers: s.headers,
      body: s.body,
      createdAt: s.createdAt,
      latestCheck: s.checks[0] || null,
    }))
  );
});

// GET /api/v1/status/all-checks - all checks for all services (with service info)
router.get('/all-checks', async (_req: Request, res: Response) => {
  const checks = await db.serviceCheck.findMany({
    orderBy: [{ serviceId: 'asc' }, { checkedAt: 'desc' }],
    include: { service: true },
  });
  res.json(checks);
});

// GET /api/v1/status/:id - details for a single service
router.get('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const service = await db.service.findUnique({
    where: { id },
    include: {
      checks: {
        orderBy: { checkedAt: 'desc' },
        take: 10,
      },
    },
  });
  if (!service) return res.status(404).json({ error: 'Service not found' });
  return res.json({
    id: service.id,
    name: service.name,
    url: service.url,
    method: service.method,
    headers: service.headers,
    body: service.body,
    createdAt: service.createdAt,
    checks: service.checks,
  });
});

export default router;
