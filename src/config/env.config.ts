export const EnvConfiguration = () => ({
  dbHost: process.env.DB_HOST || '',
  dbName: process.env.DB_NAME || '',
  dbPassword: process.env.DB_PASSWORD || '',
  dbPort: process.env.DB_PORT || 5432,
  dbUsername: process.env.DB_USERNAME || '',
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
});
