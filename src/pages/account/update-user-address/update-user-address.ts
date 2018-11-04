import { DBReady } from './../../../app/db.service';
import { baqend, model } from 'baqend';
import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';

/**
 * Generated class for the UpdateUserAddressPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
  selector: 'page-update-user-address',
  templateUrl: 'update-user-address.html',
})
export class UpdateUserAddressPage {
  addressForm:any={
    address_1:'',
    address_2:'',
    address_3:'',
    address_4:'',
    county:'',
    postcode:'',
    country:'UK',
  };
  db: baqend;
  userAddress:model.Address;
  addressKey:string;
  constructor(public navCtrl: NavController,private ready:DBReady,
    public loadingCtrl: LoadingController, public navParams: NavParams) {
    if(navParams.get("addressKey")){
      this.addressKey = navParams.get("addressKey");
    }else{
      this.addressKey = this.db.User.me.AddressId;
    }
  }

  ionViewCanEnter(){
    // Check if the Baqend SDK is ready and wait for initialization
    return this.ready.resolve().then(db => {
      this.db = db
      this.db.Address.load(this.addressKey).then(address=>{
        this.userAddress = address;
        if(address){
          this.addressForm={
            address_1:address.Address_1,
            address_2:address.Address_2,
            address_3:address.Address_3,
            address_4:address.Address_4,
            county:address.County,
            postcode:address.Postcode,
            country:address.Country,
          };
        }else{
          this.addressForm={
            address_1:'',
            address_2:'',
            address_3:'',
            address_4:'',
            county:'',
            postcode:'',
            country:'UK',
          };
        }
      });
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UpdateUserAddressPage');
  }

  updateAddress(){
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    loading.present();
    if(this.userAddress != null){
      this.userAddress.Address_1 = this.addressForm.address_1;
      this.userAddress.Address_2 = this.addressForm.address_2;
      this.userAddress.Address_3 = this.addressForm.address_3;
      this.userAddress.Address_4 = this.addressForm.address_4;
      this.userAddress.County = this.addressForm.county;
      this.userAddress.Postcode = this.addressForm.postcode;
      this.userAddress.Country = this.addressForm.country;
      this.userAddress.UserId = this.db.User.me.key;
      this.userAddress.Type = 1;
      this.userAddress.update().then(address=>{
        console.log("address has been updated",address);
        loading.dismiss();
        this.navCtrl.pop();
      }).catch(error=>{
        console.log("error happened while updating address",error);
        loading.dismiss();
      });
    }else{
      this.userAddress = new this.db.Address();
      this.userAddress.Address_1 = this.addressForm.address_1;
      this.userAddress.Address_2 = this.addressForm.address_2;
      this.userAddress.Address_3 = this.addressForm.address_3;
      this.userAddress.Address_4 = this.addressForm.address_4;
      this.userAddress.County = this.addressForm.county;
      this.userAddress.Postcode = this.addressForm.postcode;
      this.userAddress.Country = this.addressForm.country;
      this.userAddress.UserId = this.db.User.me.key;
      this.userAddress.save().then(address=>{
        console.log("address has been saved",address);
        this.db.User.me.AddressId = address.key;
        this.db.User.me.update().then(user=>{
          console.log("new address added to the user",user); 
          loading.dismiss();
          this.navCtrl.pop();
        }).catch(err=>{
          console.log("error happened updating user",err);
          loading.dismiss();
        });
      }).catch(error=>{
        console.log("error happened while saving address",error);
        loading.dismiss();
      });
    }
  }
  setAddressAsDefaultAddress(){
    if(this.userAddress != null){
      let loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });
      loading.present();
      this.db.User.me.AddressId = this.userAddress.key;
      this.db.User.me.update().then(user=>{
        console.log("user default address has been updated successfully",user);
        loading.dismiss(); 
      }).catch(error=>{
        console.log("error while updating default address",error); 
        loading.dismiss();        
      })
    }
  }
  checkAddressForm(){
    if(this.addressForm.address_1 === '' && this.addressForm.address_2 === '' && this.addressForm.address_3 === '' && this.addressForm.address_4 === '' ){
      return false;
    }
    if(this.addressForm.county === ''){
      return false;
    }
    let regPostcode = /^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z])))) [0-9][A-Za-z]{2})$/;
    if(this.addressForm.postcode){
      if(!regPostcode.test(this.addressForm.postcode)){
        return false;
      }
    }
    if(this.addressForm.postcode === ''){
      return false;
    }
    if(this.addressForm.country === ''){
      return false;
    }
    return true;
  }
}
