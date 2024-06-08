import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EMPTY, from, Observable, of } from 'rxjs';
import { mergeMap, map, throwIfEmpty, catchError } from 'rxjs/operators';
import { AccessToken } from './interface/access-token.interface';
import { JwtPayload } from './interface/jwt-payload.interface';
import { UserPrincipal } from './interface/user-principal.interface';
import { AMPLIFY_CONNECTION, USER } from 'cognito/cognito.constants';
import { AttributePrincipal } from './interface/attribute-principal.interface';
import { VerifyRequest } from './interface/verify-request.interface';
import { ProfileService } from 'profile/profile.service';
import { PromocodeService } from 'promocode/promocode.service';
import { CreateProfileRequest } from 'profile/interface/create-profile-request.interface';
import { CreateProfileDto } from 'profile/dto/create-profile.dto';
import { CognitoUserSession } from 'amazon-cognito-identity-js';
import { MongoServerError } from 'mongodb';
import { jwtDecode } from 'jwt-decode';
import { RespondToAuthChallengeResponse } from 'aws-sdk/clients/cognitoidentityserviceprovider';
import { RoleType } from 'shared/enum/role-type.enum';
import { UserStatus } from 'shared/enum/user-status.enum';
import { AccountConfigService } from 'account-config/account-config.service';
import { CreateAccountConfigDto } from 'account-config/dto/create-account-config.dto';
import { SubscriptionStatus } from 'shared/enum/subscription_status';
import { Duration } from 'shared/enum/duration.enum';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private profileService: ProfileService,
    private accountConfig: AccountConfigService,
    private promoCodeService: PromocodeService,
    @Inject(AMPLIFY_CONNECTION) private readonly amplify: any,
  ) {}

  // If `LocalStrateg#validateUser` return a `Observable`, the `request.user` is
  // bound to a `Observable<UserPrincipal>`, not a `UserPrincipal`.
  //
  // I would like use the current `Promise` for this case, thus it will get
  // a `UserPrincipal` here directly.
  //
  login(user: UserPrincipal): Observable<AccessToken> {
    //console.log(user);
    const payload: JwtPayload = {
      upn: user.username, //upn is defined in Microprofile JWT spec, a human readable principal name.
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };
    return from(this.jwtService.signAsync(payload)).pipe(
      map((access_token) => {
        return { access_token };
      }),
    );
  }

  register(
    email: string,
    attributes: AttributePrincipal,
    group: string,
    promoObj?: any,
  ): Observable<any> {
    const amplifyInstance = this.amplify();
    return from(amplifyInstance.registerUser(email, attributes, group)).pipe(
      mergeMap((response: CognitoUser) => {
        const payload: CreateProfileDto = {
          userId: response.UserSub,
          firstName: attributes.given_name,
          lastName: attributes.family_name,
          emailId: email,
          role: [group, USER],
          type: group,
          dob: '',
          mobileNumber: '',
          promoObj: promoObj,
        };
        const accountConfigPayload: CreateAccountConfigDto = {
          userId: response.UserSub,
          isSubscribed:{
            status: SubscriptionStatus.NOTSUBSCRIBED
          },
          credits: {
            defaultValue: 30,
            duration: Duration.MONTHLY,
            available: 30,
          }
        }
        this.accountConfig.create(accountConfigPayload)
        return from(this.profileService.create(payload)).pipe(
          map((user) => {
            if (!user) {
              throw new BadRequestException(`Failed to create user profile`);
            }
            return { ...response };
          }),
        );
      }),
      catchError((err) => {
        if (err instanceof MongoServerError && err.code === 11000) {
          throw new ConflictException('Duplicate entry for createdBy field');
        }
        // Re-throw the error if it's not a duplicate key error
        throw err;
      }),
    );
  }

  requestOtp(email: string): Observable<any> {
    const amplifyInstance = this.amplify();
    try {
      const response = amplifyInstance.requestOtp(email);
      return from(response).pipe(
        map((response) => {
          return response;
        }),
      );
    } catch (e) {
      console.log(e);
    }
  }

  verifyOtp(payload: VerifyRequest): Observable<any> {
    const amplifyInstance = this.amplify();
    const response = amplifyInstance.verifyOtp(payload);

    return from(response).pipe(
      mergeMap((response: RespondToAuthChallengeResponse) => {
        if (!response.AuthenticationResult) {
          throw new ForbiddenException('Authentication failed');
        }

        const accessToken = response.AuthenticationResult.AccessToken;
        const accessTokenData = jwtDecode(accessToken);

        return from(
          this.profileService.findOnebyUserId(accessTokenData.sub),
        ).pipe(
          mergeMap((user) => {
            if (user) {
              return of({ status: 'SUCCESS', profile: user.toObject() });
            } else {
              if (this.isAdmin(accessTokenData['cognito:groups'])) {
                return of(this.createResponse(response, RoleType.ADMIN));
              } else if (this.isModerator(accessTokenData['cognito:groups'])) {
                return of(this.createResponse(response, RoleType.MODERATOR));
              } else {
                throw new BadRequestException(`Failed to get user profile`);
              }
            }
          }),
          mergeMap((user) => {
            if (user.status === 'SUCCESS') {
              const profile = 'profile' in user ? user.profile : {};
              return of({ ...response.AuthenticationResult, ...profile });
            }
            const authResult = 'authResult' in user ? user.authResult : {};
            const idTokenData = jwtDecode(authResult.IdToken);
            const type = 'type' in user? user.type: RoleType.ADMIN;
            const createProfilePayload: CreateProfileDto =
              this.createProfilePayload(idTokenData, type);

            return from(this.profileService.create(createProfilePayload)).pipe(
              map((profile) => {
                if (!profile) {
                  throw new BadRequestException(
                    `Failed to create user profile`,
                  );
                }
                return { ...authResult, ...profile.toObject() };
              }),
              catchError((err) => {
                throw err;
              }),
            );
          }),
          catchError((err) => {
            throw err;
          }),
        );
      }),
      catchError((err) => {
        throw err;
      }),
    );
  }

  refreshToken(username: string, token: string): Observable<any> {
    const amplifyInstance = this.amplify();
    const response = amplifyInstance.refreshToken(username, token);
    return from(response).pipe(
      map((response) => {
        if (!response) {
          throw new BadRequestException(`Token not found`);
        }
        if (response instanceof CognitoUserSession) {
          const sessionData = {
            AccessToken: response.getAccessToken().getJwtToken(),
            IdToken: response.getIdToken().getJwtToken(),
            RefreshToken: response.getRefreshToken().getToken(), // Be cautious with the refresh token
            ExpiresIn: '',
            TokenType: 'Bearer',
          };
          return {
            ChallengeParameters: {},
            AuthenticationResult: sessionData,
          };
        }
      }),
      catchError((err) => {
        throw err;
      }),
      throwIfEmpty(() => new NotFoundException(`post:$id was not found`)),
    );
  }

  logoutUser(token: string): Observable<any> {
    const amplifyInstance = this.amplify();
    return from(amplifyInstance.logout(token)).pipe(
      map(() => {
        return { message: 'logout successfully' };
      }),
      catchError((err) => {
        if (err instanceof Error) {
          throw new UnauthorizedException('Access Token has been revoked');
        }
        throw err;
      }),
      throwIfEmpty(() => new BadRequestException(`token was not valid`)),
    );
  }

  private isAdmin(groups: string[]): boolean {
    return groups.indexOf(RoleType.ADMIN) > -1;
  }

  private isModerator(groups: string[]): boolean {
    return groups.indexOf(RoleType.MODERATOR) > -1;
  }

  private createResponse(
    response: RespondToAuthChallengeResponse,
    type: RoleType,
  ) {
    return {
      status: 'CREATE_PROFILE',
      type: type,
      authResult: response.AuthenticationResult,
    };
  }

  private createProfilePayload(
    idTokenData: any,
    type: RoleType,
  ): CreateProfileDto {
    return {
      userId: idTokenData.sub,
      firstName: idTokenData['given_name'],
      lastName: idTokenData['family_name'],
      emailId: idTokenData['email'],
      role: idTokenData['cognito:groups'],
      type: type,
      dob: '',
      mobileNumber: idTokenData['phone_number'],
      status: UserStatus.VERIFIEDUSER,
    };
  }
}
