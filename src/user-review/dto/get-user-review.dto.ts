import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class GetUserReviewDto {
    @IsOptional()
    status: string;

    @IsOptional()
    @Type(() => Number)
    @IsPositive()
    limit: number = 50;
  
    @IsOptional()
    @Type(() => Number)
    @Min(0)
    offset: number = 0;
}