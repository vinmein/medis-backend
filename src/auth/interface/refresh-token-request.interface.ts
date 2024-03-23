import { Request } from 'express';

export interface RefreshTokenRequest extends Request {
  readonly refreshToken: string;
  readonly username: string;
}
