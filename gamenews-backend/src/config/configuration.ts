export default () => ({
  app: {
    port: parseInt(
      process.env.APP_PORT ?? '3000',
      10,
    ),

    environment:
      process.env.NODE_ENV ?? 'development',
  },

  database: {
    host:
      process.env.DB_HOST ?? 'localhost',

    port: parseInt(
      process.env.DB_PORT ?? '5432',
      10,
    ),

    username:
      process.env.DB_USERNAME ?? 'postgres',

    password:
      process.env.DB_PASSWORD ?? '',

    name:
      process.env.DB_NAME ?? 'game_news',
  },

  jwt: {
    secret: process.env.JWT_SECRET ?? '',
  },
});
