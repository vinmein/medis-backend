import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import { User } from './user.model';
import { init } from '@paralleldrive/cuid2';
import { UserType } from 'shared/enum/user-type.enum';
import { UserStatus } from 'shared/enum/user-status.enum';
import { JobStatus } from 'shared/enum/job_status';
import { JobType } from 'shared/enum/job_type.enum';
import { JobPostType } from 'shared/enum/job_post_type.enum';
import { Duration } from 'shared/enum/duration.enum';

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

interface PostDuration extends Document {
  readonly hours: number;
  readonly duration: string;
}


interface WorkDuration extends Document {
  readonly hours: number;
  readonly duration: string;
}

interface Criticality extends Document {
  readonly isCritical: boolean;
  readonly message: string;
}

interface RequiredCredits extends Document {
  readonly forApply: number;
  readonly refund: number;
}

interface Salary extends Document {
  readonly amount: string;
  readonly currency: string;
  readonly period: string;
}

interface JobPost extends Document {
  readonly jobPostId: string;
  readonly title: string;
  readonly organisationId?: string;
  readonly description: string;
  readonly postType: string;
  readonly urgency: Criticality;
  readonly lastName: string;
  readonly postDuration: PostDuration;
  readonly workDuration: WorkDuration;
  readonly salary: Salary;
  readonly createdBy?: string;
  readonly status: string;
  readonly jobType: JobType;
  readonly requiredCredits: RequiredCredits;
}

type JobPostModel = Model<JobPost>;

const JobPostScheme = new Schema<JobPost>(
  {
    jobPostId: {
      type: String,
      required: true,
      default: () => createId()
    },
    createdBy: {
      type: String,
      required: true,
    },
    postType: {
      type: String,
      required: true,
      default: JobPostType.INDIVIDUAL,
    },
    organisationId: {
      type: String,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    urgency:{
      isCritical:{
        type: Boolean,
        default: false
      },
      message: {
        type: String,
      }
    },
    postDuration: {
      startDate: {
        type: Number,
        required: true,
      },
      endDate: {
        type: Number,
        required: true,
      },
    },
    workDuration: {
      hours: {
        type: Number,
        default: 9,
      },
      duration: {
        type: String,
        default: Duration.DAILY,
        enum: Duration
      },
      workStartDate: {
        type: Number,
        required: true,
      },
      workEndDate: {
        type: Number,
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
      period: {
        type: String,
        default: Duration.MONTHLY,
        enum: Duration
      },
    },
    jobType: {
      type: String,
      required: true,
      enum: JobType,
    },
    requiredCredits: {
      forApply:{
        type: Number,
        default: 3,
      },
      refund: {
        type: Number,
        default: 1,
      }
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
