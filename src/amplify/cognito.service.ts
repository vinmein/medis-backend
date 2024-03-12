// cognito.service.ts
import { Injectable } from '@nestjs/common';
import { AuthenticationDetails, CognitoUser, CognitoUserAttribute, CognitoUserPool } from 'amazon-cognito-identity-js';


@Injectable()
export class CognitoService {
  private userPool: CognitoUserPool;

  constructor(userPoolId: string, clientId: string) {
    // Cognito user pool configuration
    this.userPool = new CognitoUserPool({
      UserPoolId: userPoolId,
      ClientId: clientId
    });
  }

  async authenticateUser(username: string, password: string): Promise<string> {
    const authenticationDetails = new AuthenticationDetails({
      Username: username,
      Password: password
    });

    const userData = {
      Username: username,
      Pool: this.userPool
    };

    const cognitoUser = new CognitoUser(userData);

    return new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (session) => {
          // User authentication successful
          const accessToken = session.getAccessToken().getJwtToken();
          resolve(accessToken);
        },
        onFailure: (err) => {
          // User authentication failed
          reject(err);
        }
      });
    });
  }

  async registerUser(email: string): Promise<any> {
    const attributeList = [
      new CognitoUserAttribute({ Name: 'email', Value: email }),
      new CognitoUserAttribute({ Name: 'family_name', Value: "test" }),
      new CognitoUserAttribute({ Name: 'first_name', Value: "test" })
      // Add more attributes if needed
    ];

    return new Promise((resolve, reject) => {
      this.userPool.signUp(email, "Test1234!", attributeList, null, (err, result) => {
        if (err) {
            console.log(err);
          reject(err);
        } else {
            console.log(result);
          resolve(result);
        }
      });
    });
  }
}
