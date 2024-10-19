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

interface JobApplication extends Document {
  readonly jobApplicationId: string;
  readonly applicantId: string;
  readonly jobPostId?: string;
  readonly applicantName?: string;
  readonly applicationSummary?: string;
  readonly status: string;
}

type JobApplicationModel = Model<JobApplication>;

const JobApplicationScheme = new Schema<JobApplication>(
  {
    jobApplicationId: {
      type: String,
      required: true,
      default: () => createId()
    },
    applicantId: {
      type: String,
      required: true,
    },
    jobPostId: {
      type: String,
      required: true,
    },
    applicantName: {
      type: String,
      required: true,
    },
    applicationSummary: {
      type: String,
    },
    status: {
      type: String,
      default: JobStatus.APPROVED,
      enum: JobStatus,
    },
  },
  { timestamps: true },
);

JobApplicationScheme.index({ applicantId: 1, jobPostId: 1 }, { unique: true });
JobApplicationScheme.index({ applicantId: 1 });
JobApplicationScheme.index({ jobPostId: 1 });

const createJobApplicationModel: (conn: Connection) => JobApplicationModel = (
  conn: Connection,
) =>
  conn.model<JobApplication>(
    'JobApplication',
    JobApplicationScheme,
    'jobApplication',
  );

export { JobApplication, JobApplicationModel, createJobApplicationModel };
