const DEFAULT_REDIS_HOST = 'localhost';
const DEFAULT_REDIS_PORT = 6379;
const DEFAULT_CACHE_TTL = 3600; // 1 hour

export default () => ({
  redis: {
    host: process.env.REDIS_HOST || DEFAULT_REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10) || DEFAULT_REDIS_PORT,
  },
  cacheTtl: parseInt(process.env.CACHE_TTL, 10) || DEFAULT_CACHE_TTL,
  monobankApiUrl: process.env.MONOBANK_API_URL,
});
