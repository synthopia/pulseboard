import request from 'supertest';
import app from '../../../index';

describe('Test Routes', () => {
  describe('GET /api/v1/test/ping', () => {
    it('should return pong', async () => {
      const response = await request(app).get('/api/v1/test/ping').expect(200);

      expect(response.body).toEqual({
        message: 'pong',
        timestamp: expect.any(String),
      });
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health').expect(200);

      expect(response.body).toEqual({
        status: 'ok',
        timestamp: expect.any(String),
        environment: expect.any(String),
      });
    });
  });

  describe('GET /non-existent-route', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404);

      expect(response.body.error).toEqual({
        message: 'Route /non-existent-route not found',
      });
    });
  });
});
