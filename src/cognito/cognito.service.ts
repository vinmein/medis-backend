// cognito.service.ts
const AWS = require('aws-sdk');
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { VerifyRequest } from 'auth/interface/verify-request.interface';
import CognitoIdentityServiceProvider from 'aws-sdk/clients/cognitoidentityserviceprovider';
// AWS.config.update({ region: 'ap-southeast-1' });

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

  async registerUser(email: string, attributes: any): Promise<any> {
    const attributeList = [];
    console.log(email);
    if (attributes) {
      Object.keys(attributes).map((value) => {
        console.log(value);
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
            return resolve(response);
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
}
