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
import { ProfileService } from './profile.service';
import { HasRoles } from 'auth/guard/has-roles.decorator';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtCognitoAuthGuard } from 'auth/guard/jwt-cognito-auth.guard';
import { RolesGuard } from 'auth/guard/roles.guard';
import { RoleType } from 'shared/enum/role-type.enum';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @UseGuards(JwtCognitoAuthGuard, RolesGuard)
  @HasRoles(RoleType.ADMIN, RoleType.MODERATOR)
  findAll() {
    return this.profileService.findAll();
  }

  @Get(':userId')
  @UseGuards(JwtCognitoAuthGuard, RolesGuard)
  @HasRoles(
    RoleType.HR,
    RoleType.DOCTOR,
    RoleType.NURSE,
    RoleType.SALES,
    RoleType.ADMIN,
    RoleType.MODERATOR,
  )
  findOne(@Param('userId') id: string, @Query() query, @Req() request) {
    if (id == 'me') {
      const payload = {
        ...query,
        userId: request.user.sub,
      };
      return this.profileService.findOnebyQuery(payload);
    }
    const payload = {
      ...query,
      userId: id,
    };
    return this.profileService.findOnebyQuery(payload);
  }

  @Patch(':userId')
  @UseGuards(JwtCognitoAuthGuard, RolesGuard)
  @HasRoles(
    RoleType.HR,
    RoleType.DOCTOR,
    RoleType.NURSE,
    RoleType.SALES,
    RoleType.ADMIN,
    RoleType.MODERATOR,
  )
  update(
    @Param('userId') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
    @Req() request
  ) {
    if(id=="me"){
      const query = {
        userId: request.user.sub,
      };
      return this.profileService.updateByQuery(query, updateProfileDto);
    }

  }

  @Delete(':userId')
  @UseGuards(JwtCognitoAuthGuard, RolesGuard)
  @HasRoles(RoleType.ADMIN, RoleType.MODERATOR)
  remove(@Param('userId') id: string) {
    return this.profileService.removebyQuery({ userId: id });
  }
}
