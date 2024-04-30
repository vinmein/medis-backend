import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EMPTY, from, Observable, of } from 'rxjs';
import { mergeMap, map, throwIfEmpty, catchError } from 'rxjs/operators';
import { UserService } from '../user/user.service';
import { AccessToken } from './interface/access-token.interface';
import { JwtPayload } from './interface/jwt-payload.interface';
import { UserPrincipal } from './interface/user-principal.interface';
import { AMPLIFY_CONNECTION, USER } from 'cognito/cognito.constants';
import { AttributePrincipal } from './interface/attribute-principal.interface';
import { VerifyRequest } from './interface/verify-request.interface';
import { ProfileService } from 'profile/profile.service';
import { CreateProfileRequest } from 'profile/interface/create-profile-request.interface';
import { CreateProfileDto } from 'profile/dto/create-profile.dto';
import { CognitoUserSession } from 'amazon-cognito-identity-js';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private profileService: ProfileService,
    @Inject(AMPLIFY_CONNECTION) private readonly amplify: any,
  ) {}

  validateUser(username: string, pass: string): Observable<UserPrincipal> {
    return this.userService.findByUsername(username).pipe(
      //if user is not found, convert it into an EMPTY.
      mergeMap((p) => (p ? of(p) : EMPTY)),

      // Using a general message in the authentication progress is more reasonable.
      // Concise info could be considered for security.
      // Detailed info will be helpful for crackers.
      // throwIfEmpty(() => new NotFoundException(`username:${username} was not found`)),
      throwIfEmpty(
        () => new UnauthorizedException(`username or password is not matched`),
      ),

      mergeMap((user) => {
        const { _id, password, username, email, roles } = user;
        return user.comparePassword(pass).pipe(
          map((m) => {
            if (m) {
              return { id: _id, username, email, roles } as UserPrincipal;
            } else {
              // The same reason above.
              //throw new UnauthorizedException('password was not matched.')
              throw new UnauthorizedException(
                'username or password is not matched',
              );
            }
          }),
        );
      }),
    );
  }

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
  ): Observable<any> {
    const amplifyInstance = this.amplify();
    const signUp = amplifyInstance.registerUser(email, attributes, group);
    return from(signUp).pipe(
      map((response: CognitoUser) => {
        const payload: CreateProfileDto = {
          userId: response.UserSub,
          firstName: attributes.given_name,
          lastName: attributes.family_name,
          emailId: email,
          role: [group, USER],
          type: group,
          dob: '',
          mobileNumber: '',
        };
        this.profileService.create(payload);
        return response;
      }),
    );
  }

  requestOtp(email: string): Observable<any> {
    const amplifyInstance = this.amplify();
    const response = amplifyInstance.requestOtp(email);
    return from(response).pipe(
      map((response) => {
        return response;
      }),
    );
  }

  verifyOtp(payload: VerifyRequest): Observable<any> {
    const amplifyInstance = this.amplify();
    const response = amplifyInstance.verifyOtp(payload);
    return from(response).pipe(
      map((response) => {
        return response;
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
}

// {
//   "idToken": {
//       "jwtToken": "eyJraWQiOiJzXC80Y3p6eWdBNWNXeEtRVnBZVXAwWmprOGlwRVF2WkYwY2xtbGNWZDlMVT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI1MjczYTNhMi1hY2QyLTQyZDgtYjliZi0zZTM0MjQ4ODE4OWIiLCJjb2duaXRvOmdyb3VwcyI6WyJBRE1JTiIsIlVTRVIiXSwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuYXAtc291dGhlYXN0LTEuYW1hem9uYXdzLmNvbVwvYXAtc291dGhlYXN0LTFfZTBkb1gydzR4IiwiY29nbml0bzp1c2VybmFtZSI6IjUyNzNhM2EyLWFjZDItNDJkOC1iOWJmLTNlMzQyNDg4MTg5YiIsImdpdmVuX25hbWUiOiJEaW5lc2giLCJvcmlnaW5fanRpIjoiOWVjOTY4YzEtMWRjNC00NmRjLTg0MGQtMmQxMTBkNGI1YzNlIiwiYXVkIjoiNHNsb3BzYzVtaWlmN20zM2xsbHFscnJiZmQiLCJldmVudF9pZCI6IjZiYjZmZjE5LWVkODAtNDdiOC1hMWJiLTc2NWM1MmE5OTQ3MiIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNzEyMzQ0NTgwLCJleHAiOjE3MTIzNzc1ODksImlhdCI6MTcxMjM3Mzk4OSwiZmFtaWx5X25hbWUiOiJWYWRpdmVsIiwianRpIjoiOGQ2ZTA1ZGUtNWZmZi00MjU4LWJmMjgtNDJlNmI2MTc0OTI4IiwiZW1haWwiOiJkaW5lc2guZHJhZEBnbWFpbC5jb20ifQ.oyXpb9TT9-kL1FUx96WbpvsLrrOn35FIR0XJmFObXQsfO9dVcihdxtEQspnGODvPXMHa8IV5YAWcZc9NRy_tFwcPCAxYOrMLg3-7SsAhMuCW86pz13dnzLtOLSpDtKxeGZaGi9OTmO-9jkMu1cRUMlYjrNh4wMhrFprmpcZ3LlG8OlfqBQ79qrq49lY4BQKMFxwjfA6gu0WOVh52Xia-iWCP8reIH_7VKKt4_ny8bni6RdKcuY89Ir-HJsAp3uXYfH9rTJ7VXTSVXyMMc1tI-vZKSHo8Erv5ozESkOTAoRA23dDYX8RQSobuKltEdA7dZfzIe-FZKHhVy1SEXbIgmA",
//       "payload": {
//           "sub": "5273a3a2-acd2-42d8-b9bf-3e342488189b",
//           "cognito:groups": [
//               "ADMIN",
//               "USER"
//           ],
//           "email_verified": false,
//           "iss": "https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_e0doX2w4x",
//           "cognito:username": "5273a3a2-acd2-42d8-b9bf-3e342488189b",
//           "given_name": "Dinesh",
//           "origin_jti": "9ec968c1-1dc4-46dc-840d-2d110d4b5c3e",
//           "aud": "4slopsc5miif7m33lllqlrrbfd",
//           "event_id": "6bb6ff19-ed80-47b8-a1bb-765c52a99472",
//           "token_use": "id",
//           "auth_time": 1712344580,
//           "exp": 1712377589,
//           "iat": 1712373989,
//           "family_name": "Vadivel",
//           "jti": "8d6e05de-5fff-4258-bf28-42e6b6174928",
//           "email": "dinesh.drad@gmail.com"
//       }
//   },
//   "refreshToken": {
//       "token": "eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ.lwE6cJM7kZb-yewTL30vsfCkqyES9bEXRhZK6rE1Q4hWQ9ztdBrqx_1Cc28lSluyfsFVxo6FqyBA9th4Wsf_sIPPm0aQfn-EqH2Y8re0MADW_dpac_7uOeIINin-OzCDa5VBWMylCuifszGKvQL7bvkKeO0ZEnFZMdpBY79g87mrbuTtI47IBmacXVkAMzFDKv7uCForgvTIUIkJm0Ow1xAzy-ts7jRDUT3v0mGbT-WQCcoGkjyaro3wFU6pn17oTz4KMEdO8JJ2h6HANzaPUfKgX3oi2CISoz1uJzRs2xb0TFy6i9hNpJSxIhj6aFW6I98JV9fDqCujbQlFnCT3dw.iof_7DqvzGlUvc0l.PuiaqcsYORTNBSh3P0-OnqFuSpTv69A0Zb2ZXNgvdXjehkZI2SPbqQVcFC6yldIByjfVCA9v08KB8LVhcY2TNKu_oq4omqdNCR66YHP6Dj06XiBC42xziY6StDn0l9wC-khHtX0ei3_x338Mi_KTBvNoHBoarOhuHqVUxfwtN8IZpdgpqCb9IU94qbNeiB64Lejwf2bGPR-Rv5Xc-_CS17vIsaovleIhPSzRasO11Ubm1y3oMi0skXN1tnutNeYmmut56wOEe2XiDcym0A8_2R_GzUwiqy6ByiayAuNiNWgeknjwu3l_kWehioSM7TR-N3_OKsE02RqJfyZ83X_SWIunT6bbQdGxpboXcgim3tub5hYXKJc7-_XnNer99WipqD5hhOM3WAmdWU54AwOSoQ9dRFwxKmTNvbQ6m2E642pnQ8KlCQHyiXO7xFs-ErbKMoxA3RQtGqEL7S49RkDpkP6iL7yRHEq3InkDfBIKIjm5VAVrnMXUSz3i92nwNAx2IcnwxAvgeNGauadUh-MJ_4n0Ie2OucWrNN9LWr-7gvzNG7UWIaYwSpov2Dt2K3VOlr7PKendOvFQJid8RrJ8ksU8nbgVxgdmtyj5X3amrkVA4u0uBqdU1OwzIzQ68zGjpjgG6ppCQX3d9Sr3BdVkF0tYHXhnab1xZ0qX02ECGGnqcdAWnWfMEEcBhUPCJvKjeMKxodpzSvcKvDPyn1wnZgAbDoL1kYgvsuuy2VIjHVIM7-bq92rFhvqgY87qg6S6zaAlvkLcYazRquTvr_e_QwATZYwzG_YC0cqnl2sijzeeof9VVDY42-nD2kS7J7XGG40_x7Z3WzKmsq6K1YFdQWw1vlT3Mr6ZqVeVzRAjM4TOJ9CSXXtovmSOAjqxIX4LNyrcqcaDBUbj2GIwToUc29m1SVQ1Blmj7K1NTYszsC3HPEAnOs14DN39bfX2NnP3YVkpZqoCYuXCYDO0xQvAUseiJicUxK32IaMmn6jACBIrwzedRv4cMvreMIW-0KeppCwFQIxbr8lQid9ge9JptblIf2EXXjb27UxmYDcZOoeZIK4hOf2_TfW69i1VZMLprBPdCC-S30t1ctq7qEw6_JPfrpkcloPa8_b1YOqz7E3GhQcVWH3pGKGHGB47Rvy2yZt5fETwY5SngWnai3jS5WkwSjc1HmHUVMdrQ5RfUcbcpZvtvM5nuc7lrMJVNuRplpVR0ZeyATj3an5Hcbl3mzqn8vQUy5gIQGmkN5corpVFtGjc4NYxE62YuJFeVDxEJPOQipZYuXT8ob4Slhac1fQuzNL-D5ZeSwGLqBMr8PbzW-bLfdbj7G-yi3cURv1geMKD0d2324HMOw.1NuAKkSQUrSpi5fMOEBPNA"
//   },
//   "accessToken": {
//       "jwtToken": "eyJraWQiOiJ2djk4UWVyUWZcLzVlMjJMYnZXWmY2MENIUTY1ZGNyaDRyU3JpTVAxVGlVWT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI1MjczYTNhMi1hY2QyLTQyZDgtYjliZi0zZTM0MjQ4ODE4OWIiLCJjb2duaXRvOmdyb3VwcyI6WyJBRE1JTiIsIlVTRVIiXSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmFwLXNvdXRoZWFzdC0xLmFtYXpvbmF3cy5jb21cL2FwLXNvdXRoZWFzdC0xX2UwZG9YMnc0eCIsImNsaWVudF9pZCI6IjRzbG9wc2M1bWlpZjdtMzNsbGxxbHJyYmZkIiwib3JpZ2luX2p0aSI6IjllYzk2OGMxLTFkYzQtNDZkYy04NDBkLTJkMTEwZDRiNWMzZSIsImV2ZW50X2lkIjoiNmJiNmZmMTktZWQ4MC00N2I4LWExYmItNzY1YzUyYTk5NDcyIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJhd3MuY29nbml0by5zaWduaW4udXNlci5hZG1pbiIsImF1dGhfdGltZSI6MTcxMjM0NDU4MCwiZXhwIjoxNzEyMzc3NTg5LCJpYXQiOjE3MTIzNzM5ODksImp0aSI6IjRiODc4YTQ2LWExN2ItNGNkZS1iNjFkLTZkODI5NGRhMThhNyIsInVzZXJuYW1lIjoiNTI3M2EzYTItYWNkMi00MmQ4LWI5YmYtM2UzNDI0ODgxODliIn0.Vkj4WGzUWf711ocRGOSiTcBFwLSW9sJXgcy_s2LUHyIgTIrIMHYruAsNUcVrqdMSuoP2oQBycCQ7kObyZmMbT9wG77c-ZSwfLx43AmMJtUt6BmbupZLTVyFvXGtinoMuKn-HqsKoCnrhcWymplqavMy3VksHBRBUCBlCbOYh4RmKmSvkj-lIHrZ5BNtIoPLalpHJjbGVyzFvrZCbk6Fyo5DaZhhVxgb3eoFP1TsAwnqkJyx-ocCt0KmbKjgl5JWd8_Op6fWjz0Rj0o22gIxoy6BVWMhaXMFJhVwl-RqscKVEARZv15KPS7rUmb4LTYFrHkDaEAmRWtbPYWBS7z3MFA",
//       "payload": {
//           "sub": "5273a3a2-acd2-42d8-b9bf-3e342488189b",
//           "cognito:groups": [
//               "ADMIN",
//               "USER"
//           ],
//           "iss": "https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_e0doX2w4x",
//           "client_id": "4slopsc5miif7m33lllqlrrbfd",
//           "origin_jti": "9ec968c1-1dc4-46dc-840d-2d110d4b5c3e",
//           "event_id": "6bb6ff19-ed80-47b8-a1bb-765c52a99472",
//           "token_use": "access",
//           "scope": "aws.cognito.signin.user.admin",
//           "auth_time": 1712344580,
//           "exp": 1712377589,
//           "iat": 1712373989,
//           "jti": "4b878a46-a17b-4cde-b61d-6d8294da18a7",
//           "username": "5273a3a2-acd2-42d8-b9bf-3e342488189b"
//       }
//   },
//   "clockDrift": 0
// }
