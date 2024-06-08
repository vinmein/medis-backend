import { registerAs } from '@nestjs/config';

export default registerAs('aws.credentials', () => ({
  keyId: process.env.AWS_ACCESSKEYID,
  secret: process.env.AWS_SECRET,
}));

