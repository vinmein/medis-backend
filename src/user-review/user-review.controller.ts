import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { UserReviewService } from './user-review.service';
import { CreateUserReviewDto } from './dto/create-user-review.dto';
import { UpdateUserReviewDto } from './dto/update-user-review.dto';
import { JwtCognitoAuthGuard } from 'auth/guard/jwt-cognito-auth.guard';
import { RolesGuard } from 'auth/guard/roles.guard';
import { HasRoles } from 'auth/guard/has-roles.decorator';
import { RoleType } from 'shared/enum/role-type.enum';
import { UpdateReviewFeedbackDto } from './dto/update-review-feedback.dto';
import { UpdateInReviewDto } from './dto/update-in-review.dto';
import { query } from 'express';
import { GetUserReviewDto } from './dto/get-user-review.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';

@Controller('user-review')
export class UserReviewController {
  constructor(private readonly userReviewService: UserReviewService) {}

  @UseGuards(JwtCognitoAuthGuard, RolesGuard)
  @HasRoles(RoleType.HR, RoleType.DOCTOR, RoleType.NURSE)
  @Post()
  create(@Body() createUserReviewDto: CreateUserReviewDto, @Req() request) {
    try {
      createUserReviewDto.createdBy = request.user.sub;
      return this.userReviewService.create(createUserReviewDto);
    } catch (e) {
      throw e;
    }
  }

  @Get()
  @UseGuards(JwtCognitoAuthGuard, RolesGuard)
  @HasRoles(RoleType.ADMIN, RoleType.MODERATOR)
  findAll(@Query() reviewQueryDto: GetUserReviewDto) {
    return this.userReviewService.findAll(reviewQueryDto);
  }

  @Get(':requestId')
  @UseGuards(JwtCognitoAuthGuard, RolesGuard)
  @HasRoles(
    RoleType.HR,
    RoleType.DOCTOR,
    RoleType.NURSE,
    RoleType.SALES,
    RoleType.ADMIN,
    RoleType.MODERATOR,
  )
  findOne(@Param('requestId') id: string, @Query() query, @Req() request) {
    if(id == "me"){
      const payload = {
        ...query,
        createdBy: request.user.sub
      }
      return this.userReviewService.findOnebyQuery(payload);
    }
    const payload = {
      ...query,
      requestId: id
    }
    return this.userReviewService.findOnebyQuery(payload);
  }

  @Patch(':requestId')
  @UseGuards(JwtCognitoAuthGuard, RolesGuard)
  @HasRoles(RoleType.HR, RoleType.DOCTOR, RoleType.NURSE)
  update(
    @Param('requestId') id: string,
    @Body() updateUserReviewDto: UpdateUserReviewDto,
  ) {
    return this.userReviewService.update(id, updateUserReviewDto);
  }

  @Patch(':requestId/feedback')
  @UseGuards(JwtCognitoAuthGuard, RolesGuard)
  @HasRoles(RoleType.ADMIN, RoleType.MODERATOR)
  feedbackUser(
    @Param('requestId') id: string,
    @Body() updateReviewFeedbackDto: UpdateReviewFeedbackDto,
    @Req() request,
  ) {
    updateReviewFeedbackDto.reviewedBy = request.user.sub;
    return this.userReviewService.updateReview(id, updateReviewFeedbackDto);
  }

  @Patch(':requestId/review')
  @UseGuards(JwtCognitoAuthGuard, RolesGuard)
  @HasRoles(RoleType.ADMIN, RoleType.MODERATOR)
  inreviewUser(
    @Param('requestId') id: string,
    @Body() updateInReviewDto: UpdateInReviewDto,
    @Req() request,
  ) {
    updateInReviewDto.reviewedBy = request.user.sub;
    return this.userReviewService.inReview(id, updateInReviewDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userReviewService.remove(id);
  }
}
