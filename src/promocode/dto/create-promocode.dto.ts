import { IsEmail, IsNotEmpty, MaxLength, MinLength } from "class-validator";
import { PromoCategory } from "shared/enum/promo_category.enum";
import { PromoCode } from "shared/enum/promocode.enum";
import { Status } from "shared/enum/status.enum";
import { Rule } from "./rule.dto";

export class CreatePromocodeDto {
    @IsNotEmpty()
    readonly promocode: string;

    readonly description?: string;

    @IsNotEmpty()
    readonly validFrom: number;

    readonly validTo?: number;

    readonly limit?: number;

    readonly numberOfUse?: number;

    @IsNotEmpty()
    readonly rule: Rule;
  
    @IsNotEmpty()
    readonly type: PromoCode;

    @IsNotEmpty()
    readonly category: PromoCategory;
  
    readonly status?: Status;
}
