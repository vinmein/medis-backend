import { registerAs } from '@nestjs/config';
import { Environment } from '../shared/enum/app.enum';

export default registerAs('environment', () => ({
  env: process.env.NODE_ENV
}));