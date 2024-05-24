import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProfessionDto } from './dto/create-profession.dto';
import { UpdateProfessionDto } from './dto/update-profession.dto';
import { ProfileService } from 'profile/profile.service';
import { PROFESSION_MODEL } from 'database/database.constants';
import { QualificationModel } from 'database/models/qualification.model';
import { OnEvent } from '@nestjs/event-emitter';
import { EMPTY, catchError, forkJoin, from, map, mergeMap, of, throwIfEmpty } from 'rxjs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserReviewService } from 'user-review/user-review.service';
import { MongoServerError } from 'mongodb';

@Injectable()
export class ProfessionService {
  
  constructor(
    private profileService: ProfileService,
    private userReviewService: UserReviewService,
    @Inject(PROFESSION_MODEL) private qualificationModel: QualificationModel,
    private readonly eventEmitter: EventEmitter2
  ) {} 

  publishEvent<T>(topic:string, data: T) {
    this.eventEmitter.emit(topic, data);
  }


  @OnEvent('USER_REVIEW.APPROVED')
  async handleEvent(payload: UserReviewEventDTO) {
    console.log('Event received:', payload);
    const observable1 = from(this.qualificationModel.findOne({userId: payload.createdBy}))
    const observable2 = from(this.userReviewService.findOnebyQuery({ requestId: payload.requestId }))
    forkJoin([observable1, observable2])
    .pipe(
      map((document) => {
        if (document.length<2) {
          throw new NotFoundException(`${payload.requestId} was not found`);
        }
        if(!document[0]){
          //create document 
         const payload = {
            userId:document[1].createdBy,
            education: document[1].education,
            yearOfPassedOut: document[1].yearOfPassedOut,
            council: document[1].council,
            councilNumber:  document[1].councilNumber,
            userType: document[1].userType,
            mobileNumber: document[1].mobileNumber,
          }
          this.qualificationModel.create(payload)
        }
        return document;
      }),
      throwIfEmpty(() => new NotFoundException(`No record found`)),
      catchError((err) => {
        console.error(err);
        throw err;
      })
    )
    .subscribe({
      next: (document) => {
        // Handle the document if needed
      },
      error: (err) => {
        // Handle the error if needed
      },
      complete: () => {
        console.log('Processing complete');
      },
    });
  }

  create(createProfessionDto: CreateProfessionDto) {
    return from(this.qualificationModel.create({ ...createProfessionDto })).pipe(
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


  findAll() {
    // const eventObj: UserReviewEventDTO ={ requestId:"yrpij9frih", createdBy:  "8786e399-67b7-4993-ab7b-600f17b6fd74" }
    // this.publishEvent('USER_REVIEW.APPROVED', eventObj)
    return this.qualificationModel.find();
  }

  findOne(id: number) {
    // return `This action returns a #${id} profession`;
    return this.qualificationModel.findById(id);
  }

  findByQuery(query: any) {
    return from(this.qualificationModel.findOne(query)).pipe(
      map((document) => {
        if (!document) {
          throw new NotFoundException(`Record was not found`);
        }
        console.log(document)
        return document;
      }),
      catchError((err) => {
        throw err;
      }),
      throwIfEmpty(() => new NotFoundException(`No record found`)),
    );
  }

  update(userId: string, updateProfessionDto: UpdateProfessionDto) {
    return from(
      this.qualificationModel.findOneAndUpdate(
        { userId },
        updateProfessionDto,
        {
          safe: false,
          upsert: false,
          new: true,
        },
      ),
    ).pipe(
      map((document) => {
        if (!document) {
          throw new BadRequestException(`Review:${userId} was not found`);
        }
        if (document.createdBy) {
          return document;
        } else {
          throw new BadRequestException('Record is not in submitted state');
        }
      }),
      catchError((err) => {
        throw err;
      }),
    );
  }

  remove(userId: string) {
    return this.qualificationModel.deleteOne({ userId });
  }
}
