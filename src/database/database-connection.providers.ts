import { ConfigType } from '@nestjs/config';
import { Connection, createConnection } from 'mongoose';
import mongodbConfig from '../config/mongodb.config';
import environmentConfig from '../config/environment.config';
import { DATABASE_CONNECTION } from './database.constants';
import { Environment } from '../shared/enum/app.enum';

export const databaseConnectionProviders = [
  {
    provide: DATABASE_CONNECTION,
    useFactory: (dbConfig: ConfigType<typeof mongodbConfig>, envConfig: ConfigType<typeof environmentConfig>): Connection => {
      let connectionUrl;
      if (envConfig.env != Environment.DEVELOPMENT) {
        connectionUrl = `mongodb+srv://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}/${dbConfig.dbName}`;
      } else {
        connectionUrl = `mongodb://${dbConfig.host}/${dbConfig.dbName}`;
      }

      const conn = createConnection(connectionUrl, {
        //useNewUrlParser: true,
        //useUnifiedTopology: true,
        //see: https://mongoosejs.com/docs/deprecations.html#findandmodify
        //useFindAndModify: false,
      });

      conn.on('disconnect', () => {
        console.log('Disconnecting to MongoDB');
      });

      return conn;
    },
    inject: [mongodbConfig.KEY, environmentConfig.KEY],
  },
];
