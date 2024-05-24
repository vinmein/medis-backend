import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AccountConfigService } from './account-config.service';
import { CreateAccountConfigDto } from './dto/create-account-config.dto';
import { UpdateAccountConfigDto } from './dto/update-account-config.dto';
import { JwtAuthGuard } from 'auth/guard/jwt-auth.guard';
import { RolesGuard } from 'auth/guard/roles.guard';
import { HasRoles } from 'auth/guard/has-roles.decorator';
import { RoleType } from 'shared/enum/role-type.enum';
import { JwtCognitoAuthGuard } from 'auth/guard/jwt-cognito-auth.guard';

@Controller('account-config')
export class AccountConfigController {
  constructor(private readonly accountConfigService: AccountConfigService) {}

  @Get()
  @UseGuards(JwtCognitoAuthGuard, RolesGuard)
  @HasRoles(
    RoleType.ADMIN,
    RoleType.MODERATOR,
  )
  findAll() {
    return this.accountConfigService.findAll();
  }

  @Get(':userId')
  @UseGuards(JwtCognitoAuthGuard, RolesGuard)
  @HasRoles(
    RoleType.HR,
    RoleType.DOCTOR,
    RoleType.NURSE,
    RoleType.ORGADMIN,
    RoleType.ADMIN,
    RoleType.MODERATOR,
  )
  findOne(@Param('userId') id: string) {
    return this.accountConfigService.findOne(id);
  }

  @Patch(':userId')
  @UseGuards(JwtCognitoAuthGuard, RolesGuard)
  @HasRoles(
    RoleType.MODERATOR,
    RoleType.ADMIN,
  )
  update(@Param('userId') id: string, @Body() updateAccountConfigDto: UpdateAccountConfigDto) {
    return this.accountConfigService.update(id, updateAccountConfigDto);
  }

  @Delete(':userId')
  @UseGuards(JwtCognitoAuthGuard, RolesGuard)
  @HasRoles(
    RoleType.ADMIN,
    RoleType.MODERATOR,
  )
  remove(@Param('userId') id: string) {
    return this.accountConfigService.remove(+id);
  }
}
