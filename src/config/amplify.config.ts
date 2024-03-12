import { registerAs } from '@nestjs/config';
import { Environment } from '../shared/enum/app.enum';

export default registerAs('amplify', () => ({
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  clientId: process.env.COGNITO_CLIENT_ID,
  region: process.env.COGNITO_REGION,
}));

