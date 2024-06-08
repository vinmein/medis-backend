import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import { Profile } from './profile.model';
import { init } from '@paralleldrive/cuid2';
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

interface Qualification extends Document {
  readonly qualificationId: string;
  readonly profile?: Partial<Profile>;
  readonly userId: string;
  readonly education: string;
  readonly yearOfPassedOut: string;
  readonly council: string;
  readonly councilNumber: string;
  readonly createdBy?: string;
  readonly userType: UserType;
  readonly updatedBy?: string;
  readonly mobileNumber: string;
}

type QualificationModel = Model<Qualification>;

const QualificationSchema = new Schema<Qualification>(
  {
    qualificationId: {
      type: String,
      required: true,
      default:  createId()
    },
    userId: {
      type: String,
      required: true,
      unique:   true
    },
    education: {
      type: String,
    },
    yearOfPassedOut: {
      type: String,
    },
    council:{
      type: String,
    },
    councilNumber: {
      type: String,
    },
    userType: {
      type: String,
      required: true,
      enum: UserType
    },
    mobileNumber:{
      type: String,
    },
  },
  { timestamps: true },
);

const createQualificationModel: (conn: Connection) => QualificationModel = (
  conn: Connection,
) =>
  conn.model<Qualification>(
    'Qualification',
    QualificationSchema,
    'qualifications',
  );

export { Qualification, QualificationModel, createQualificationModel };
