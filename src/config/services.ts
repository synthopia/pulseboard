export const services: {
  name: string;
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: Record<string, string>;
  response?: Record<string, string>;
  responseTime?: number;
  status?: number;
}[] = [
  {
    name: 'App',
    url: 'https://github.com/synthopia/pulseboard',
    method: 'GET',
  },
];
