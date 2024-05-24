import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAccountConfigDto } from './dto/create-account-config.dto';
import { UpdateAccountConfigDto } from './dto/update-account-config.dto';
import { ACCOUNT_CONFIG_MODEL } from 'database/database.constants';
import { AccountConfigModel } from 'database/models/account-config.model';
import { MongoServerError } from 'mongodb';
import { EMPTY, catchError, from, map, mergeMap, of, throwIfEmpty } from 'rxjs';

@Injectable()
export class AccountConfigService {
  constructor(
    @Inject(ACCOUNT_CONFIG_MODEL)
    private accountConfigModel: AccountConfigModel,
  ) {}

  create(createAccountConfigDto: CreateAccountConfigDto) {
    return from(
      this.accountConfigModel.create({ ...createAccountConfigDto }),
    ).pipe(
      mergeMap((p) => (p ? of(p) : EMPTY)),
      catchError((err) => {
        if (err instanceof MongoServerError && err.code === 11000) {
          throw new ConflictException('Duplicate entry for createdBy field');
        }
        throw err;
      }),
      throwIfEmpty(() => new NotFoundException(`post:$id was not found`)),
    );
  }

  findAll() {
    return this.accountConfigModel.find({});
  }

  findOne(userId: string) {
    return this.accountConfigModel.findOne({ userId });
  }

  findOnebyQuery(query: any) {
    return this.accountConfigModel.findOne(query);
  }

  update(userId: string, updateAccountConfigDto: UpdateAccountConfigDto) {
    return this.accountConfigModel.updateOne(
      { userId },
      { $set: updateAccountConfigDto },  // Use the actual data object here
      { new: true }
    );
  }

  remove(id: number) {
    return this.accountConfigModel.deleteOne({ id });
  }
}
