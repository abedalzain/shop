import { AccountPage } from './../account/account';
import { StripeService } from './../../app/stripe.service';
import { BasketSizeService } from './../../app/basket.service';
import { HomePage } from './../home/home';
import { model } from 'baqend';
import { DBReady } from './../../app/db.service';
import { baqend } from 'baqend';
import { Component, NgZone } from '@angular/core';
import { NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { Stripe } from '@ionic-native/stripe';
/**
 * Generated class for the PaymentPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
  selector: 'page-payment',
  templateUrl: 'payment.html',
})
export class PaymentPage {
  orderItems: Array<any>;
  db: baqend;
  expiryDate:Date = new Date();
  order:model.Orders;
  deliveryAddressId:string;
  billingAddressId:string;
  orderAmount:number;
  card:any = {
    number: "",
    expMonth: "",
    expYear: "",
    cvc: ""
  };
  message: string;
  paymentResponseStatus:boolean = false;
  constructor(public navCtrl: NavController,private ready: DBReady, 
    public navParams: NavParams,private basketService:BasketSizeService,
    public loadingCtrl: LoadingController,private toastCtrl:ToastController,
    private stripeService:StripeService,private stripe: Stripe,private _zone: NgZone) {
    console.log(navParams);
    if(navParams){
      this.deliveryAddressId = navParams.get("delAddress");
      this.billingAddressId = navParams.get("billAddress");
      this.orderAmount = navParams.get("orderAmount");
      this.orderItems = this.navParams.get("orderItems");
    }
    
  }
  ionViewCanEnter(){
    console.log('ionViewDidLoad view can');
    return this.ready.resolve().then(db => {
      this.db = db;
      if(this.db.User.me){
        this.basketService.getBasketFromServer(this.db,this.db.User.me.key);
      }else{
        this.basketService.getBasketFromLocal();
      }
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PaymentPage');
    console.log(this.card);
    console.log(this.checkCardDataNotEmpty());
    
  }
  back(){
  this.navCtrl.pop();
  }

  orderNow(token){
    console.log(this.card);
    let toast = this.toastCtrl.create({position:"top",message:"Your Order Has Been Successfully Added !",cssClass:'toastSuccess',duration:2500});
    // var handler = (<any>window).StripeCheckout.configure({
    //   key: 'pk_test_h1EWvbHLAwjMg3gLPsLuTNxd',
    //   locale: 'auto',
    //   token: function (token: any) {
    //     // You can access the token ID with `token.id`.
    //     // Get the token ID to your server-side code for use.
    //     console.log(token);
        
    //   }
    // });

    // handler.open({
    //   name: 'Demo Site',
    //   description: '2 widgets',
    //   amount: 2000
    // });

    // let publishableKey = 'pk_test_h1EWvbHLAwjMg3gLPsLuTNxd';
    // this.stripe.setPublishableKey(publishableKey);
    // this.stripe.validateCardNumber(this.card.number).then((data)=>{
    //   console.log(data);
    // }).catch(error=>{
    //   console.log("error",error);
      
    // });


    this.order = new this.db.Orders();
    this.order.UserID = this.db.User.me.key;
    this.order.DeliveryAddressId = this.deliveryAddressId;
    this.order.BillingAddressId =this.billingAddressId;
    this.order.Amount = this.orderAmount;
    this.order.CardToken = token;
    this.order.save().then(order=>{
      console.log(order);
      this.orderItems.forEach((item:any) => {
        let orderItem:model.OrderItems = new this.db.OrderItems();
        orderItem.OrderId = order.key;
        orderItem.VegId = item.VegId;
        orderItem.VegQty = item.VegQuantity;
        orderItem.VegPrice = item.price;
        orderItem.ShopId = item.ShopId;
        this.db.Basket.load(item.basketItemId).then(b=>{
          b.Ordered = true;
          b.update().then(bb=>{
            console.log("basket  updated",bb);
          });
        });
        orderItem.save().then((oItem)=>{
          console.log(oItem);
        });
      });
      toast.present();
      setTimeout(()=> {
        this.navCtrl.setRoot(HomePage);
      }, 250);
    });
  }
  getToken() {
    this.message = 'Loading...';
    let loading = this.loadingCtrl.create({
      content: 'Loading please wait...'
    });

    loading.present();
    var This = this;
    (<any>window).Stripe.card.createToken({
      number: This.card.number,
      exp_month: This.card.expMonth,
      exp_year: This.card.expYear,
      cvc: This.card.cvc
    }, (status: number, response: any) => {
       this._zone.run(() => {
        if (status === 200) {
          this.paymentResponseStatus = true;
          this.message = `Success!`;
          console.log(this.message);
          console.log(response);
          loading.dismiss().then(()=>{
            setTimeout(()=> {
              this.orderNow(String(response.id));              
            }, 250);
            
          });
        } else {
          this.paymentResponseStatus = false;
          this.message = response.error.message;
          let toast = this.toastCtrl.create({position:"top",message:response.error.message,cssClass:'toastDanger',duration:2500});
          toast.present();
          console.log(this.message);
          loading.dismiss();
        }
       });
    });
  }
   goToSettings(){
    this.navCtrl.push(AccountPage,{hideMenuBtn:true});
  }
  checkCardDataNotEmpty(){
    if(this.card.number.length <= 0){
      return true;
    }
    if(this.card.expMonth <= 0 ){
      return true;
    }
    if(this.card.expYear <= 0 ){
      return true;
    }
    if(this.card.cvc.length <= 0){
      return true;
    }
    
    return false;
  }
}
