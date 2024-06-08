import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { JwtCognitoAuthGuard } from 'auth/guard/jwt-cognito-auth.guard';
import { RolesGuard } from 'auth/guard/roles.guard';
import { HasRoles } from 'auth/guard/has-roles.decorator';
import { RoleType } from 'shared/enum/role-type.enum';
import { SubscriptionGuard } from 'shared/guard/subscription.guard';
import { JobApplyGuard } from 'shared/guard/jobApply.guard';
import { ProfileGuard } from 'shared/guard/profile.guard';

@Controller('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  @UseGuards(JwtCognitoAuthGuard, RolesGuard, ProfileGuard, SubscriptionGuard, JobApplyGuard)
  @HasRoles(
    RoleType.DOCTOR,
    RoleType.NURSE,
  )
  create(@Body() createApplicationDto: CreateApplicationDto, @Req() request) {
    createApplicationDto.applicantId = request.user.sub;
    createApplicationDto.applicantName = `${request.profile.firstName} ${request.profile.lastName}`;
    return this.applicationService.create(createApplicationDto);
  }

  @Get()
  @UseGuards(JwtCognitoAuthGuard, RolesGuard, ProfileGuard, SubscriptionGuard, JobApplyGuard)
  @HasRoles(
    RoleType.MODERATOR,
    RoleType.ADMIN,
  )
  findAll() {
    return this.applicationService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtCognitoAuthGuard, RolesGuard, ProfileGuard, SubscriptionGuard, JobApplyGuard)
  @HasRoles(
    RoleType.HR,
    RoleType.DOCTOR,
    RoleType.NURSE,
    RoleType.ORGADMIN,
    RoleType.MODERATOR,
    RoleType.ADMIN,
  )
  findOne(@Param('id') id: string) {
    return this.applicationService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtCognitoAuthGuard, RolesGuard, ProfileGuard, SubscriptionGuard, JobApplyGuard)
  @HasRoles(
    RoleType.HR,
    RoleType.DOCTOR,
    RoleType.NURSE,
    RoleType.ORGADMIN,
    RoleType.MODERATOR,
    RoleType.ADMIN,
  )
  update(@Param('id') id: string, @Body() updateApplicationDto: UpdateApplicationDto) {
    return this.applicationService.update(id, updateApplicationDto);
  }

  @Delete(':id')
  @UseGuards(JwtCognitoAuthGuard, RolesGuard, ProfileGuard, SubscriptionGuard, JobApplyGuard)
  @HasRoles(
    RoleType.HR,
    RoleType.DOCTOR,
    RoleType.NURSE,
    RoleType.ORGADMIN,
    RoleType.MODERATOR,
    RoleType.ADMIN,
  )
  remove(@Param('id') id: string) {
    return this.applicationService.remove(id);
  }
}
