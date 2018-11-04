import {Injectable} from '@angular/core';
import {Stripe} from '@ionic-native/stripe';

export class Card {
  number: string;
  expMonth: number;
  expYear: number;
  cvc: string;
}

@Injectable()
export class StripeService {
  // previous key : pk_test_vVdZbNwUygb5jKZmIzqpiGt4
  private publishableKey = 'pk_test_h1EWvbHLAwjMg3gLPsLuTNxd';

  constructor(private stripe: Stripe) {
    this.stripe.setPublishableKey(this.publishableKey);
  }

  private createCardToken(card: Card): Promise<string> {
    return this.stripe.createCardToken(card);
  }

  public validateCardNumber(cardNumber: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.stripe.validateCardNumber(cardNumber)
          .then(()=> resolve(true))
          .catch(() => resolve(false));
    });

  }

}
