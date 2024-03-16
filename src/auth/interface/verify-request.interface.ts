import { Request } from 'express';

export interface VerifyRequest extends Request {
  readonly email: string;
  readonly otp: string;
  readonly session: string;
}
