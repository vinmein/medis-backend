import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as mailchimp from '@mailchimp/mailchimp_marketing';

@Injectable()
export class MailChimpService {
  private readonly apiKey: string;
  private readonly serverPrefix: string = 'us22';  // Adjust as necessary
  private readonly listId: string = '286fa1eed7';  // Replace with your actual list ID

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    mailchimp.setConfig({
      apiKey: this.apiKey,
      server: this.serverPrefix,
    });
  }

  async subscribeUser(email: string): Promise<any> { // Changed the return type to `any` or you can define a specific type/interface based on Mailchimp response structure
    try {
      const response = await mailchimp.lists.addListMember(this.listId, {
        email_address: email,
        status: 'subscribed',  // Consider handling double opt-in if needed
      });
      return response;
    } catch (error) {
      console.error(error);
      throw new HttpException('Failed to subscribe user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}