import { registerAs } from '@nestjs/config';

export default registerAs('mongodb', () => ({
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/blog',
  host: process.env.DATABASE_HOST || 'localhost:27017',
  user: process.env.DATABASE_USER ,
  password: process.env.DATABASE_PASSWORD ,
  dbName: process.env.DATABASE_NAME ,
}));
