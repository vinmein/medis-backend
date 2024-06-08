import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ProfessionService } from './profession.service';
import { CreateProfessionDto } from './dto/create-profession.dto';
import { UpdateProfessionDto } from './dto/update-profession.dto';
import { JwtCognitoAuthGuard } from 'auth/guard/jwt-cognito-auth.guard';
import { RolesGuard } from 'auth/guard/roles.guard';
import { HasRoles } from 'auth/guard/has-roles.decorator';
import { RoleType } from 'shared/enum/role-type.enum';
import { UserType } from 'shared/enum/user-type.enum';

@Controller('profession')
export class ProfessionController {
  private readonly logger = new Logger("Profession");
  constructor(
    private readonly professionService: ProfessionService,
  ) {}

  @Post()
  @UseGuards(JwtCognitoAuthGuard, RolesGuard)
  @HasRoles(RoleType.ADMIN, RoleType.MODERATOR)
  create(@Body() createProfessionDto: CreateProfessionDto, @Req() request) {
    this.logger.log(request.user.sub)
    createProfessionDto.userId = request.user.sub;
    if(request.user["cognito:groups"].indexOf(UserType.ADMIN)>-1){
      createProfessionDto.userType = UserType.ADMIN;
    }
    if(request.user["cognito:groups"].indexOf(UserType.MODERATOR)>-1){
      createProfessionDto.userType = UserType.MODERATOR;
    }
    return this.professionService.create(createProfessionDto);
  }

  @Get()
  @UseGuards(JwtCognitoAuthGuard, RolesGuard)
  @HasRoles(RoleType.ADMIN, RoleType.MODERATOR)
  findAll() {
    return this.professionService.findAll();
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
      return this.professionService.findByQuery(payload);
    }
    const payload = {
      ...query,
      userId: id,
    };
    return this.professionService.findByQuery(payload);
  }

  @Patch(':userId')
  @UseGuards(JwtCognitoAuthGuard, RolesGuard)
  @HasRoles(
    RoleType.ADMIN,
    RoleType.MODERATOR,
  )
  update(
    @Param('userId') id: string,
    @Body() updateProfessionDto: UpdateProfessionDto,
  ) {
    return this.professionService.update(id, updateProfessionDto);
  }

  @Delete(':userId')
  @UseGuards(JwtCognitoAuthGuard, RolesGuard)
  @HasRoles(
    RoleType.ADMIN,
    RoleType.MODERATOR,
  )
  remove(@Param('userId') id: string) {
    return this.professionService.remove(id);
  }
}
