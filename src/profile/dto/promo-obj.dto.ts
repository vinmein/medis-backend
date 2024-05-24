import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { Rule } from 'promocode/dto/rule.dto';

export class PromoObjDto {
   rule: Rule;
   promocodeId: string;
   promocode: string;
}
