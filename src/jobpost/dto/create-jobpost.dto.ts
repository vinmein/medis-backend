import { IsNotEmpty } from "class-validator";
import { JobStatus } from "shared/enum/job_status";
import { JobType } from "shared/enum/job_type.enum";

export class WorkDurationDto {
    readonly hours?: number;

    readonly duration?: string;

    @IsNotEmpty()
    readonly workStartDate: number;

    readonly workEndDate?: number;
}

export class PostDurationDto {
    @IsNotEmpty()
    readonly startDate: number;

    @IsNotEmpty()
    readonly endDate: number;
}

export class SalaryDto {
    @IsNotEmpty()
    readonly amount: string;

    readonly currency: string;

    readonly duration: string;  
}


export class CriticalityDto {
    readonly isCritical: boolean;

    readonly message: string;
}

export class RequiredCreditsDto {
    readonly forApply: number;

    readonly refund: number;
}

export class CreateJobpostDto {
    createdBy: string;

    @IsNotEmpty()
    readonly title: string;

    @IsNotEmpty()
    readonly description: string;

    @IsNotEmpty()
    readonly postType: string;

    readonly organisationId?: string;
    
    readonly urgency?: CriticalityDto;

    @IsNotEmpty()
    readonly postDuration: PostDurationDto;

    readonly workDuration?: WorkDurationDto;

    @IsNotEmpty()
    readonly salary: SalaryDto;

    readonly status: string;

    @IsNotEmpty()
    readonly jobType: string;

    readonly requiredCredits: RequiredCreditsDto;
}

  
