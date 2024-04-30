import { IsNotEmpty } from "class-validator";
import { JobStatus } from "shared/enum/job-status";
import { JobType } from "shared/enum/job-type.enum";

export class WorkDurationDto {
    @IsNotEmpty()
    readonly hours: number;

    @IsNotEmpty()
    readonly duration: string;
    
}

export class SalaryDto {
    @IsNotEmpty()
    readonly amount: string;

    readonly currency: string;

    readonly duration: string;  
}


export class CreateJobpostDto {
    createdBy: string;

    @IsNotEmpty()
    readonly title: string;

    @IsNotEmpty()
    readonly description: string;

    @IsNotEmpty()
    readonly startDate: number;

    @IsNotEmpty()
    readonly endDate: number;

    readonly workDuration?: WorkDurationDto;

    @IsNotEmpty()
    readonly salary: SalaryDto;

    readonly status: JobStatus;

    @IsNotEmpty()
    readonly jobType: JobType;

    readonly requiredCredits: number;
}
