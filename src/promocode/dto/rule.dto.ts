import { PromoAction } from "shared/enum/promo_action.enum";

export interface Rule {
    readonly action: PromoAction,
    readonly duration: number,
    readonly discount: number,
  }
