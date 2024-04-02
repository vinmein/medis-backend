import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StorageService } from './storage.service';
import { CreateStorageDto } from './dto/create-storage.dto';
import { UpdateStorageDto } from './dto/update-storage.dto';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/file.interceptor';
import { MultiFileValidatorService } from 'shared/validator/multi-file-validator-service';
import { JwtCognitoAuthGuard } from 'auth/guard/jwt-cognito-auth.guard';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post()
  @UseGuards(JwtCognitoAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 500000 }),
          new MultiFileValidatorService({}),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() createStorageDto: CreateStorageDto,
    @Req() request,
  ) {
    try {
      const userId = request.user.sub;
      return this.storageService.create(
        createStorageDto,
        file.buffer,
        file.originalname,
        file.mimetype,
        userId,
      );
    } catch (e) {
      throw e;
    }
  }

  @Get()
  findAll() {
    return this.storageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storageService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStorageDto: UpdateStorageDto) {
    return this.storageService.update(+id, updateStorageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.storageService.remove(+id);
  }
}
