export default class TestService {
  test() {
    return 'test';
  }

  getPing() {
    return {
      message: 'pong',
      timestamp: new Date().toISOString(),
    };
  }
}
