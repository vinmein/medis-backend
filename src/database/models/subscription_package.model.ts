import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import { init } from '@paralleldrive/cuid2';
import { Status } from 'shared/enum/status.enum';
import { Duration } from 'shared/enum/duration.enum';

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

interface Refund extends Document {
  readonly action?: string;
  readonly value: number;
  readonly metric?: string;
}

interface Rule extends Document {
  readonly maxJobPost: number;
  readonly maxApplication: number;
  readonly refund: Refund;
}

interface Cost extends Document {
  readonly amount: number;
  readonly currency?: string;
  readonly paymentPeriod?: string;
}

interface SubscriptionPackage extends Document {
  readonly packageId: string;
  readonly packageCode: string;
  readonly packageName: string;
  readonly description?: string;
  readonly cost: Cost;
  readonly isPublic: boolean;
  readonly packageRule: Rule;
  readonly createdBy: string;
  readonly status: string;
}

type SubscriptionPackageModel = Model<SubscriptionPackage>;

const SubscriptionPackageScheme = new Schema<SubscriptionPackage>(
  {
    packageId: {
      type: String,
      required: true,
      default: createId(),
    },
    packageCode:{
      type: String,
      required: true,
    },
    packageName: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    cost: {
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        required: true,
      },
      paymentPeriod: {
        type: String,
        default: Duration.MONTHLY,
        enum: Duration,
      },
    },
    packageRule: {
      maxJobPost: {
        type: Number,
        required: true,
      },
      maxApplication: {
        type: Number,
        required: true,
      },
      refund: {
        action: {
          type: String,
          default: 'DEDUCT',
        },
        value: {
          type: Number,
          required: true,
        },
        metric: {
          type: String,
          default: 'PERCENTAGE',
        },
      },
    },
    isPublic:{
      type: Boolean,
      default: false
    },
    createdBy: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: Status.APPROVED,
      enum: Status,
    },
  },
  { timestamps: true },
);

const createSubscriptionPackageModel: (
  conn: Connection,
) => SubscriptionPackageModel = (conn: Connection) =>
  conn.model<SubscriptionPackage>(
    'SubscriptionPackage',
    SubscriptionPackageScheme,
    'subscriptionPackage',
  );

export {
  SubscriptionPackage,
  SubscriptionPackageModel,
  createSubscriptionPackageModel,
};
