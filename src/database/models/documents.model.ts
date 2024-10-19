import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import { User } from './user.model';
import { init } from '@paralleldrive/cuid2';
import { Profile } from './profile.model';

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

interface IDDocument extends Document {
  readonly documentId: string;
  readonly profile?: Partial<Profile>;
  readonly type: string;
  readonly url: string;
}

type IDDocumentModel = Model<IDDocument>;

const  IDDocumentSchema = new Schema<IDDocument>(
  {
    documentId: {
      type: String,
      required: true,
      default: () => createId()
    },
    profile: {
      type: SchemaTypes.ObjectId,
      ref: 'Profile',
      required: false,
    },
    type: {
      type: String,
      required: true,
      enum: ["DEGREE_CERTIFICATE", "DOCUMENTS", "IDPROOF", "PHOTO"]
    },
    url: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const createIDDocumentModel: (conn: Connection) => IDDocumentModel = (
  conn: Connection,
) =>
  conn.model<IDDocument>(
    'IDDocument',
    IDDocumentSchema,
    'idDocuments',
  );

export { IDDocument, IDDocumentModel, createIDDocumentModel };
