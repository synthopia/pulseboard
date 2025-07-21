import { Router, Request, Response } from 'express';
import TestService from './service';
import { asyncHandler } from '../../../middleware/error-handler';

const router: Router = Router();
const testService = new TestService();

router.get(
  '/ping',
  asyncHandler(async (_req: Request, res: Response) => {
    const result = testService.getPing();
    res.json(result);
  })
);

router.get(
  '/test',
  asyncHandler(async (_req: Request, res: Response) => {
    const result = testService.test();
    res.json({ message: result });
  })
);

export default router;
