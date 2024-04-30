import { CreateProfileDto } from "./create-profile.dto";
import { PartialType } from '@nestjs/swagger';

export class QueryProfileDto extends PartialType(CreateProfileDto) {
     userId: string;
}