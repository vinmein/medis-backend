import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import { User } from './user.model';
import { init } from '@paralleldrive/cuid2';

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



interface Storage extends Document {
  readonly storageId: string;
  readonly eTag: string;
  readonly location: string;
  readonly bucket: string;
  readonly key: string;
  readonly versionId: string;
  readonly url: string;
  readonly category: string;
  readonly createdBy?: string;
}

type StorageModel = Model<Storage>;



const StorageSchema = new Schema<Storage>(
  {
    storageId: {
      type: String,
      required: true,
      default:  createId()
    },
    createdBy: {
      type: String,
      required: true,
    },
    eTag: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    key: {
      type: String,
    },
    bucket: {
      type: String,
      required: true,
    },
    versionId: {
      type: String,
    },
    url: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const createStorageModel: (conn: Connection) => StorageModel = (
  conn: Connection,
) => conn.model<Storage>('Storage', StorageSchema, 'storages');

export { Storage, StorageModel, createStorageModel };
