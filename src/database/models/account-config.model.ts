import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import { User } from './user.model';
import { init } from '@paralleldrive/cuid2';

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
  readonly status: boolean;
}

interface Credits extends Document {
    readonly value: number;
    readonly duration: string;
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
      default:  createId()
    },
    userId: {
      type: String,
      required: true,
    },
    profileId: {
        type: String,
    },
    isSubscribed: {
      status:{
        type: Boolean,
        default: false,
      }
    },
    credits:{
        value: {
            type: Number,
            default: 30,
        },
        duration: {
            type: String,
            default: "MONTHLY",
        },
    },
  },
  { timestamps: true },
);

const accountConfigModel: (conn: Connection) => AccountConfigModel = (
  conn: Connection,
) => conn.model<AccountConfig>('AccountConfig', AccountConfigScheme, 'accountconfigs');

export { AccountConfig, AccountConfigModel, accountConfigModel };
