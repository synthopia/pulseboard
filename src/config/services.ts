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
    url: 'https://skilltap.net',
    method: 'GET',
  },
  {
    name: 'OpenCNT',
    url: 'https://opencnt.com',
    method: 'GET',
  },
  {
    name: 'Crable',
    url: 'https://crable.co',
    method: 'GET',
  },
];
