import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SUBSCRIPTION_PACKAGE_MODEL } from 'database/database.constants';
import { SubscriptionPackageModel } from 'database/models/subscription_package.model';
import {
  EMPTY,
  Observable,
  catchError,
  forkJoin,
  from,
  map,
  mergeMap,
  of,
  throwError,
  throwIfEmpty,
} from 'rxjs';
import { MongoServerError } from 'mongodb';
import { AccountConfigService } from 'account-config/account-config.service';
import { SubscriptionStatus } from 'shared/enum/subscription_status';
import { Duration } from 'shared/enum/duration.enum';

@Injectable()
export class SubscriptionService {
  constructor(
    private accountConfigService: AccountConfigService,
    @Inject(SUBSCRIPTION_PACKAGE_MODEL)
    private subscriptionPackageModel: SubscriptionPackageModel,
  ) {}

  create(createSubscriptionDto: CreateSubscriptionDto) {
    return from(
      this.subscriptionPackageModel.create({ ...createSubscriptionDto }),
    ).pipe(
      mergeMap((p) => (p ? of(p) : EMPTY)),
      catchError((err) => {
        console.log(err);
        if (err instanceof MongoServerError && err.code === 11000) {
          throw new ConflictException('Duplicate entry for createdBy field');
        }
        throw err;
      }),
      throwIfEmpty(() => new NotFoundException(`post:$id was not found`)),
    );
  }

  findAll() {
    return this.subscriptionPackageModel.find({});
  }

  findOne(packageId: string) {
    return from(this.subscriptionPackageModel.findOne({ packageId })).pipe(
      map((document) => {
        if (!document) {
          throw new NotFoundException(`${packageId} was not found`);
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
    return from(this.subscriptionPackageModel.findOne(query)).pipe(
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

  update(packageId: string, updateSubscriptionDto: UpdateSubscriptionDto) {
    return this.subscriptionPackageModel.updateOne(
      { packageId },
      { $set: UpdateSubscriptionDto }, // Use the actual data object here
      { new: true },
    );
  }

  remove(packageId: string) {
    return this.subscriptionPackageModel.deleteOne({ packageId });
  }

  toJSON = (packageData) => {
    const convert = (data) => ({
      _id: data._id.toString(), // Convert ObjectId to string
      ...data.toJSON(), // Assuming other methods exist to serialize SubscriptionPackage properties
    });

    if (Array.isArray(packageData)) {
      return packageData.map(convert);
    } else {
      return convert(packageData);
    }
  };

  verifySubscription(request, jobApplicationConfig){
    return from(
      this.accountConfigService.findOnebyQuery({ userId: request.user.sub }),
    ).pipe(
      mergeMap((accountConfig) => {
        if (!accountConfig) {
          throw new BadRequestException('config is not found');
        }
        return from(this.findAll()).pipe(
          map((packageData) => {
            if (!packageData) {
              throw new BadRequestException('package is not found');
            }
            return { ...accountConfig.toObject(), packageData: packageData };
          }),
        );
      }),
      map((response) => {
        const isSubscribed = response.isSubscribed || {};
        const status = isSubscribed['status'];
        const duration = isSubscribed['duration'];
        const packageData = this.toJSON(response.packageData);
        if (status == SubscriptionStatus.SUBSCRIBED && duration) {
          const started = isSubscribed['started'];
          const packageCode = isSubscribed['packageCode'];
          const filtredPackage = packageData.filter((value) => {
            return value.packageCode == packageCode;
          });
          let newEpochTime = started; // Default to started time
          const dayInMillis = 86400000;
          switch (duration) {
            case Duration.WEEKLY:
              newEpochTime += dayInMillis * 7; // Add 7 days for weekly duration
              break;
            case Duration.MONTHLY:
              newEpochTime += dayInMillis * 30; // Add 30 days for monthly duration
              break;
            case Duration.YEARLY:
              newEpochTime += dayInMillis * 365; // Add 365 days for yearly duration
              break;
          }
          if (Date.now() < newEpochTime) {
            request.isSubscribed = true;
            request.subscription = response;
            request.subscriptionPackage =
              filtredPackage.length > 0 ? filtredPackage[0] : [];
            return true;
          }
        } else {
          request.isSubscribed = false;
          request.subscription = response;
          return true;
        }
      }),
      catchError((err) => throwError(() => err)),
    );
  }

}
