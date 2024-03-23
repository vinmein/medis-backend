import { Inject, Injectable } from '@nestjs/common';
import { CreateAccountConfigDto } from './dto/create-account-config.dto';
import { UpdateAccountConfigDto } from './dto/update-account-config.dto';
import { ACCOUNT_CONFIG_MODEL } from 'database/database.constants';
import { AccountConfigModel } from 'database/models/account-config.model';

@Injectable()
export class AccountConfigService {
  constructor(
    @Inject(ACCOUNT_CONFIG_MODEL)
    private accountConfigModel: AccountConfigModel,
  ) {}

  create(createAccountConfigDto: CreateAccountConfigDto) {
    return this.accountConfigModel.create({...createAccountConfigDto})
  }

  findAll() {
    return this.accountConfigModel.find({});
  }

  findOne(id: number) {
    return this.accountConfigModel.findById(id);
  }

  update(id: number, updateAccountConfigDto: UpdateAccountConfigDto) {
    return this.accountConfigModel.updateOne(
      { _id: id },
      UpdateAccountConfigDto,
    );
  }

  remove(id: number) {
    return this.accountConfigModel.deleteOne({ id });
  }
}
