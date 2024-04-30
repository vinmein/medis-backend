// cognito.service.ts
const AWS = require('aws-sdk');
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { VerifyRequest } from 'auth/interface/verify-request.interface';
import CognitoIdentityServiceProvider from 'aws-sdk/clients/cognitoidentityserviceprovider';
import { CognitoUser as CUser, AuthenticationDetails, CognitoUserSession, ICognitoUserData, CognitoUserPool, CognitoRefreshToken } from 'amazon-cognito-identity-js';

import { USER } from './cognito.constants';

@Injectable()
export class CognitoService {
  private cognito: CognitoIdentityServiceProvider;
  private userPoolId: string;
  private clientId: string;
  private defaultPassword = 'Test1234!';

  constructor(userPoolId: string, clientId: string) {
    this.userPoolId = userPoolId;
    this.clientId = clientId;
    this.cognito = new AWS.CognitoIdentityServiceProvider({
      region: 'ap-southeast-1',
    });
    // Amplify.configure({
    //   Auth: {
    //     region: 'ap-southeast-1',
    //     userPoolId: userPoolId,
    //     userPoolWebClientId: clientId,
    //     mandatorySignIn: true,
    //   },
    // });
  }

  async registerUser(
    email: string,
    attributes: any,
    group: string,
  ): Promise<CognitoUser> {
    const attributeList = [];
    if (attributes) {
      Object.keys(attributes).map((value) => {
        attributeList.push({
          Name: value,
          Value: attributes[value],
        });
      });
    }
    return new Promise(async (resolve, reject) => {
      this.cognito.signUp(
        {
          ClientId: this.clientId,
          Username: email,
          Password: this.defaultPassword,
          UserAttributes: attributeList,
        },
        async (err, response) => {
          if (err) {
            if (err.name == 'UsernameExistsException') {
              return reject(
                new HttpException(
                  'UsernameExistsException: An account with the given email already exists',
                  HttpStatus.BAD_REQUEST,
                ),
              );
            } else {
              return reject(
                new HttpException('Bad Request', HttpStatus.BAD_REQUEST),
              );
            }
          } else {
            const addToUserGroup = {
              GroupName: USER,
              Username: email,
              UserPoolId: this.userPoolId,
            };
            this.cognito.adminAddUserToGroup(
              addToUserGroup,
              (err, response) => {},
            );
            const addToGroup = {
              GroupName: group,
              Username: email,
              UserPoolId: this.userPoolId,
            };
            this.cognito.adminAddUserToGroup(addToGroup, (err, response) => {});
            const userObj: CognitoUser = {
               UserConfirmed: response.UserConfirmed,
               UserSub: response.UserSub
            };
            return resolve(userObj);
          }
        },
      );
    });
  }

  async requestOtp(email: string): Promise<any> {
    const params = {
      AuthFlow: 'CUSTOM_AUTH',
      ClientId: this.clientId,
      AuthParameters: {
        USERNAME: email,
        email: email,
      },
    };
    return new Promise(async (resolve, reject) => {
      this.cognito.initiateAuth(params, (err, response) => {
        if (err) {
          console.log(err);
          return reject(
            new HttpException('Bad Request', HttpStatus.BAD_REQUEST),
          );
        } else {
          return resolve(response);
        }
      });
    });
  }

  async verifyOtp(payload: VerifyRequest): Promise<any> {
    const params = {
      ClientId: this.clientId,
      ChallengeName: 'CUSTOM_CHALLENGE',
      ChallengeResponses: {
        USERNAME: payload.email,
        ANSWER: payload.otp,
      },
      Session: payload.session,
    };
    return new Promise(async (resolve, reject) => {
      this.cognito.respondToAuthChallenge(params, (err, response) => {
        if (err) {
          if (err.name == 'NotAuthorizedException') {
            return reject(
              new HttpException(
                'NotAuthorizedException: Invalid session for the user.',
                HttpStatus.BAD_REQUEST,
              ),
            );
          } else {
            return reject(
              new HttpException('Bad Request', HttpStatus.BAD_REQUEST),
            );
          }
        } else {
          return resolve(response);
        }
      });
    });
  }

  async refreshTokenv2(refreshToken: string): Promise<any> {
   
    const userToken = {
      REFRESH_TOKEN: refreshToken,
    }
    const params : CognitoIdentityServiceProvider.AdminInitiateAuthRequest= {
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: this.clientId,
      UserPoolId: this.userPoolId,
      AuthParameters :userToken,
    };
    return new Promise(async (resolve, reject) => {
      this.cognito.adminInitiateAuth(params, (err, response) => {
        if (err) {
          if (err.name == 'NotAuthorizedException') {
            return reject(
              new HttpException(
                'NotAuthorizedException: Invalid session for the user.',
                HttpStatus.BAD_REQUEST,
              ),
            );
          } else {
            return reject(
              new HttpException('Bad Request', HttpStatus.BAD_REQUEST),
            );
          }
        } else {
          return resolve(response);
        }
      });
    });
  }


  async refreshToken(userName: string, refreshToken: string): Promise<any> {
    const userPool = new CognitoUserPool({
      UserPoolId: this.userPoolId,
      ClientId: this.clientId,
    });

    const userData = {
      Username: userName,
      Pool: userPool,
    };

    
    const cognitoUser = new CUser(userData);
    const token = new CognitoRefreshToken({ RefreshToken: refreshToken });
    return new Promise(async (resolve, reject) => {
      cognitoUser.refreshSession(token, (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      });
    });
  }
}

