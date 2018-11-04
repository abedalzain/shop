import { BasketPage } from './../basket/basket';
import { AccountPage } from './../account/account';
import { Storage } from '@ionic/storage';
import { LoggedIn } from './../../app/loggedin.service';
import { GlobalValidator } from './../../app/global.validator';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BasketSizeService } from './../../app/basket.service';
import { AddressPage } from './../address/address';
import { DBReady } from './../../app/db.service';
import { model,baqend } from 'baqend';
import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Navbar, ToastController, LoadingController } from 'ionic-angular';

/**
 * Generated class for the DeliveryPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-delivery',
  templateUrl: 'delivery.html',
})
export class DeliveryPage {
  @ViewChild(Navbar) navBar: Navbar;
  contactForm: FormGroup;
  showForm: boolean = false;
  orderItems: Array<JSON>;
  db: baqend;
  userAddrss:model.Address;
  deleveryAddress:any={
    line1:'',
    line2:'',
    line3:'',
    line4:'',
    county:'',
    postCode:'',
    country:'UK'
  };
  deliveryAddressIsSelected:boolean = false;
  selectedDeliveryAddressId: string;
  prevDeliveryAddresses:Array<model.Address>;
  modelDeliveryAddress:model.Address;
  delAddress:any;
  // fromNavBillAddressId:string;
  // isSameAddress:boolean = false;
  orderAmount:number;
  constructor(public navCtrl: NavController,private ready: DBReady, private fb:FormBuilder,
    public navParams: NavParams,private basketService:BasketSizeService,
    private storage:Storage,private loadingCtrl:LoadingController,
    private loggedInService:LoggedIn,private toastCtrl:ToastController) {

    this.orderAmount = navParams.get("orderAmount");
    console.log(this.orderAmount);
    
    // if(navParams.get("billAddress")){
    //   this.fromNavBillAddressId = navParams.get("billAddress")
    // }else{
    //   this.fromNavBillAddressId = "";
    // }
    // if(navParams.get("sameAddress")){
    //   let same = navParams.get("sameAddress");
    //   if(same){
    //     this.isSameAddress = true;
    //   }
    // }
    if(navParams.get("orderItems")){
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
        this.db.Orders.find().where({
          "UserID": { "$eq": this.db.User.me.key }
        }).resultList(orders=>{
          if(orders.length > 0 && orders != null){
            this.prevDeliveryAddresses = new Array();
            orders.forEach(order => {
              this.db.Address.load(order.DeliveryAddressId).then(deliveryAddress=>{
                this.prevDeliveryAddresses.push(deliveryAddress);
              });
            });
          } 
        });
        this.db.Address.load(this.db.User.me.AddressId).then(address=>{
          if(address != null){
            this.userAddrss = address;
            this.selectedDeliveryAddressId = address.key;
            this.selectDefaultAddress();
          }
        }).catch(error=>{
          console.log(error);         
        });
        this.toggleForm();
      }else{
        this.contactForm = this.fb.group({
          fName:['',Validators.required],
          lName:['',Validators.required],
          email: ['', Validators.compose([Validators.email,Validators.required,GlobalValidator.mailFormat])],
          phone:['',Validators.compose([
                    Validators.required,
                    Validators.pattern(/^\s*\(?(020[7,8]{1}\)?[ ]?[1-9]{1}[0-9{2}[ ]?[0-9]{4})|(0[1-8]{1}[0-9]{3}\)?[ ]?[1-9]{1}[0-9]{2}[ ]?[0-9]{3})\s*$/),
                    ])
              ]
        });

        this.basketService.getBasketFromLocal();
      }
    });
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad DeliveryPage');
     this.navBar.backButtonClick = (e:UIEvent)=>{
     // todo something
     this.navCtrl.setRoot(BasketPage,{showMenuBtn:true});
    }
  }
  emptyAddress(){
     this.deleveryAddress={
        line1:'',
        line2:'',
        line3:'',
        line4:'',
        county:'',
        postCode:'',
        country:'UK'
      }
  }
selectAndContinue(delivAddressId:string){
  this.deliveryAddressIsSelected = true;
  this.db.Address.load(delivAddressId).then((delivAddress)=>{
    this.selectedDeliveryAddressId = delivAddress.key; 
    this.continue();
  });
}
back(){
  this.navCtrl.pop();
}
showToast(msg) {
  let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'top'
    });
  toast.present();
  }
continue(){
  console.log(this.deliveryAddressIsSelected);
  if(this.deliveryAddressIsSelected){
    this.navCtrl.push(AddressPage,{delAddress:this.selectedDeliveryAddressId,orderAmount:this.orderAmount,orderItems:this.orderItems});
  }else{
    this.modelDeliveryAddress = new this.db.Address();
    this.modelDeliveryAddress.Address_1 = this.deleveryAddress.line1;
    this.modelDeliveryAddress.Address_2 = this.deleveryAddress.line2;
    this.modelDeliveryAddress.Address_3 = this.deleveryAddress.line3;
    this.modelDeliveryAddress.Address_4 = this.deleveryAddress.line4;
    this.modelDeliveryAddress.County = this.deleveryAddress.county;
    this.modelDeliveryAddress.Postcode = this.deleveryAddress.postCode;
    this.modelDeliveryAddress.Country = this.deleveryAddress.country;
    this.modelDeliveryAddress.Type = 1;
    if(this.db.User.me){
      this.modelDeliveryAddress.UserId = this.db.User.me.key;
      console.log("user is signed in and address user id ",this.modelDeliveryAddress.UserId);      
    }
    this.modelDeliveryAddress.save().then(address=>{
      let loading = this.loadingCtrl.create({
          content: 'Loading please wait...'
        });

        loading.present();
      if(!this.db.User.me || !this.db.User.me.AddressId){
        if(!this.db.User.me){
            console.log("no user logged in");
            let user:model.User = new this.db.User();
            user.Name = this.contactForm.value.fName+" "+this.contactForm.value.lName;
            user.Phone = this.contactForm.value.phone;
            user.AddressId = address.key;
            user.username = this.contactForm.value.email;
            this.db.User.register(user,Math.random().toString()).then(u=>{
              if(u){
                this.loggedInService.refreshSubscription();
                console.log("registered successfully",u);
                this.showToast("Signed Up Successfully");
                this.modelDeliveryAddress.UserId = u.key;
                this.modelDeliveryAddress.update().then(a=>{
                  console.log("address updated with user Id",a);

                  this.storage.get('basket').then((data)=>{
                    if(data != null){
                      if(data.length > 0 ){
                        data.forEach(basketItem => {
                          let bItem:model.Basket = new this.db.Basket();
                          bItem.VegId = basketItem.VegId;
                          bItem.VegPrice = basketItem.VegPrice;
                          bItem.VegQuantity = basketItem.VegQuantity;
                          bItem.UserID = u.key;
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
                          this.navCtrl.push(AddressPage,{delAddress:address.key,orderAmount:this.orderAmount,orderItems:this.orderItems});
                        });
                        loading.dismiss();
                    }, 300);
                  });
                }).catch(error=>{
                  console.log("error happened while updating address with user id",error);   
                  loading.dismiss();               
                });

                
              }
            }).catch(error=>{
              this.showToast(error.message);
              loading.dismiss();
            });
        }
        if(this.db.User.me && !this.db.User.me.AddressId){
          console.log("no user address");          
          this.db.User.me.AddressId = address.key;
          this.db.User.me.update(user=>{
            console.log("user updated with the new Address",user);
            loading.dismiss();
            this.navCtrl.push(AddressPage,{delAddress:address.key,orderAmount:this.orderAmount,orderItems:this.orderItems});
          }).catch(error=>{
            console.log("error while updating user address",error);   
            loading.dismiss();         
          });
        }
      }else{
        loading.dismiss();
        this.navCtrl.push(AddressPage,{delAddress:address.key,orderAmount:this.orderAmount,orderItems:this.orderItems});
      }
    });
  }
  
  
}
toggleForm(){
  this.showForm = !this.showForm;
  this.deliveryAddressIsSelected = !this.deliveryAddressIsSelected;
  if(this.selectedDeliveryAddressId){
    this.emptyAddress();
  }
}
selectDelAddress(i){
  this.deliveryAddressIsSelected = true;
  this.selectedDeliveryAddressId = this.prevDeliveryAddresses[i].key;
}
selectDefaultAddress(){
  this.deliveryAddressIsSelected = true;
  this.selectedDeliveryAddressId = this.userAddrss.key;
}
goToSettings(){
  this.navCtrl.push(AccountPage,{hideMenuBtn:true});
}
checkDeliverAddressNotEmpty(){
  if(this.deleveryAddress.line1 ==='' && this.deleveryAddress.line2 === '' && this.deleveryAddress.line3 === '' && this.deleveryAddress.line4 === ''){
    return false;
  }
  if(this.deleveryAddress.county === ''){
    return false;
  }
  let regPostcode = /^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z])))) [0-9][A-Za-z]{2})$/;
  if(this.deleveryAddress.postCode){
    if(!regPostcode.test(this.deleveryAddress.postCode)){
      return false;
    }
  }
  if(this.deleveryAddress.postCode === '' ){
    return false;
  }
  if(this.deleveryAddress.country === ''){
    return false;
  }  
  return true;
}

}
