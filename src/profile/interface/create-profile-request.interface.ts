import { Request } from 'express';

export interface CreateProfileRequest {
  readonly userId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly emailId: string;
  readonly role: Array<string>;
  readonly type: string;
  readonly userConfirmed: boolean;
}