import { registerAs } from '@nestjs/config';
export default registerAs('application', () => ({
  jobApplication: {
    toPost: 5,
    toApply: 3,
    toWithdraw: 1,
  },
}));
