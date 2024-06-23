import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserReviewDto } from './dto/create-user-review.dto';
import { UpdateUserReviewDto } from './dto/update-user-review.dto';
import { UserReviewModel } from 'database/models/review.model';
import {
  DEFAULT_CREDITS,
  USER_REVIEW_CONFIG_MODEL,
} from 'database/database.constants';
import { EMPTY, from, Observable, of, throwError } from 'rxjs';
import { catchError, map, mergeMap, throwIfEmpty } from 'rxjs/operators';
import { MongoServerError } from 'mongodb';
import { UpdateReviewFeedbackDto } from './dto/update-review-feedback.dto';
import { ProfileService } from 'profile/profile.service';
import { Status } from 'shared/enum/status.enum';
import { UpdateInReviewDto } from './dto/update-in-review.dto';
import { QueryProfileDto } from 'profile/dto/query-profile.dto';
import { UpdateProfileDto } from 'profile/dto/update-profile.dto';
import { UserStatus } from 'shared/enum/user-status.enum';
import { AccountConfigService } from 'account-config/account-config.service';
import { CreateAccountConfigDto } from 'account-config/dto/create-account-config.dto';
import { UserType } from 'shared/enum/user-type.enum';
import { SubscriptionStatus } from 'shared/enum/subscription_status';
import { SubscriptionDto } from 'account-config/dto/subscription.dto';
import { CreditsDTO } from 'account-config/dto/credits.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GetUserReviewDto } from './dto/get-user-review.dto';
const _ = require('lodash');

@Injectable()
export class UserReviewService {
  constructor(
    private profileService: ProfileService,
    private accountConfigService: AccountConfigService,
    @Inject(USER_REVIEW_CONFIG_MODEL) private userReviewModel: UserReviewModel,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  publishEvent<T>(topic: string, data: T) {
    this.eventEmitter.emit(topic, data);
  }

  create(createUserReviewDto: CreateUserReviewDto) {
    return from(this.userReviewModel.create({ ...createUserReviewDto })).pipe(
      mergeMap((p) => (p ? of(p) : EMPTY)),
      catchError((err) => {
        if (err instanceof MongoServerError && err.code === 11000) {
          throw new ConflictException('Duplicate entry for createdBy field');
        }
        throw err;
      }),
      throwIfEmpty(() => new NotFoundException(`post:$id was not found`)),
    );
  }

  findAll(reviewQueryDto: GetUserReviewDto) {
    let query = {};
    if (reviewQueryDto.status) {
      query = { status: { $in: reviewQueryDto.status.split(',') } };
    }
    return from(this.userReviewModel.find(query)).pipe(
      mergeMap((document) => {
        if (!document) {
          throw new BadRequestException(`Failed to fetch applications`);
        }
        const users = _.map(document, 'createdBy');
        return from(
          this.profileService.findOnebyAnyQuery({ userId: { $in: users } }),
        ).pipe(
          map((user) => {
            if (!user) {
              throw new NotFoundException(`users was not found`);
            }
            const documentsByKey = _.keyBy(document, 'createdBy');
            const mergedArray = _.compact(
              _.map(user, (user) => {
                if (documentsByKey[user.userId]) {
                  return {...documentsByKey[user.userId].toObject(), user}
                }
              }),
            );
            return mergedArray;
          }),
        );
      }),
      catchError((err) => {
        throw err;
      }),
    );
  }

  findOne(requestId: string) {
    return from(this.userReviewModel.findOne({ requestId })).pipe(
      map((document) => {
        if (!document) {
          throw new NotFoundException(`${requestId} was not found`);
        }
        return document;
      }),
      catchError((err) => {
        throw err;
      }),
      throwIfEmpty(() => new NotFoundException(`No record found`)),
    );
  }

  findOnebyQuery(query) {
    return from(this.userReviewModel.findOne(query)).pipe(
      map((document) => {
        if (!document) {
          throw new NotFoundException(`Record was not found`);
        }
        return document;
      }),
      catchError((err) => {
        throw err;
      }),
      throwIfEmpty(() => new NotFoundException(`No record found`)),
    );
  }

  findOneByUserId(userId: string) {
    return from(this.userReviewModel.findOne({ userId })).pipe(
      map((document) => {
        if (!document) {
          throw new NotFoundException(`record was not found`);
        }
        return document;
      }),
    );
  }

  update(requestId: string, updateUserReviewDto: UpdateUserReviewDto) {
    return from(
      this.userReviewModel.findOneAndUpdate(
        { requestId },
        updateUserReviewDto,
        {
          safe: false,
          upsert: false,
          new: true,
        },
      ),
    ).pipe(
      mergeMap((document) => {
        if (!document) {
          throw new BadRequestException(`Review:${requestId} was not found`);
        }
        if (document.createdBy) {
          return from(
            this.profileService.updateByQuery(
              { userId: document.createdBy },
              {
                status: UserStatus.REVIEW_SUBMITTED,
                reviewRequestId: document.requestId,
              },
            ),
          ).pipe(
            map((document) => {
              if (
                document &&
                'modifiedCount' in document &&
                document.modifiedCount > 0
              ) {
                return { message: 'Status updated succcessfully' };
              }
              throw new BadRequestException('User not found');
            }),
          );
        } else {
          throw new BadRequestException('Record is not in submitted state');
        }
      }),
      catchError((err) => {
        if (err instanceof MongoServerError && err.code === 11000) {
          throw new ConflictException('Duplicate entry for createdBy field');
        }
        throw err;
      }),
    );
  }

  inReview(requestId: string, updateInReviewDto: UpdateInReviewDto) {
    return from(this.userReviewModel.findOne({ requestId })).pipe(
      mergeMap((document) => {
        if (!document) {
          throw new NotFoundException(`Post:${requestId} was not found`);
        }
        if (document.status === Status.SUBMITTED) {
          const userId = document.createdBy;
          return from(
            this.userReviewModel.updateOne({ requestId }, updateInReviewDto),
          ).pipe(
            map((document) => {
              if (
                document &&
                'modifiedCount' in document &&
                document.modifiedCount > 0
              ) {
                return { userId };
              }
              throw new BadRequestException('Request not found');
            }),
          );
        } else {
          throw new BadRequestException('Record is not in submitted state');
        }
      }),
      mergeMap((update) => {
        return from(
          this.profileService.updateByQuery(
            { userId: update.userId },
            {
              status: UserStatus.IN_REVIEW,
            },
          ),
        ).pipe(
          map(() => {
            return { message: 'Status updated succcessfully' };
          }),
        );
      }),
      catchError((err) => {
        if (err instanceof MongoServerError && err.code === 11000) {
          throw new ConflictException('Duplicate entry for createdBy field');
        }
        throw err;
      }),
    );
  }

  updateReview(
    requestId: string,
    updateReviewFeedbackDto: UpdateReviewFeedbackDto,
  ) {
    this.eventEmitter.emit('USER_REVIEW.APPROVED', { data: 'hi' });
    return from(this.userReviewModel.findOne({ requestId })).pipe(
      mergeMap((request) => {
        if (!request) {
          throw new NotFoundException(`Post:${requestId} was not found`);
        }
        if (request.status === Status.PENDING) {
          const queryProfileDto = new QueryProfileDto();
          queryProfileDto.userId = request.createdBy;
          return from(this.profileService.findOnebyQuery(queryProfileDto)).pipe(
            map((user) => {
              if (!user) {
                throw new NotFoundException(`user was not found`);
              }
              // Combine the 'document' and 'request' into a single object
              return { user, request };
            }),
          );
        } else {
          throw new BadRequestException('Record not found');
        }
      }),
      mergeMap((response) => {
        if (updateReviewFeedbackDto.status === 'APPROVED') {
          const currentUserStatus = response.user.status;
          const updateProfileDto = new UpdateProfileDto();
          updateProfileDto.status = UserStatus.VERIFIEDUSER;
          updateProfileDto.mobileNumber = response.request.mobileNumber;
          const queryProfileDto = new QueryProfileDto();
          queryProfileDto.userId = response.user.userId;
          this.profileService.updateByQuery(queryProfileDto, updateProfileDto);
          if (
            currentUserStatus == UserStatus.NEWUSER &&
            [UserType.DOCTOR, UserType.HR, UserType.NURSE].indexOf(
              response.user.type,
            ) > -1
          ) {
            const createConfigDto = new CreateAccountConfigDto();
            createConfigDto.userId = response.user.userId;
            const subscriptionDto = new SubscriptionDto();
            subscriptionDto.status = SubscriptionStatus.NOTSUBSCRIBED;
            createConfigDto.isSubscribed = subscriptionDto;

            const creditsDTO = new CreditsDTO();
            creditsDTO.available = DEFAULT_CREDITS;
            if (updateReviewFeedbackDto.additionalCoins) {
              creditsDTO.available =
                creditsDTO.available + updateReviewFeedbackDto.additionalCoins;
            }
            createConfigDto.credits = creditsDTO;
            this.accountConfigService.create(createConfigDto);
          }
        }

        const eventObj: UserReviewEventDTO = {
          requestId,
          createdBy: response.user.userId,
        };
        this.publishEvent('USER_REVIEW.APPROVED', eventObj);

        return from(
          this.userReviewModel.updateOne(
            { requestId, createdBy: response.user.userId },
            updateReviewFeedbackDto,
          ),
        ).pipe(
          map((document) => {
            if (!document) {
              throw new NotFoundException(`Failed to update the status`);
            }
            // Combine the 'document' and 'request' into a single object
            return { message: 'successfully updated the feedback' };
          }),
        );
      }),
      catchError((err) => {
        if (err instanceof MongoServerError && err.code === 11000) {
          throw new ConflictException('Duplicate entry for createdBy field');
        }
        // Re-throw the error if it's not a duplicate key error
        throw err;
      }),
    );
  }

  remove(id: string) {
    return this.userReviewModel.deleteOne({ id });
  }
}
