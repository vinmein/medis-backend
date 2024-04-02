import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import { User } from './user.model';
import { init } from '@paralleldrive/cuid2';
import { Status } from 'shared/enum/status.enum';
import { UserType } from 'shared/enum/userType.enum';

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



interface UserReview extends Document {
  readonly requestId: string;
  readonly education: string;
  readonly yearOfPassedOut: string;
  readonly councilNumber: string;
  readonly verificationFor: string;
  readonly status: string;
  readonly feedback: string;
  readonly userType: string;
  readonly reviewedBy?: Partial<User>;
  readonly createdBy?: Partial<User>;
}

type UserReviewModel = Model<UserReview>;



const UserReviewSchema = new Schema<UserReview>(
  {
    requestId: {
      type: String,
      required: true,
      default:  createId()
    },
    createdBy: {
      type: String,
      required: true,
    },
    education: {
      type: String,
      required: true,
    },
    yearOfPassedOut: {
      type: String,
      required: true,
    },
    councilNumber: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      required: true,
      enum: UserType
    },
    feedback:{
      type: String,
    },
    reviewedBy:{
      type: String,
    },
    status: {
      type: String,
      default: Status.PENDING,
      enum: Status
    },
  },
  { timestamps: true },
);

const createUserReviewModel: (conn: Connection) => UserReviewModel = (
  conn: Connection,
) => conn.model<UserReview>('UserReview', UserReviewSchema, 'userReviews');

export { UserReview, UserReviewModel, createUserReviewModel };
