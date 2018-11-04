import { DBReady } from './../../../app/db.service';
import { model } from 'baqend';
import { baqend } from 'baqend';
import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';

/**
 * Generated class for the UpdateUserPayAddressPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
  selector: 'page-update-user-pay-address',
  templateUrl: 'update-user-pay-address.html',
})
export class UpdateUserPayAddressPage {
  payAddressForm:any={
    address_1:'',
    address_2:'',
    address_3:'',
    address_4:'',
    county:'',
    postcode:'',
    country:'UK',
  };
  db: baqend;
  userPayAddress:model.Address;
  constructor(public navCtrl: NavController,private ready:DBReady,
    public loadingCtrl: LoadingController, public navParams: NavParams) {
    let address:model.Address = navParams.get("address");
    this.userPayAddress = address;
     if(address){
      this.payAddressForm={
        address_1:address.Address_1,
        address_2:address.Address_2,
        address_3:address.Address_3,
        address_4:address.Address_4,
        county:address.County,
        postcode:address.Postcode,
        country:address.Country,
      };
    }else{
      this.payAddressForm={
        address_1:'',
        address_2:'',
        address_3:'',
        address_4:'',
        county:'',
        postcode:'',
        country:'UK',
      };
    }
  }

  ionViewCanEnter(){
    // Check if the Baqend SDK is ready and wait for initialization
    return this.ready.resolve().then(db => {
      this.db = db
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UpdateUserPayAddressPage');
  }
  updatePayAddress(){
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    loading.present();
    this.userPayAddress.Address_1 = this.payAddressForm.address_1;
    this.userPayAddress.Address_2 = this.payAddressForm.address_2;
    this.userPayAddress.Address_3 = this.payAddressForm.address_3;
    this.userPayAddress.Address_4 = this.payAddressForm.address_4;
    this.userPayAddress.County = this.payAddressForm.county;
    this.userPayAddress.Postcode = this.payAddressForm.postcode;
    this.userPayAddress.Country = this.payAddressForm.country;
    this.userPayAddress.UserId = this.db.User.me.key;
    this.userPayAddress.Type = 2;
    this.userPayAddress.update().then(address=>{
      console.log("Payment address has been updated",address);
      loading.dismiss();
      this.navCtrl.pop();
    }).catch(error=>{
      console.log("error happened while updating Payment address",error);
      loading.dismiss();
    });
  }

  checkAddressForm(){
    if(this.payAddressForm.address_1 === '' && this.payAddressForm.address_2 === '' && this.payAddressForm.address_3 === '' && this.payAddressForm.address_4 === '' ){
      return false;
    }
    if(this.payAddressForm.county === ''){
      return false;
    }
    let regPostcode = /^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z])))) [0-9][A-Za-z]{2})$/;
    if(this.payAddressForm.postcode){
      if(!regPostcode.test(this.payAddressForm.postcode)){
        return false;
      }
    }
    if(this.payAddressForm.postcode === ''){
      return false;
    }
    if(this.payAddressForm.country === ''){
      return false;
    }
    return true;
  }
}
