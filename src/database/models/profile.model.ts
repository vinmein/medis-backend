import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import { User } from './user.model';
const hyperid = require('hyperid')
import { Qualification } from './qualification.model';

interface Profile extends Document {
  readonly profileId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly dob: string;
  readonly emailId: string;
  readonly mobileNumber: string;
  readonly type: string;
  readonly role: [string];
  readonly createdBy?: Partial<User>;
  readonly updatedBy?: Partial<User>;
}

type ProfileModel = Model<Profile>;

const ProfileScheme = new Schema<Profile>(
  {
    profileId: {
      type: String,
      required: true,
      default: hyperid()
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
    type: {
      type: String,
      required: true,
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
