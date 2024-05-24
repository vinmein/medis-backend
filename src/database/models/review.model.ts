import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import { User } from './user.model';
import { init } from '@paralleldrive/cuid2';
import { Status } from 'shared/enum/status.enum';
import { UserType } from 'shared/enum/user-type.enum';

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

interface File extends Document {
  readonly fileId: string;
  readonly url: string;
  readonly type: string;
  readonly mimeType: string;
  readonly storageId: string;
  readonly isValid: string;
  readonly feedback: string;
}

interface CheckList extends Document {
  readonly checkId: string;
  readonly checkItem: string;
  readonly status: string;
}

interface UserReview extends Document {
  readonly requestId: string;
  readonly education: string;
  readonly yearOfPassedOut: string;
  readonly councilNumber: string;
  readonly council: string;
  readonly mobileNumber: string;
  readonly verificationFor: string;
  readonly status: string;
  readonly feedback: string;
  readonly userType: string;
  readonly reviewedBy?: string;
  readonly createdBy?: string;
  readonly documents?: [File];
  readonly checkList?:[CheckList]
}

type UserReviewModel = Model<UserReview>;

const CheckList =  new Schema<CheckList>({
  checkId: {
    type: String,
    required: true,
    default:  createId()
  },
  checkItem:{
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: Status.PENDING,
    enum: Status
  },
})

const Files = new Schema<File>({
  fileId: {
    type: String,
    required: true,
    default:  createId()
  },
  url: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  mimeType:{
    type: String,
    required: true,
  },
  storageId:{
    type: String,
    required: true,
  },
  isValid: {
    type: String,
    default: Status.PENDING,
    enum: Status
  },
  feedback: {
    type: String,
  },
})

const UserReviewSchema = new Schema<UserReview>(
  {
    requestId: {
      type: String,
      required: true,
      default:  createId()
    },
    createdBy: {
      type: String,
      unique: true,
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
    council:{
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
    mobileNumber:{
      type: String,
      required: true,
    },
    feedback:{
      type: String,
    },
    checkList: {
      type:[CheckList]
    },
    reviewedBy:{
      type: String,
    },
    documents:{
      type:[Files]
    },
    status: {
      type: String,
      default: Status.SUBMITTED,
      enum: Status
    },
  },
  { timestamps: true },
);

const createUserReviewModel: (conn: Connection) => UserReviewModel = (
  conn: Connection,
) => conn.model<UserReview>('UserReview', UserReviewSchema, 'userReviews');

export { UserReview, UserReviewModel, createUserReviewModel };
