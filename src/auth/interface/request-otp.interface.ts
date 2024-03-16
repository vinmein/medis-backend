import { Request } from 'express';

export interface RequestOtp extends Request {
  readonly email: string;
}
