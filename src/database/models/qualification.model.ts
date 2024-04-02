import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import { User } from './user.model';
import { nanoid } from 'nanoid';
import { Profile } from './profile.model';

interface Qualification extends Document {
  readonly qualificationId: string;
  readonly profile?: Partial<Profile>;
  readonly userId: string;
  readonly education: string;
  readonly yearOfPassedOut: string;
  readonly councilNumber: string;
  readonly createdBy?: Partial<User>;
  readonly updatedBy?: Partial<User>;
}

type QualificationModel = Model<Qualification>;

const QualificationSchema = new Schema<Qualification>(
  {
    qualificationId: {
      type: String,
      required: true,
      default: nanoid(),
    },
    userId: {
      type: String,
      required: true,
    },
    profile: {
      type: SchemaTypes.ObjectId,
      ref: 'Profile',
      required: false,
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
    },
  },
  { timestamps: true },
);

const createPostModel: (conn: Connection) => QualificationModel = (
  conn: Connection,
) =>
  conn.model<Qualification>(
    'Qualification',
    QualificationSchema,
    'qualifications',
  );

export { Qualification, QualificationModel, createPostModel };
