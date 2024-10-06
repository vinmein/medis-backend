import { Inject, Injectable } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PROFILE_MODEL } from 'database/database.constants';
import { ProfileModel } from 'database/models/profile.model';
import { QueryProfileDto } from './dto/query-profile.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { UserStatus } from 'shared/enum/user-status.enum';

@Injectable()
export class ProfileService {
  constructor(@Inject(PROFILE_MODEL) private profileModel: ProfileModel) {}

  @OnEvent('PROFILE.STATUS.UPDATE')
  async handleEvent(payload: any) {
    const response = await this.profileModel.updateOne(
      payload.query,
      {
        $set: payload.update,
      },
      { upsert: true }, // Returns the updated document
    );
  }

  create(createProfileDto: CreateProfileDto) {
    const created = this.profileModel.create({
      ...createProfileDto,
    });
    return created;
  }

  findAll() {
    return this.profileModel.find({});
  }

  findOne(id: string) {
    return this.profileModel.findById(id);
  }

  findOnebyUserId(userId: string) {
    return this.profileModel.findOne({ userId });
  }

  findOnebyQuery(query: QueryProfileDto) {
    return this.profileModel.findOne(query);
  }

  findOnebyAnyQuery(query: any) {
    return this.profileModel.find(query);
  }

  update(id: string, updateProfileDto: UpdateProfileDto) {
    return this.profileModel.updateOne({ _id: id }, { $set: updateProfileDto });
  }

  updateByQuery(query: QueryProfileDto, updateProfileDto: UpdateProfileDto) {
    return this.profileModel.updateOne(
      query,
      { $set: updateProfileDto, $setOnInsert: { __v: 0 } },
      { upsert: true, runValidators: true },
    );
  }

  remove(id: string) {
    return this.profileModel.deleteOne({ id });
  }

  removebyQuery(query: QueryProfileDto) {
    return this.profileModel.deleteOne(query);
  }
}
