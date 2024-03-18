import { Connection } from 'mongoose';
import { Comment, createCommentModel } from './models/comment.model';
import {
  COMMENT_MODEL,
  DATABASE_CONNECTION,
  POST_MODEL,
  PROFILE_MODEL,
  USER_MODEL,
} from './database.constants';
import { Post, createPostModel } from './models/post.model';
import { createUserModel } from './models/user.model';
import { createProfileModel } from './models/profile.model';

export const databaseModelsProviders = [
  {
    provide: POST_MODEL,
    useFactory: (connection: Connection) => createPostModel(connection),
    inject: [DATABASE_CONNECTION],
  },
  {
    provide: COMMENT_MODEL,
    useFactory: (connection: Connection) => createCommentModel(connection),
    inject: [DATABASE_CONNECTION],
  },
  {
    provide: USER_MODEL,
    useFactory: (connection: Connection) => createUserModel(connection),
    inject: [DATABASE_CONNECTION],
  },
  {
    provide: PROFILE_MODEL,
    useFactory: (connection: Connection) => createProfileModel(connection),
    inject: [DATABASE_CONNECTION],
  },
];
