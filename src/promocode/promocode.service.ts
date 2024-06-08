import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePromocodeDto } from './dto/create-promocode.dto';
import { UpdatePromocodeDto } from './dto/update-promocode.dto';
import { PROMO_CODE_MODEL } from 'database/database.constants';
import { PromocodeModel } from 'database/models/promocode.model';
import { MongoServerError } from 'mongodb';
import { EMPTY, catchError, from, map, mergeMap, of, throwIfEmpty } from 'rxjs';
import { QueryPromoDto } from './dto/query-promo.dto';
import mongoose from 'mongoose';

@Injectable()
export class PromocodeService {
  constructor(
    @Inject(PROMO_CODE_MODEL) private promocodeModel: PromocodeModel,
  ) {}

  create(createPromocodeDto: CreatePromocodeDto) {
    return from(this.promocodeModel.create({ ...createPromocodeDto })).pipe(
      mergeMap((p) => (p ? of(p) : EMPTY)),
      catchError((err) => {
        if (err instanceof MongoServerError && err.code === 11000) {
          throw new ConflictException('Duplicate entry for createdBy field');
        }
        if (err instanceof mongoose.Error.ValidationError) {
          throw new ConflictException(err.message);
        }
        throw err;
      }),
      throwIfEmpty(() => new NotFoundException(`post:$id was not found`)),
    );
  }

  findAll() {
    return this.promocodeModel.find({});
  }

  findOne(id: string) {
    return this.promocodeModel.findOne({promocodeId: id});
  }

  findOnebyQuery(query: QueryPromoDto) {
    return this.promocodeModel.findOne(query);
  }

  update(id: string, updatePromocodeDto: UpdatePromocodeDto) {
    return this.promocodeModel.updateOne(
      { _id: id },
      { $set: updatePromocodeDto },
    );
  }

  remove(id: string) {
    return this.promocodeModel.deleteOne({ id });
  }
}
