import { Request } from 'express';
import { AttributePrincipal } from './attribute-principal.interface';

export interface RegisterRequest extends Request {
  readonly email: string;
  readonly attributes: AttributePrincipal;
  readonly group: string;
  readonly promoCode?: string;
}
