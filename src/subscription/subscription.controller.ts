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
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { JwtCognitoAuthGuard } from 'auth/guard/jwt-cognito-auth.guard';
import { RolesGuard } from 'auth/guard/roles.guard';
import { HasRoles } from 'auth/guard/has-roles.decorator';
import { RoleType } from 'shared/enum/role-type.enum';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  @UseGuards(JwtCognitoAuthGuard, RolesGuard)
  @HasRoles(RoleType.ADMIN, RoleType.MODERATOR)
  create(@Body() createSubscriptionDto: CreateSubscriptionDto, @Req() request) {
    try {
      createSubscriptionDto.createdBy = request.user.sub;
      return this.subscriptionService.create(createSubscriptionDto);
    } catch (e) {
      throw e;
    }
  }

  @Get()
  findAll() {
    return this.subscriptionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subscriptionService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionService.update(id, updateSubscriptionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subscriptionService.remove(id);
  }
}
