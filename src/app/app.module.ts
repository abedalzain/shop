import { UpdateUserPayAddressPage } from './../pages/account/update-user-pay-address/update-user-pay-address';
import { UpdateUserPasswordPage } from './../pages/account/update-user-password/update-user-password';
import { UpdateUserNamePage } from './../pages/account/update-user-name/update-user-name';
import { UpdateUserEmailPage } from './../pages/account/update-user-email/update-user-email';
import { UpdateUserAddressPage } from './../pages/account/update-user-address/update-user-address';
import { PaymentPage } from './../pages/payment/payment';
import { AddressPage } from './../pages/address/address';
import { DeliveryPage } from './../pages/delivery/delivery';
import { AboutShopPage } from './../pages/about-shop/about-shop';
import { AboutPage } from './../pages/about/about';
import { PrivacyPage } from './../pages/privacy/privacy';
import { TermsPage } from './../pages/terms/terms';
import { OrganicFoodDeliveryPage } from './../pages/organic-food-delivery/organic-food-delivery';
import { HowItWorksPage } from './../pages/how-it-works/how-it-works';

import { NgModule }                       from '@angular/core';
import { IonicApp, IonicModule }          from 'ionic-angular';
import { IonicStorageModule }             from '@ionic/storage';
import { BrowserModule }                  from '@angular/platform-browser';
import { StatusBar }                      from '@ionic-native/status-bar';

import { MyApp }                          from './app.component';
import { AccountPage }                    from '../pages/account/account';
import { HomePage }                       from '../pages/home/home';
import { ShopsPage }                      from "../pages/shops/shops";
import { ShopPage }                       from "../pages/shop/shop";
import { AddShopPage }                    from "../pages/addshop/addshop";
import { OrderPage }                      from './../pages/order/order';
import { BasketPage }                    from './../pages/basket/basket';
import { FarmerInfoPage }                 from './../pages/farmer-info/farmer-info';
import { FarmShopsPage }                  from './../pages/farm-shops/farm-shops';
import { ChooseVegPage }                  from './../pages/choose-veg/choose-veg';

import { Stripe } from '@ionic-native/stripe';

import { DBReady }                        from './db.service';
import { StripeService } from './stripe.service';
import { googlePlacesComponent } from '../pages/google-places/google-places';
import { LoggedIn } from "./loggedin.service";
import { Geolocation } from '@ionic-native/geolocation';
import { ShopService } from "./shop.service";
import { BasketSizeService } from "./basket.service";
import { SearchQuery } from "./search.service";
import { AddNewUserDeliverAddressPage } from "../pages/account/add-new-user-dilevery-address/add-new-user-dilevery-address";

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    AccountPage,
    ShopsPage,
    ShopPage,
    AddShopPage,
    ChooseVegPage,
    FarmShopsPage,
    FarmerInfoPage,
    BasketPage,
    OrderPage,
    TermsPage,
    PrivacyPage,
    AboutPage,
    AboutShopPage,
    googlePlacesComponent,
    OrderPage,
    DeliveryPage,
    AddressPage,
    PaymentPage,
    OrganicFoodDeliveryPage,
    HowItWorksPage,
    UpdateUserAddressPage,
    UpdateUserEmailPage,
    UpdateUserNamePage,
    UpdateUserPasswordPage,
    UpdateUserPayAddressPage,
    AddNewUserDeliverAddressPage
  ],
  imports: [
    BrowserModule,
    IonicStorageModule.forRoot(),
    IonicModule.forRoot(MyApp,{
      backButtonIcon:'ios-arrow-back',
      backButtonText: 'Back'
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    AccountPage,
    ShopsPage,
    ShopPage,
    AddShopPage,
    ChooseVegPage,
    FarmShopsPage,
    FarmerInfoPage,
    BasketPage,
    OrderPage,
    TermsPage,
    PrivacyPage,
    AboutPage,
    AboutShopPage,
    googlePlacesComponent,
    OrderPage,
    DeliveryPage,
    AddressPage,
    PaymentPage,
    OrganicFoodDeliveryPage,
    HowItWorksPage,
    UpdateUserAddressPage,
    UpdateUserEmailPage,
    UpdateUserNamePage,
    UpdateUserPasswordPage,
    UpdateUserPayAddressPage,
    AddNewUserDeliverAddressPage
  ],
  providers: [
    DBReady,
    StatusBar,
    Stripe,
    StripeService,
    LoggedIn,
    Geolocation,
    ShopService,
    BasketSizeService,
    SearchQuery
  ]
})
export class AppModule {}
