export const EnvConfiguration = () => ({
  dbHost: process.env.DB_HOST || '',
  dbName: process.env.DB_NAME || '',
  dbPassword: process.env.DB_PASSWORD || '',
  dbPort: process.env.DB_PORT || 5432,
  dbUsername: process.env.DB_USERNAME || '',
  environment: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || '',
  port: Number(process.env.PORT) || 3000,
});
