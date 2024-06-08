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
} from '@nestjs/common';
import { JobpostService } from './jobpost.service';
import { CreateJobpostDto } from './dto/create-jobpost.dto';
import { UpdateJobpostDto } from './dto/update-jobpost.dto';
import { JwtCognitoAuthGuard } from 'auth/guard/jwt-cognito-auth.guard';
import { RolesGuard } from 'auth/guard/roles.guard';
import { HasRoles } from 'auth/guard/has-roles.decorator';
import { RoleType } from 'shared/enum/role-type.enum';
import { SubscriptionGuard } from 'shared/guard/subscription.guard';
import { JobPostGuard } from 'shared/guard/jobPost.guard';

@Controller('jobpost')
export class JobpostController {
  constructor(private readonly jobpostService: JobpostService) {}

  @UseGuards(JwtCognitoAuthGuard, RolesGuard, SubscriptionGuard, JobPostGuard)
  @HasRoles(
    RoleType.HR,
    RoleType.DOCTOR,
    RoleType.NURSE,
    RoleType.ORGADMIN,
    RoleType.MODERATOR,
    RoleType.ADMIN,
  )
  @Post()
  create(@Body() createJobpostDto: CreateJobpostDto, @Req() request) {
    try {
      createJobpostDto.createdBy = request.user.sub;
      console.log(request.isSubscribed)
      if(request.isSubscribed){
        return this.jobpostService.create(createJobpostDto);
      }

    } catch (e) {
      throw e;
    }
  }

  @UseGuards(JwtCognitoAuthGuard, RolesGuard)
  @HasRoles(
    RoleType.HR,
    RoleType.DOCTOR,
    RoleType.NURSE,
    RoleType.ADMIN,
    RoleType.ORGADMIN,
    RoleType.MODERATOR,
  )
  @Get()
  findAll() {
    return this.jobpostService.findAll();
  }

  @UseGuards(JwtCognitoAuthGuard, RolesGuard)
  @HasRoles(
    RoleType.HR,
    RoleType.DOCTOR,
    RoleType.NURSE,
    RoleType.ADMIN,
    RoleType.ORGADMIN,
    RoleType.MODERATOR,
  )
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobpostService.findOne(+id);
  }

  @UseGuards(JwtCognitoAuthGuard, RolesGuard)
  @HasRoles(
    RoleType.HR,
    RoleType.DOCTOR,
    RoleType.NURSE,
    RoleType.ADMIN,
    RoleType.ORGADMIN,
    RoleType.MODERATOR,
  )
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJobpostDto: UpdateJobpostDto) {
    return this.jobpostService.update(+id, updateJobpostDto);
  }

  @UseGuards(JwtCognitoAuthGuard, RolesGuard)
  @HasRoles(RoleType.HR, RoleType.DOCTOR, RoleType.NURSE, RoleType.ORGADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobpostService.remove(+id);
  }
}
