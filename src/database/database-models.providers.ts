import { Connection } from 'mongoose';
import { Comment, createCommentModel } from './models/comment.model';
import {
  ACCOUNT_CONFIG_MODEL,
  COMMENT_MODEL,
  DATABASE_CONNECTION,
  POST_MODEL,
  PROFILE_MODEL,
  USER_MODEL,
} from './database.constants';
import { Post, createPostModel } from './models/post.model';
import { createUserModel } from './models/user.model';
import { createProfileModel } from './models/profile.model';
import { accountConfigModel } from './models/account-config.model';

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
  {
    provide: ACCOUNT_CONFIG_MODEL,
    useFactory: (connection: Connection) => accountConfigModel(connection),
    inject: [DATABASE_CONNECTION],
  },
];
