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

  @Post()
  @UseGuards(JwtCognitoAuthGuard, RolesGuard)
  @HasRoles(RoleType.HR, RoleType.DOCTOR)
  create(@Body() createAccountConfigDto: CreateAccountConfigDto, @Req() request) {
    createAccountConfigDto.userId = request.user.sub;
    console.log(createAccountConfigDto)
    return this.accountConfigService.create(createAccountConfigDto);
  }

  @Get()
  @UseGuards(JwtCognitoAuthGuard)
  findAll() {
    return this.accountConfigService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountConfigService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAccountConfigDto: UpdateAccountConfigDto) {
    return this.accountConfigService.update(+id, updateAccountConfigDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountConfigService.remove(+id);
  }
}
