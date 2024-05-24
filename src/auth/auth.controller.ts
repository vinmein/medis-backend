import {
  Body,
  Controller,
  Header,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { RegisterRequest } from './interface/register-request.interface';
import { RequestOtp } from './interface/request-otp.interface';
import { VerifyRequest } from './interface/verify-request.interface';
import { RefreshTokenRequest } from './interface/refresh-token-request.interface';
import { JwtCognitoAuthGuard } from './guard/jwt-cognito-auth.guard';
import { PromoGuard } from '../shared/guard/promoCode.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(PromoGuard)
  @Post('register')
  async register(
    @Body() body: RegisterRequest,
    @Req() req,
    @Res() res: Response,
  ): Promise<Observable<Response>> {
    try {
      const response = await this.authService.register(
        body.email,
        body.attributes,
        body.group,
        req.promoObj
      );
      return response.pipe(
        map((token) => {
          return res
            .header('Authorization', 'Bearer ' + token.access_token)
            .json(token)
            .send();
        }),
      );
    } catch (e) {
      throw e;
    }
  }

  @Post('requestOtp')
  async requestOtp(
    @Req() req: RequestOtp,
    @Res() res: Response,
  ): Promise<Observable<Response>> {
    try {
      const response = await this.authService.requestOtp(req.body.email);
      return response.pipe(
        map((token) => {
          return res
            .header('Authorization', 'Bearer ' + token.access_token)
            .json(token)
            .send();
        }),
      );
    } catch (e) {
      throw e;
    }
  }

  @Post('verifyOtp')
  async verifyOtp(
    @Body() req: VerifyRequest,
    @Res() res: Response,
  ): Promise<Observable<Response>> {
    try {
      const response = this.authService.verifyOtp(req);
      return response.pipe(
        map((token) => {
          return res.header('Content-Type', 'application/json').send(token);
        }),
      );
    } catch (e) {
      throw e;
    }
  }

  @Post('refreshToken')
  async refreshToken(
    @Body() req: RefreshTokenRequest,
    @Res() res: Response,
  ): Promise<Observable<Response>> {
    try {
      const response = await this.authService.refreshToken(
        req.username,
        req.refreshToken,
      );
      console.log(response);
      return response.pipe(
        map((token) => {
          return res.send(token);
        }),
      );
    } catch (e) {
      throw e;
    }
  }

  @UseGuards(JwtCognitoAuthGuard)
  @Post('logout')
  async logout(@Req() request: Request, @Res() res: Response): Promise<Observable<Response>> {
    try {
      const authHeader = request.headers['authorization'];
      if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
        const header = authHeader.split(' ')[1];
        const response = this.authService.logoutUser(header);
        return from(response).pipe(
          map((token) => {
            return res.send(token);
          }),
        );
      }
    } catch (e) {
      throw e;
    }
  }
}
