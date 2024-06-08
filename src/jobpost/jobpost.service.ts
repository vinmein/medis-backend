import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateJobpostDto } from './dto/create-jobpost.dto';
import { UpdateJobpostDto } from './dto/update-jobpost.dto';
import { JOB_POST_MODEL } from 'database/database.constants';
import { JobPostModel } from 'database/models/job_post.model';
import { MongoServerError } from 'mongodb';
import { EMPTY, catchError, from, map, mergeMap, of, throwIfEmpty } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JobpostService {
  private jobApplication;
  constructor(
    @Inject(JOB_POST_MODEL) private jobPostModel: JobPostModel,
    private configService: ConfigService,
  ) {
    this.jobApplication = this.configService.get('application.jobApplication');
  }

  getStartandEnd() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Convert dates to epoch time in milliseconds
    const firstDayEpochMillis = firstDayOfMonth;
    const lastDayEpochMillis = lastDayOfMonth;

    return { firstDayEpochMillis, lastDayEpochMillis };
  }

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
    return this.jobPostModel.find({});
  }

  findOne(id: number) {
    return `This action returns a #${id} jobpost`;
  }

  findbyQuery(query) {
    return from(this.jobPostModel.find(query)).pipe(
      map((document) => {
        if (!document) {
          throw new NotFoundException(`Record was not found`);
        }
        return document;
      }),
      catchError((err) => {
        throw err;
      }),
      throwIfEmpty(() => new NotFoundException(`No record found`)),
    );
  }

  update(id: number, updateJobpostDto: UpdateJobpostDto) {
    return `This action updates a #${id} jobpost`;
  }

  remove(id: number) {
    return `This action removes a #${id} jobpost`;
  }

  aggregate(query, group) {
    return this.jobPostModel.aggregate([
      {
        $match: query,
      },
      {
        $group: group,
      },
    ]);
  }
}
