import { registerAs } from '@nestjs/config';
import { Duration } from 'shared/enum/duration.enum';
export default registerAs('application', () => ({
  credits: {
    default: 30,
  },
  jobApplication: {
    toPost: 10,
    toApply: 5,
    refund: {
      type: 'DEDUCT',
      value: '80',
      metric: 'PERCENTAGE',
    },
  },
  package: {
    ESSENTIAL: {
      maxJobPost: 5,
      maxApplication: 15,
      refund: {
        type: 'DEDUCT',
        value: '50',
        metric: 'PERCENTAGE',
      },
      cost: {
        amount: "250",
        currency: "RS",
        paymentPeriod: Duration.MONTHLY 
      }
    },
    PLUS: {
      maxJobPost: 25,
      maxApplication: 50,
      refund: {
        type: 'DEDUCT',
        value: '25',
        metric: 'PERCENTAGE',
      },
      cost: {
        amount: "1000",
        currency: "RS",
        paymentPeriod: Duration.MONTHLY 
      }
    },
    ULTIMATE: {
      maxJobPost: 50,
      maxApplication: 100,
      refund: {
        type: 'DEDUCT',
        value: '25',
        metric: 'PERCENTAGE',
      },
      cost: {
        amount: "2000",
        currency: "RS",
        paymentPeriod: Duration.MONTHLY 
      }
    },
  },
}));
