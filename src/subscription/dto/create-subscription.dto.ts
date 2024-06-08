import { IsNotEmpty } from 'class-validator';

export class Cost {
    @IsNotEmpty()
    readonly amount: number;
    readonly currency: string;
    readonly paymentPeriod?: string;
}

export class Refund {
    readonly action?: string;
    @IsNotEmpty()
    readonly value: number;
    readonly metric?: string;
}

export class Rule {
    @IsNotEmpty()
    readonly maxJobPost: number;
    @IsNotEmpty()
    readonly maxApplication: number;
    readonly refund: Refund;
}

export class CreateSubscriptionDto {
  @IsNotEmpty()
  readonly packageCode: string;
  @IsNotEmpty()
  readonly packageName: string;
  readonly description?: string;
  @IsNotEmpty()
  readonly cost: Cost;
  @IsNotEmpty()
  readonly packageRule: Rule;
  createdBy: string;
  isPublic: boolean;
}
