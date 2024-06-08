import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { JOB_APPLICATION_MODEL } from 'database/database.constants';
import { JobApplicationModel } from 'database/models/job_application.model';
import { ConfigService } from '@nestjs/config';
import { EMPTY, catchError, from, mergeMap, of, throwIfEmpty } from 'rxjs';
import { MongoServerError } from 'mongodb';

@Injectable()
export class ApplicationService {

  private jobApplication;
  constructor(
    @Inject(JOB_APPLICATION_MODEL) private jobApplicationModel: JobApplicationModel,
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

  create(createApplicationDto: CreateApplicationDto) {
    return from(this.jobApplicationModel.create({ ...createApplicationDto })).pipe(
      mergeMap((p) => (p ? of(p) : EMPTY)),
      catchError((err) => {
        if (err instanceof MongoServerError && err.code === 11000) {
          throw new ConflictException('You have already submitted for this post');
        }
        throw err;
      }),
      throwIfEmpty(() => new NotFoundException(`post:$id was not found`)),
    );
  }

  findAll() {
    return this.jobApplicationModel.find({});
  }

  findOne(id: string) {
    return `This action returns a #${id} jobpost`;
  }

  update(id: string, updateApplicationDto: UpdateApplicationDto) {
    return `This action updates a #${id} application`;
  }

  remove(id: string) {
    return `This action removes a #${id} application`;
  }

  aggregate(query, group) {
    return this.jobApplicationModel.aggregate([
      {
        $match: query,
      },
      {
        $group: group,
      },
    ]);
  }
}
