import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateJobpostDto } from './dto/create-jobpost.dto';
import { UpdateJobpostDto } from './dto/update-jobpost.dto';
import { JOB_POST_MODEL } from 'database/database.constants';
import { JobPostModel } from 'database/models/job-post.model';
import { MongoServerError } from 'mongodb';
import { EMPTY, catchError, from, mergeMap, of, throwIfEmpty } from 'rxjs';

@Injectable()
export class JobpostService {

  constructor(
    @Inject(JOB_POST_MODEL) private jobPostModel: JobPostModel
    ){}

  create(createJobpostDto: CreateJobpostDto) {
    return from(this.jobPostModel.create({ ...createJobpostDto })).pipe(
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
    return `This action returns all jobpost`;
  }

  findOne(id: number) {
    return `This action returns a #${id} jobpost`;
  }

  update(id: number, updateJobpostDto: UpdateJobpostDto) {
    return `This action updates a #${id} jobpost`;
  }

  remove(id: number) {
    return `This action removes a #${id} jobpost`;
  }
}
