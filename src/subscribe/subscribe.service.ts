import { BadRequestException, HttpException, Inject, Injectable } from '@nestjs/common';
import { UpdateSubscribeDto } from './dto/update-subscribe.dto';
import { MAILCHIMP_CONNECTION } from 'mailchimp/mailchimp.constants';
import { EMPTY, catchError, from, mergeMap, of, throwIfEmpty } from 'rxjs';

@Injectable()
export class SubscribeService {
  constructor(
    @Inject(MAILCHIMP_CONNECTION) private readonly mailchimp: any,
  ) {}

  create(email: string) {
    const mailChimpInstance = this.mailchimp();
    return from(mailChimpInstance.subscribeUser(email)).pipe(
      mergeMap((p) => (p ? of(p) : EMPTY)),
      catchError((err) => {
        if (err instanceof HttpException) {
          throw new BadRequestException('Email already subscribed');
        }
        throw err;
      }),
      throwIfEmpty(() => new BadRequestException(`Failed to subscribe`)),
    );
  }

  findAll() {
    return `This action returns all subscribe`;
  }

  findOne(id: number) {
    return `This action returns a #${id} subscribe`;
  }

  update(id: number, updateSubscribeDto: UpdateSubscribeDto) {
    return `This action updates a #${id} subscribe`;
  }

  remove(id: number) {
    return `This action removes a #${id} subscribe`;
  }
}
