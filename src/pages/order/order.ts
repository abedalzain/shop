import { AccountPage } from './../account/account';
import { Storage } from '@ionic/storage';
import { BasketSizeService } from './../../app/basket.service';
import { DeliveryPage } from './../delivery/delivery';
import { LoggedIn } from './../../app/loggedin.service';
import { GlobalValidator } from './../../app/global.validator';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, ToastController, LoadingController } from 'ionic-angular';
import { DBReady } from "../../app/db.service";
import { baqend } from "baqend";
import { model } from "baqend";

/**
 * Generated class for the OrderPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
  selector: 'page-order',
  templateUrl: 'order.html',
})
export class OrderPage {

  signUp:FormGroup;
  loginForm:FormGroup;
  password:any;
  slidesNumber: number = 1;

  selectedDeliveryAddressId: string;
  selectedBillingAddressId: string;
  deleverDate: Date = new Date();
  delAddress:any;
  billAddress:any;
  deliveryAddressIsSelected:boolean = false;
  billingAddressIsSelected:boolean = false;
  deleveryAddress:any={
    line1:'',
    line2:'',
    line3:'',
    line4:'',
    county:'',
    postCode:'',
    country:''
  }

  billingAddress:any={
    line1:'',
    line2:'',
    line3:'',
    line4:'',
    county:'',
    postCode:'',
    country:''
  }

  billingAddressRadio:any;
  newAddress:any;
  expiryDate:Date;
  db: baqend;
  modelDeliveryAddress:model.Address;
  modelBillingAddress:model.Address;
  order:model.Orders;
  orderAmount:number = 0;
  orderItems:Array<JSON>;
  prevDeliveryAddresses:Array<model.Address>;
  prevBillingAddresses:Array<model.Address>;
  constructor(public navCtrl: NavController,
              private ready: DBReady,
              private formBuilder:FormBuilder,
              private alertCtrl: AlertController,
              private loggedInService:LoggedIn,
              private toastCtrl: ToastController,
              public navParams: NavParams,
              private storage:Storage,
              private loadingCtrl:LoadingController,
              private basketService:BasketSizeService) {
    console.log('ionViewDidLoad OrderPage');
    if(this.navParams.get("amount") != null && this.navParams.get("amount")){
      this.orderAmount = this.navParams.get("amount");
      console.log(this.orderAmount);
      
    }
    if(this.navParams.get("orderItems") != null && this.navParams.get("orderItems")){
      this.orderItems = this.navParams.get("orderItems");
      console.log(this.orderItems);
    }
    
  }
  ionViewCanEnter(){

    console.log('ionViewDidLoad view can');
  return this.ready.resolve().then(db => {
      this.db = db;
      if(this.db.User.me){
        this.basketService.getBasketFromServer(this.db,this.db.User.me.key);
        this.next();
        this.db.Orders.find().where({
          "UserID": { "$eq": this.db.User.me.key }
        }).resultList(orders=>{
          if(orders.length > 0 && orders != null){
            this.prevDeliveryAddresses = new Array();
            this.prevBillingAddresses = new Array();
            orders.forEach(order => {
              this.db.Address.load(order.DeliveryAddressId).then(deliveryAddress=>{
                this.prevDeliveryAddresses.push(deliveryAddress);
              });
              this.db.Address.load(order.BillingAddressId).then(billingAddress=>{
                this.prevBillingAddresses.push(billingAddress);
              });
            });
          } 
        });
      }else{
        this.basketService.getBasketFromLocal();
        this.signUp = this.formBuilder.group({
          username: ['', Validators.compose([Validators.email,Validators.required,GlobalValidator.mailFormat])]
        });
        this.loginForm = this.formBuilder.group({
          username :['', Validators.compose([Validators.email,Validators.required,GlobalValidator.mailFormat])],
          password: ['',Validators.compose([Validators.required,Validators.pattern(/(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)])]
        });
      }
    });
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad OrderPage');
   
  
  }
  newBillAddres(){
      console.log(this.billingAddressRadio);
      console.log(this.billingAddressRadio == "newBillAddres" ? true :false);
    return this.billingAddressRadio == "newBillAddres" ? true :false;
  }
  
  orderNow(){
    //check if selected delivery address
    if(this.deliveryAddressIsSelected ){
      // check if seleceted delivery address and selected billing address
      if(this.billingAddressIsSelected){
        // check if selected delivery and billing address are the same
        if( this.selectedDeliveryAddressId === this.selectedBillingAddressId){
          this.order = new this.db.Orders();
          this.order.UserID = this.db.User.me.key;
          this.order.DeliveryAddressId = this.selectedDeliveryAddressId;
          this.order.BillingAddressId =this.selectedDeliveryAddressId;
          this.order.Amount = this.orderAmount;
          this.order.save().then(order=>{
            console.log(order);
          });
        }else{
          // if selected delivery and billing address are not the same
          this.order = new this.db.Orders();
          this.order.UserID = this.db.User.me.key;
          this.order.DeliveryAddressId = this.selectedDeliveryAddressId;
          this.order.BillingAddressId =this.selectedBillingAddressId;
          this.order.Amount = this.orderAmount;
          this.order.save().then(order=>{
            console.log(order);
          });
        }
      }else{
        // check if selected delivery address and not selected billing address
        // then create now billing address and save order
        this.modelBillingAddress = new this.db.Address();
        this.modelBillingAddress.Address_1 = this.billingAddress.line1;
        this.modelBillingAddress.Address_2 = this.billingAddress.line2;
        this.modelBillingAddress.Address_3 = this.billingAddress.line3;
        this.modelBillingAddress.Address_4 = this.billingAddress.line4;
        this.modelBillingAddress.County = this.billingAddress.county;
        this.modelBillingAddress.Postcode = this.billingAddress.postCode;
        this.modelBillingAddress.Country = this.billingAddress.country;
        this.modelBillingAddress.save().then((billingAddress)=>{
          console.log(billingAddress);
          this.order = new this.db.Orders();
          this.order.UserID = this.db.User.me.key;
          this.order.DeliveryAddressId = this.selectedDeliveryAddressId;
          this.order.BillingAddressId = billingAddress.key;
          this.order.Amount = this.orderAmount;
          this.order.save().then(order=>{
            console.log(order);
          });
        });
      }
    }else{
      if(this.billingAddressIsSelected){
        this.modelDeliveryAddress = new this.db.Address();
        this.modelDeliveryAddress.Address_1 = this.deleveryAddress.line1;
        this.modelDeliveryAddress.Address_2 = this.deleveryAddress.line2;
        this.modelDeliveryAddress.Address_3 = this.deleveryAddress.line3;
        this.modelDeliveryAddress.Address_4 = this.deleveryAddress.line4;
        this.modelDeliveryAddress.County = this.deleveryAddress.county;
        this.modelDeliveryAddress.Postcode = this.deleveryAddress.postCode;
        this.modelDeliveryAddress.Country = this.deleveryAddress.country;
        this.modelDeliveryAddress.save().then(deliveryAddress=>{
          this.order = new this.db.Orders();
          this.order.UserID = this.db.User.me.key;
          this.order.DeliveryAddressId = deliveryAddress.key;
          this.order.BillingAddressId = this.selectedBillingAddressId;
          this.order.Amount = this.orderAmount;
          this.order.save().then(order=>{
            console.log(order);
          });
        });
      }else{
        this.modelDeliveryAddress = new this.db.Address();
        this.modelDeliveryAddress.Address_1 = this.deleveryAddress.line1;
        this.modelDeliveryAddress.Address_2 = this.deleveryAddress.line2;
        this.modelDeliveryAddress.Address_3 = this.deleveryAddress.line3;
        this.modelDeliveryAddress.Address_4 = this.deleveryAddress.line4;
        this.modelDeliveryAddress.County = this.deleveryAddress.county;
        this.modelDeliveryAddress.Postcode = this.deleveryAddress.postCode;
        this.modelDeliveryAddress.Country = this.deleveryAddress.country;
        this.modelDeliveryAddress.save().then((deleveryAddress)=>{
          console.log(deleveryAddress);
            this.modelBillingAddress = new this.db.Address();
            this.modelBillingAddress.Address_1 = this.billingAddress.line1;
            this.modelBillingAddress.Address_2 = this.billingAddress.line2;
            this.modelBillingAddress.Address_3 = this.billingAddress.line3;
            this.modelBillingAddress.Address_4 = this.billingAddress.line4;
            this.modelBillingAddress.County = this.billingAddress.county;
            this.modelBillingAddress.Postcode = this.billingAddress.postCode;
            this.modelBillingAddress.Country = this.billingAddress.country;
            this.modelBillingAddress.save().then((billingAddress)=>{
              console.log(billingAddress);
              this.order = new this.db.Orders();
              this.order.UserID = this.db.User.me.key;
              this.order.DeliveryAddressId = deleveryAddress.key;
              this.order.BillingAddressId = billingAddress.key;
              this.order.Amount = this.orderAmount;
              this.order.save().then(order=>{
                console.log(order);
              });
            });
          });
      }

    }
  }
  selectedBillAddress(billAddressId:string){
    this.billingAddressIsSelected = true;
    this.db.Address.load(billAddressId).then((billAddress)=>{
      this.selectedBillingAddressId = billAddress.key;
      this.billingAddress={
          line1:billAddress.Address_1,
          line2:billAddress.Address_2,
          line3:billAddress.Address_3,
          line4:billAddress.Address_4,
          county:billAddress.County,
          postCode:billAddress.Postcode,
          country:billAddress.Country
        }
    });
  }
  selectedDelivAddress(delivAddressId:string){
    this.deliveryAddressIsSelected = true;
    this.db.Address.load(delivAddressId).then((delivAddress)=>{
      this.selectedDeliveryAddressId = delivAddress.key; 
      this.deleveryAddress={
          line1:delivAddress.Address_1,
          line2:delivAddress.Address_2,
          line3:delivAddress.Address_3,
          line4:delivAddress.Address_4,
          county:delivAddress.County,
          postCode:delivAddress.Postcode,
          country:delivAddress.Country
        }
    });
  }
  emptyAddress(target:string){
    if(target === "deliv"){
      this.deleveryAddress={
          line1:'',
          line2:'',
          line3:'',
          line4:'',
          county:'',
          postCode:'',
          country:''
        }
    }else{
      this.billingAddress={
          line1:'',
          line2:'',
          line3:'',
          line4:'',
          county:'',
          postCode:'',
          country:''
        }
    }
  }
  // continue(){
  //   this.slidesNumber++;
  //   setTimeout(()=> {
  //     this.slides.slideNext();
  //   }, 20);
  // }
  // backSlide(){
  //   this.slides.slidePrev();
  //   this.slidesNumber--;
  // }
  showLoginModal(){
    // Get the modal
      var modal = document.getElementById('myModal');

      // Get the button that opens the modal
      // var btn = document.getElementById("myBtn");

      // Get the <span> element that closes the modal
      var span = document.getElementsByClassName("close")[0];


      // When the user clicks on the button, open the modal 
      modal.style.display = "block";
      
      // When the user clicks on <span> (x), close the modal
      span.addEventListener("click",function() {
          modal.style.display = "none";
      });

      // When the user clicks anywhere outside of the modal, close it
      window.onclick = function(event) {
          if (event.target == modal) {
              modal.style.display = "none";
          }
      }
      
  }
  showToast(msg) {
    let toast = this.toastCtrl.create({
        message: msg,
        duration: 3000,
        position: 'top'
      });
    toast.present();
    }
  signUpRandom(){
    this.db.User.register(this.signUp.value.username,Math.random.toString()).then(user=>{
      if(user){
        this.loggedInService.refreshSubscription();
        console.log("registered successfully",user);
        this.showToast("Signed Up Successfully");
        setTimeout(()=> {
          this.next();
        }, 10);
      }
    }).catch(error=>this.showToast(error.message));
  }

  alertError(){
    let alert = this.alertCtrl.create({
      title: 'Weak Password!',
      message: 'Password must have a minimum of 8 characters with at least 1 upper case letter and 1 number.',
      buttons: ['OK']
    });
    alert.present();
  }

  login(){
    if(!this.loginForm.controls.password.valid){
      this.alertError();
      return;
    }
    let loading = this.loadingCtrl.create({
      content: 'Loading please wait...'
    });

    loading.present();
    this.db.User.login(this.loginForm.value.username,this.loginForm.value.password).then(user=>{
      console.log(user);
      var modal = document.getElementById('myModal');
      modal.style.display = "none";
      this.loggedInService.refreshSubscription();
        console.log("logged in successfully",user);
        this.showToast("Logged In Successfully");

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
        }).then(()=>{
          setTimeout(()=> {
            this.db.Basket.find().where({
                "UserID": { "$eq": this.db.User.me.key },
                "Ordered":{ "$eq": false}
            }).resultList(basket=>{
              let tempOItems = [];
              basket.forEach(b => {
                let tempItem ={
                  VegId:b.VegId,
                  price:b.VegPrice,
                  VegQuantity:b.VegQuantity,
                  ShopId:b.ShopId,
                  basketItemId:b.key
                };
                tempOItems.push(tempItem);
              });
              console.log("temp order items ",tempOItems);
              this.orderItems = null;
              this.orderItems = tempOItems;
              console.log("real order items ",this.orderItems);
              this.next();
            });
            loading.dismiss();
          }, 350);
        });
        
    }).catch(error=>{this.showToast(error.message);loading.dismiss();});
  }
  next(){
    this.navCtrl.push(DeliveryPage,{orderAmount:this.orderAmount,orderItems:this.orderItems});
  }
  goToDelivery(){
    this.next();
  }
   goToSettings(){
    this.navCtrl.push(AccountPage,{hideMenuBtn:true});
  }
}
