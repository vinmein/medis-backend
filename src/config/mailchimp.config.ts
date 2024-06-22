import { registerAs } from '@nestjs/config';

export default registerAs('mailchimp', () => ({
  apiKey: process.env.MAILCHIMP,
}));

