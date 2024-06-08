import { PartialType } from '@nestjs/swagger';
import { CreateUserReviewDto } from './create-user-review.dto';
import { FileDto } from './file-dto';

export class UpdateUserReviewDto extends PartialType(CreateUserReviewDto) {
 
    readonly education: string;

    readonly yearOfPassedOut: string;

    readonly councilNumber: string;

    readonly documents: [FileDto];

}
