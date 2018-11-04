import { UpdateUserPayAddressPage } from './update-user-pay-address/update-user-pay-address';
import { UpdateUserAddressPage } from './update-user-address/update-user-address';
import { UpdateUserNamePage } from './update-user-name/update-user-name';
import { UpdateUserEmailPage } from './update-user-email/update-user-email';
import { UpdateUserPasswordPage } from './update-user-password/update-user-password';
import { BasketSizeService } from './../../app/basket.service';
import { Storage } from '@ionic/storage';
import { HomePage } from './../home/home';
import { model } from 'baqend';
import { Component } from '@angular/core';
import { baqend } from 'baqend';
import { DBReady } from '../../app/db.service';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ToastController, NavController, NavParams, AlertController } from 'ionic-angular';
import { GlobalValidator } from "../../app/global.validator";
import { LoggedIn } from "../../app/loggedin.service";
import { AddNewUserDeliverAddressPage } from "./add-new-user-dilevery-address/add-new-user-dilevery-address";


@Component({
  selector: 'page-account',
  templateUrl: 'account.html'
})
export class AccountPage {
  db: baqend;
  user: FormGroup;
  changeEmail:boolean = false;
  changePass:boolean = false;
  changeName:boolean = false;
  changeAddress: boolean = false;
  changePayInfo:boolean = false;
  pastOrders:Array<model.Orders>=[];
  userAddresses:Array<model.Address>;
  userPaymentAddresses:Array<model.Address>;
  ordersItems:Array<Array<model.OrderItems>>=[];
  orderVegsNames:Array<string>=[];
  hideMenuBtn:boolean = false;
  constructor(private ready:DBReady, 
              private formBuilder: FormBuilder, 
              private toastCtrl: ToastController,
              private navCtrl: NavController,
              private navParams:NavParams,
              private storage:Storage,
              private loggedInService:LoggedIn,
              private alertCtrl:AlertController,
              private basketService:BasketSizeService) {
    
    this.user = this.formBuilder.group({
      name: ['', Validators.compose([Validators.email,Validators.required,GlobalValidator.mailFormat])],
      password: ['',Validators.compose([Validators.required,Validators.pattern(/(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)])]
    });

    if(navParams.get("hideMenuBtn")){
      this.hideMenuBtn = navParams.get("hideMenuBtn");
    }else{
      this.hideMenuBtn = false;
    }
    
  }

  showErrorToast(error) {
    let toast = this.toastCtrl.create({
      message: error.message,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }
  alertError(){
    let alert = this.alertCtrl.create({
      title: 'Weak Password!',
      message: 'Password must have a minimum of 8 characters with at least 1 upper case letter and 1 number.',
      buttons: ['OK']
    });
    alert.present();
  }
  register() {
    if(!this.user.controls.password.valid){
      this.alertError();
      return;
    }
    this.db.User.register(this.user.value.name, this.user.value.password).then((user)=>{
      // console.log(user.validate());
      if(user){
        this.loggedInService.refreshSubscription();
      }
    }).catch(this.showErrorToast.bind(this));
    
  }

  login() {
    if(!this.user.controls.password.valid){
      this.alertError();
      return;
    }
    this.db.User.login(this.user.value.name, this.user.value.password).then(
      ()=>{
      console.log(this.db.User.me);
      this.loggedInService.refreshSubscription();
      // this.navCtrl.setRoot(HomePage);
      if(this.db.User.me){
        this.storage.get('basket').then((data)=>{
          if(data != null){
            if(data.length > 0 ){
              data.forEach(basketItem => {
                let bItem:model.Basket = new this.db.Basket();
                bItem.VegId = basketItem.VegId;
                bItem.VegPrice = basketItem.VegPrice;
                bItem.VegQuantity = basketItem.VegQuantity;
                bItem.UserID = this.db.User.me.key;
                bItem.ShopId = basketItem.ShopId;
                bItem.save();
              });
            }
          }
        });
        this.getUserData();
      }
    }).catch(this.showErrorToast.bind(this));
  }

  logout() {
    this.db.User.logout();
    this.loggedInService.refreshSubscription();
  }

  ionViewCanEnter(){
    // Check if the Baqend SDK is ready and wait for initialization
    return this.ready.resolve().then(db => {
      this.db = db
      if(this.db.User.me){
        this.basketService.getBasketFromServer(this.db,this.db.User.me.key);
        this.getUserData();
      }else{
        this.basketService.getBasketFromLocal();
      }
    });
  }
  ionViewDidEnter(){
    if(this.db.isReady){
      if(this.db.User.me){
        
      }
    }
  }
  getUserData(){
    // get Delivery Addresses
    this.db.Address.find().where({
      "UserId":{"$eq":this.db.User.me.key},
      "Type":{"$eq":1}
    }).resultList(deliveryAdresses=>{
      if(deliveryAdresses){
          this.userAddresses = deliveryAdresses;
        }else{
          this.userAddresses = null;
        }
      }).catch(error=>{
        console.log(error);        
      });

    // get Billing Addresses
    this.db.Address.find().where({
      "UserId":{"$eq":this.db.User.me.key},
      "Type":{"$eq":2}
    }).resultList(billingAddresses=>{
      if(billingAddresses){
        this.userPaymentAddresses = billingAddresses;
      }else{
        this.userPaymentAddresses = null;
      }
    });
    // get past orders
    this.db.Orders.find().where({
      "UserID":{ "$eq" : this.db.User.me.key }
    }).resultList(orders=>{
      this.pastOrders =orders;
      orders.forEach(order=>{
        this.db.OrderItems.find().where({
          "OrderId":{"$eq":order.key}
        }).resultList(orderItems=>{
          this.ordersItems.push(orderItems);
          orderItems.forEach(oItem=>{
            this.db.Veg.load(oItem.VegId).then(veg=>{
              this.orderVegsNames.push(veg.Name);
            });
          });
        });
      });
    });
  }
  forgotPass(){
    this.db.User.resetPassword(this.user.value.name).then(data=>{
      console.log(data);
    })
  }
  
  
  hideForms(){
    if(!this.changeEmail && !this.changePass && ! this.changeName && !this.changeAddress && !this.changePayInfo){
      return true;
    }else{
      return false;
    }
  }
  
  
  repeatOrder(order:model.Orders,i){
    let tempOrder:model.Orders =new this.db.Orders(); 
    tempOrder.Amount = order.Amount;
    tempOrder.BillingAddressId = order.BillingAddressId;
    tempOrder.DeliveryAddressId = order.DeliveryAddressId;
    tempOrder.CardToken = order.CardToken;
    tempOrder.UserID = order.UserID;
    tempOrder.save().then(o=>{
      console.log("new Order has been added",o);
      let orderItems:Array<model.OrderItems>=this.ordersItems[i];
      orderItems.forEach(oi => {
        let tempOrderItem:model.OrderItems = new this.db.OrderItems();
        tempOrderItem.OrderId = o.key;
        tempOrderItem.ShopId = oi.ShopId;
        tempOrderItem.VegId = oi.VegId;
        tempOrderItem.VegPrice = oi.VegPrice;
        tempOrderItem.VegQty = oi.VegQty;
        tempOrderItem.save().then(newOrderItem=>{
          console.log("new order item saved",newOrderItem);          
        }).catch(error=>{
          console.log("error while inserting new order item",error);          
        });
      });
      this.getUserData();
    }).catch(error=>{
      console.log("error happened while repeating order",error);
    });
  }
  startShopping(){
    this.navCtrl.setRoot(HomePage);
  }
  goToChangePass(){
    this.navCtrl.push(UpdateUserPasswordPage);
  }
  goToChangeEmail(){
    this.navCtrl.push(UpdateUserEmailPage);
  }
  goToUpdateUserName(){
    this.navCtrl.push(UpdateUserNamePage);
  }
  goToUpdateUserAddress(i){
    this.navCtrl.push(UpdateUserAddressPage,{addressKey:this.userAddresses[i].key});
  }
  goToChangePayAddress(address:model.Address){
    this.navCtrl.push(UpdateUserPayAddressPage,{address:address});
  }
  addNewDeliveryAddress(){
    this.navCtrl.push(AddNewUserDeliverAddressPage);
  }
}
