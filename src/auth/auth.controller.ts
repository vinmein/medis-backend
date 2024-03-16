import { Body, Controller, HttpException, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { AuthenticatedRequest } from './interface/authenticated-request.interface';
import { RegisterRequest } from './interface/register-request.interface';
import { RequestOtp } from './interface/request-otp.interface';
import { VerifyRequest } from './interface/verify-request.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Req() req: AuthenticatedRequest, @Res() res: Response): Observable<Response> {
    return this.authService.login(req.user)
      .pipe(
        map(token => {
          return res
            .header('Authorization', 'Bearer ' + token.access_token)
            .json(token)
            .send()
        })
      );
  }

  @Post('register')
  async register(@Req() req: RegisterRequest, @Res() res: Response): Promise<Observable<Response>> {
    try{
    const response = await this.authService.register(req.body.email, req.body.attributes);
    return (response)
      .pipe(
        map(token => {
          return res
            .header('Authorization', 'Bearer ' + token.access_token)
            .json(token)
            .send()
        })
      );
    } catch(e){
      throw e;
    }
  }

  @Post('requestOtp')
  async requestOtp(@Req() req: RequestOtp, @Res() res: Response): Promise<Observable<Response>> {
    try{
    const response = await this.authService.requestOtp(req.body.email);
    console.log(response)
    return (response)
      .pipe(
        map(token => {
          return res
            .header('Authorization', 'Bearer ' + token.access_token)
            .json(token)
            .send()
        })
      );
    } catch(e){
      throw e;
    }
  }

  @Post('verifyOtp')
  async verifyOtp(@Body() req: VerifyRequest, @Res() res: Response): Promise<Observable<Response>> {
    try{
    const response = await this.authService.verifyOtp(req);
    console.log(response)
    return (response)
      .pipe(
        map(token => {
          return res
            .header('Authorization', 'Bearer ' + token.access_token)
            .json(token)
            .send()
        })
      );
    } catch(e){
      throw e;
    }
  }
}
