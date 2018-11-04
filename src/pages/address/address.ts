import { AccountPage } from './../account/account';
import { BasketSizeService } from './../../app/basket.service';
import { PaymentPage } from './../payment/payment';
import { baqend, model } from 'baqend';
import { DBReady } from './../../app/db.service';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the AddressPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-address',
  templateUrl: 'address.html',
})
export class AddressPage {
  deliveryAddressId: string;
  orderItems: Array<JSON>;
  orderAmount: number;
  db: baqend;
  showForm:boolean = false;
  billingAddressRadio:any;
  prevBillingAddresses:Array<model.Address>;
  billAddress:any;
  billingAddressIsSelected:boolean = false;
  selectedBillingAddressId: string;
  billingAddress:any={
    line1:'',
    line2:'',
    line3:'',
    line4:'',
    county:'',
    postCode:'',
    country:'UK'
  }
  modelBillingAddress:model.Address;
  constructor(public navCtrl: NavController,private ready: DBReady, 
    public navParams: NavParams,private basketService:BasketSizeService) {
    this.orderAmount = navParams.get("orderAmount");
    console.log(this.orderAmount);
    this.orderItems = this.navParams.get("orderItems");
    console.log(this.orderItems);
    this.deliveryAddressId = navParams.get("delAddress");
    console.log(this.deliveryAddressId);
    this.billingAddressRadio = 'sameBillAddres';
    this.selectedBillingAddressId = navParams.get("delAddress");
  }

  ionViewCanEnter(){
    console.log('ionViewDidLoad view can');
    return this.ready.resolve().then(db => {
      this.db = db;
      if(this.db.User.me){
        this.basketService.getBasketFromServer(this.db,this.db.User.me.key);
        this.db.Orders.find().where({
          "UserID": { "$eq": this.db.User.me.key }
        }).resultList(orders=>{
          this.prevBillingAddresses = new Array();
          if(orders.length > 0 && orders != null){
            this.toggleForm();
            orders.forEach(order => {
              this.db.Address.load(order.BillingAddressId).then(billingAddress=>{
                this.prevBillingAddresses.push(billingAddress);
              });
            });
            console.log(this.prevBillingAddresses);
          }
        });
      }else{
        this.basketService.getBasketFromLocal();
      }
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddressPage');
  }
  back(){
    this.navCtrl.pop();
  }
  continue(){
    if(this.billingAddressIsSelected){
      this.navCtrl.push(PaymentPage,{delAddress:this.deliveryAddressId,billAddress:this.selectedBillingAddressId,orderAmount:this.orderAmount,orderItems:this.orderItems});
    }else{
      if(this.billingAddressRadio == "newBillAddres"){
        this.modelBillingAddress = new this.db.Address();
        this.modelBillingAddress.Address_1 = this.billingAddress.line1;
        this.modelBillingAddress.Address_2 = this.billingAddress.line2;
        this.modelBillingAddress.Address_3 = this.billingAddress.line3;
        this.modelBillingAddress.Address_4 = this.billingAddress.line4;
        this.modelBillingAddress.County = this.billingAddress.county;
        this.modelBillingAddress.Postcode = this.billingAddress.postCode;
        this.modelBillingAddress.Country = this.billingAddress.country;
        this.modelBillingAddress.UserId = this.db.User.me.key;
        this.modelBillingAddress.Type = 2;
        this.modelBillingAddress.save().then((billingAddress)=>{
          console.log(billingAddress);
          this.navCtrl.push(PaymentPage,{delAddress:this.deliveryAddressId,billAddress:billingAddress.key,orderAmount:this.orderAmount,orderItems:this.orderItems});
        });
      }else{
        this.navCtrl.push(PaymentPage,{delAddress:this.deliveryAddressId,billAddress:this.deliveryAddressId,orderAmount:this.orderAmount,orderItems:this.orderItems});
      }
      
    }
    
    

  }
  newBillAddres(){
      console.log(this.billingAddressRadio);
      console.log(this.billingAddressRadio == "newBillAddres" ? true :false);
    return this.billingAddressRadio == "newBillAddres" ? true :false;
  }

  selectAndContinue(billAddressId:string){
    this.billingAddressIsSelected = true;
    this.db.Address.load(billAddressId).then((billAddress)=>{
      this.selectedBillingAddressId = billAddress.key;
        this.continue();
    });
  }
  emptyAddress(){
    this.billingAddress={
      line1:'',
      line2:'',
      line3:'',
      line4:'',
      county:'',
      postCode:'',
      country:'UK'
    }
  }
  toggleForm(){
    this.showForm = !this.showForm;
    if(this.selectedBillingAddressId){
      this.emptyAddress();
    }
  }
   goToSettings(){
    this.navCtrl.push(AccountPage,{hideMenuBtn:true});
  }
  checkBillAddressNotEmpty(){
    if(this.billingAddress.line1 ==='' && this.billingAddress.line2 === '' && this.billingAddress.line3 === '' && this.billingAddress.line4 === ''){
      return false;
    }
    if(this.billingAddress.county === ''){
      return false;
    }
    let regPostcode = /^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z])))) [0-9][A-Za-z]{2})$/;
    if(this.billingAddress.postCode){
      if(!regPostcode.test(this.billingAddress.postCode)){
        return false;
      }
    }
    if(this.billingAddress.postCode === ''){
      return false;
    }
    if(this.billingAddress.country === ''){
      return false;
    }  
    return true;
  }
  sameAddressAsDelivery(){
    this.billingAddressRadio = 'sameBillAddres';
    this.selectedBillingAddressId = this.deliveryAddressId;
  }

}
