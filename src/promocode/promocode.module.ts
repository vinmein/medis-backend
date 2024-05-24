import { Module } from '@nestjs/common';
import { PromocodeService } from './promocode.service';
import { PromocodeController } from './promocode.controller';
import { DatabaseModule } from 'database/database.module';

@Module({
  imports:[DatabaseModule],
  controllers: [PromocodeController],
  providers: [PromocodeService],
  exports:[PromocodeService]
})
export class PromocodeModule {}
