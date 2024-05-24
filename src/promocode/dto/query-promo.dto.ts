import { CreatePromocodeDto } from "./create-promocode.dto";
import { PartialType } from '@nestjs/swagger';

export class QueryPromoDto extends PartialType(CreatePromocodeDto) {
    promocodeId?: string;
    promocode?: string;
}