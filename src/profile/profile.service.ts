import { Inject, Injectable } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PROFILE_MODEL } from 'database/database.constants';
import { ProfileModel } from 'database/models/profile.model';
import { QueryProfileDto } from './dto/query-profile.dto';

@Injectable()
export class ProfileService {
  constructor(@Inject(PROFILE_MODEL) private profileModel: ProfileModel) {}

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

  update(id: string, updateProfileDto: UpdateProfileDto) {
    return this.profileModel.updateOne({ _id: id }, { $set: updateProfileDto });
  }

  updateByQuery(query: QueryProfileDto, updateProfileDto: UpdateProfileDto) {
    return this.profileModel.updateOne(query, {$set: updateProfileDto});
  }

  remove(id: string) {
    return this.profileModel.deleteOne({ id });
  }
}
