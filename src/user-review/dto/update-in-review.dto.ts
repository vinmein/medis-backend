import { PartialType } from '@nestjs/swagger';
import { CreateUserReviewDto } from './create-user-review.dto';
import { Status } from 'shared/enum/status.enum';
import { CheckListDto } from './check-list.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateInReviewDto extends PartialType(CreateUserReviewDto) {

    @IsNotEmpty()
    readonly status: Status;

    reviewedBy: string;

}