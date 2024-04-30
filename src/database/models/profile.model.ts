import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import { User } from './user.model';
import { init } from '@paralleldrive/cuid2';
import { UserType } from 'shared/enum/user-type.enum';
import { UserStatus } from 'shared/enum/user-status.enum';

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

interface Profile extends Document {
  readonly profileId: string;
  readonly userId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly dob: string;
  readonly emailId: string;
  readonly mobileNumber: string;
  readonly type: UserType;
  readonly role: [string];
  readonly createdBy?: Partial<User>;
  readonly updatedBy?: Partial<User>;
  readonly status: string;
}

type ProfileModel = Model<Profile>;

const ProfileScheme = new Schema<Profile>(
  {
    profileId: {
      type: String,
      required: true,
      default:  createId()
    },
    userId: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    dob: {
      type: String,
    },
    emailId: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
    },
    status:{
      type: String,
      default: UserStatus.NEWUSER,
      enum: UserStatus
    },
    type: {
      type: String,
      required: true,
      enum: UserType
    },
    role: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true },
);

const createProfileModel: (conn: Connection) => ProfileModel = (
  conn: Connection,
) => conn.model<Profile>('Profile', ProfileScheme, 'profiles');

export { Profile, ProfileModel, createProfileModel };
