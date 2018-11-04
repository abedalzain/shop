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
  selector: 'page-add-new-user-address',
  templateUrl: 'add-new-user-dilevery-address.html',
})
export class AddNewUserDeliverAddressPage {
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
  newAddress:model.Address;
  constructor(public navCtrl: NavController,private ready:DBReady,
    public loadingCtrl: LoadingController, public navParams: NavParams) {
    
  }

  ionViewCanEnter(){
    // Check if the Baqend SDK is ready and wait for initialization
    return this.ready.resolve().then(db => {
      this.db = db
      this.addressForm={
            address_1:'',
            address_2:'',
            address_3:'',
            address_4:'',
            county:'',
            postcode:'',
            country:'UK',
          };
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
    this.newAddress = new this.db.Address();
    this.newAddress.Address_1 = this.addressForm.address_1;
    this.newAddress.Address_2 = this.addressForm.address_2;
    this.newAddress.Address_3 = this.addressForm.address_3;
    this.newAddress.Address_4 = this.addressForm.address_4;
    this.newAddress.County = this.addressForm.county;
    this.newAddress.Postcode = this.addressForm.postcode;
    this.newAddress.Country = this.addressForm.country;
    this.newAddress.UserId = this.db.User.me.key;
    this.newAddress.Type = 1;
    this.newAddress.save().then(address=>{
      console.log("address has been saved",address);
      loading.dismiss();
      this.navCtrl.pop();
    }).catch(error=>{
      console.log("error happened while saving address",error);
      loading.dismiss();
    });
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
