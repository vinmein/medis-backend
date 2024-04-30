import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import { User } from './user.model';
import { init } from '@paralleldrive/cuid2';
import { UserType } from 'shared/enum/user-type.enum';
import { UserStatus } from 'shared/enum/user-status.enum';
import { JobStatus } from 'shared/enum/job-status';
import { JobType } from 'shared/enum/job-type.enum';

const createId = init({
  // A custom random function with the same API as Math.random.
  // You can use this to pass a cryptographically secure random function.
  random: Math.random,
  // the length of the id
  length: 10,
  // A custom fingerprint for the host environment. This is used to help
  // prevent collisions when generating ids in a distributed system.
  fingerprint: 'medic-app',
});

interface WorkDuration extends Document {
  readonly hours: number;
  readonly duration: string;
}

interface Salary extends Document {
  readonly amount: string;
  readonly currency: string;
  readonly duration: string;
}

interface JobPost extends Document {
  readonly jobPostId: string;
  readonly title: string;
  readonly description: string;
  readonly lastName: string;
  readonly startDate: number;
  readonly endDate: number;
  readonly workDuration: WorkDuration;
  readonly salary: Salary;
  readonly createdBy?: string;
  readonly status: JobStatus;
  readonly jobType: JobType;
  readonly requiredCredits: number;
}

type JobPostModel = Model<JobPost>;

const JobPostScheme = new Schema<JobPost>(
  {
    jobPostId: {
      type: String,
      required: true,
      default: createId(),
    },
    createdBy: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    startDate: {
      type: Number,
      required: true,
    },
    endDate: {
      type: Number,
      required: true,
    },
    workDuration: {
      hours: {
        type: Number,
        default: 9,
      },
      duration: {
        type: String,
        default: 'DAY',
      },
    },
    salary: {
      amount: {
        type: String,
        required: true,
      },
      currency: {
        type: String,
        default: 'INR',
      },
      duration: {
        type: String,
        default: 'DAY',
      },
    },
    jobType: {
      type: String,
      required: true,
      enum: JobType,
    },
    requiredCredits:{
        type: Number,
        default: 1,
    },
    status: {
      type: String,
      default: JobStatus.PENDING,
      enum: JobStatus,
    },
  },
  { timestamps: true },
);

const createJobPostModel: (conn: Connection) => JobPostModel = (
  conn: Connection,
) => conn.model<JobPost>('JobPosts', JobPostScheme, 'jobposts');

export { JobPost, JobPostModel, createJobPostModel };
