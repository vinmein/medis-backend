import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { CognitoJwtVerifier } from 'aws-jwt-verify'; // Import the token verification function
import { ConfigService } from '@nestjs/config'; // Import the configuration service

@Injectable()
export class JwtCognitoAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractJwtFromRequest(request);

    if (!token) {
      return false;
    }

    try {
      const cognito = this.configService.get('amplify');
      const verifier = CognitoJwtVerifier.create({
        userPoolId: cognito.userPoolId,
        tokenUse: 'access',
        clientId: cognito.clientId,
      });
      const response = await verifier.verify(
        token, // the JWT as string
      );
      request.user = response;
      return true;
    } catch (error) {
      // console.error('Token validation error:', error);
      return false;
    }
  }

  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    console.log(err)
    return user;
  }

  private extractJwtFromRequest(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
      return authHeader.split(' ')[1];
    }
    return null;
  }
}
