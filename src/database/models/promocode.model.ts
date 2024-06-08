import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import { User } from './user.model';
import { init } from '@paralleldrive/cuid2';
import { PromoCode } from 'shared/enum/promocode.enum';
import { Status } from 'shared/enum/status.enum';
import { PromoCategory } from 'shared/enum/promo_category.enum';
import { PromoAction } from 'shared/enum/promo_action.enum';

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

interface Rule extends Document{
  readonly action: PromoAction,
  readonly duration?: number,
  readonly discount: number,
}

interface Promocode extends Document {
  readonly promocodeId: string;
  readonly promocode: string;
  readonly description: string;
  readonly validFrom: number;
  readonly validTo?: number;
  readonly limit?: number;
  readonly type: PromoCode;
  readonly numberOfUse: number;
  readonly category: PromoCategory;
  readonly rule: Rule;
  readonly createdBy?: Partial<User>;
  readonly updatedBy?: Partial<User>;
  readonly status: Status;
}

type PromocodeModel = Model<Promocode>;

const PromocodeScheme = new Schema<Promocode>(
  {
    promocodeId: {
      type: String,
      required: true,
      default: createId(),
    },
    promocode: {
      type: String,
      required: true,
      unique: true
    },
    description:{
        type: String,
    },
    type: {
      type: String,
      required: true,
      enum: PromoCode,
    },
    category:{
        type: String,
        required: true,
        enum: PromoCategory,
    },
    rule:{
      action: {
        type: String,
        required: true,
        enum: PromoAction,
      },
      duration: {
        type: Number,
      },
      discount: {
        type: Number,
      },
    },
    numberOfUse:{
      type: Number,
      default: 1
    },
    limit:{
        type: Number,
    },
    validFrom: {
      type: Number,
      required: true,
    },
    validTo: {
      type: Number,
    },
    status: {
      type: String,
      default: Status.APPROVED,
      enum: Status,
    },
  },
  { timestamps: true },
);

const createPromocodeModel: (conn: Connection) => PromocodeModel = (
  conn: Connection,
) => conn.model<Promocode>('Promocode', PromocodeScheme, 'promocodes');

export { Promocode, PromocodeModel, createPromocodeModel };
