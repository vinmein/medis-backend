import { PartialType } from '@nestjs/swagger';
import { CreateUserReviewDto } from './create-user-review.dto';
import { Status } from 'shared/enum/status.enum';
import { CheckListDto } from './check-list.dto';
import { IsNotEmpty } from 'class-validator';
import { initialize } from 'passport';

export class UpdateReviewFeedbackDto extends PartialType(CreateUserReviewDto) {
 
    readonly feedback: string;

    readonly checkList: [CheckListDto];

    reviewedBy: string;

    @IsNotEmpty()
     status: Status;

    additionalCoins?: number;

}