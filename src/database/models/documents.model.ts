import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import { User } from './user.model';
import { nanoid } from 'nanoid';
import { Profile } from './profile.model';

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
      default: nanoid(),
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
