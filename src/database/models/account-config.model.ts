import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import { User } from './user.model';
import { init } from '@paralleldrive/cuid2';
import { SubscriptionStatus } from 'shared/enum/subscription_status';
import { Duration } from 'shared/enum/duration.enum';
import { DEFAULT_CREDITS } from 'database/database.constants';
import { SubscriptionType } from 'shared/enum/subscription_type';

const createId = init({
  // A custom random function with the same API as Math.random.
  // You can use this to pass a cryptographically secure random function.
  random: Math.random,
  // the length of the id
  length: 10,
  // A custom fingerprint for the host environment. This is used to help
  // prevent collisions when generating ids in a distributed system.
  fingerprint: 'medic-app',
});

interface Subscribed extends Document {
  readonly status: string;
  readonly packageCode?: string;
  readonly duration?: string;
  readonly period?: number;
  readonly started?: number;
  
}

interface Credits extends Document {
  readonly defaultValue: number;
  readonly duration: Duration;
  readonly available: number;
}

interface AccountConfig extends Document {
  readonly configId: string;
  readonly profileId: string;
  readonly userId: string;
  readonly isSubscribed: Subscribed;
  readonly credits: Credits;
}

type AccountConfigModel = Model<AccountConfig>;

const AccountConfigScheme = new Schema<AccountConfig>(
  {
    configId: {
      type: String,
      required: true,
      default: createId(),
    },
    userId: {
      type: String,
      required: true,
    },
    profileId: {
      type: String,
    },
    isSubscribed: {
      status: {
        type: String,
        enum: SubscriptionStatus,
      },
      packageCode:{
        type: String,
      },
      duration: {
        type: String,
        enum: Duration.MONTHLY
      },
      period: {
        type: Number,
        default: 0
      },
      started:{
        type: Number,
      }
    },
    credits: {
      defaultValue: {
        type: Number,
        default: DEFAULT_CREDITS,
      },
      duration: {
        type: String,
        default: Duration.MONTHLY,
        enum: Duration,
      },
      available: {
        type: Number,
        required: true,
      },
    },
  },
  { timestamps: true },
);

const accountConfigModel: (conn: Connection) => AccountConfigModel = (
  conn: Connection,
) =>
  conn.model<AccountConfig>(
    'AccountConfig',
    AccountConfigScheme,
    'accountconfigs',
  );

export { AccountConfig, AccountConfigModel, accountConfigModel };
