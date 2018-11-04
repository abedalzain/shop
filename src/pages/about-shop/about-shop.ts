import { AccountPage } from './../account/account';
import { BasketSizeService } from './../../app/basket.service';
import { HomePage } from './../home/home';
import { model } from 'baqend';
import { baqend } from 'baqend';
import { DBReady } from './../../app/db.service';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the AboutShopPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
  selector: 'page-about-shop',
  templateUrl: 'about-shop.html',
})
export class AboutShopPage {
  db: baqend;
  shopId:string = '';
  shop:model.Shops;
  constructor(public navCtrl: NavController,private ready: DBReady,private basketService:BasketSizeService, public navParams: NavParams) {
    this.shopId = navParams.get('shopId');
  }
  moveToHome(){
    this.navCtrl.setRoot(HomePage);
  }
  ionViewCanEnter(){
    // Check if the Baqend SDK is ready and wait for initialization
    return this.ready.resolve().then(db => {
      this.db = db
      this.getShop();
      if(this.db.User.me){
        this.basketService.getBasketFromServer(this.db,this.db.User.me.key);
      }else{
        this.basketService.getBasketFromLocal();
      }
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AboutShopPage');
    
  }
  getShop(){
    this.db.Shops.load(this.shopId).then(shop=>{
      this.shop = shop;
    },error=>{
      console.log(error);
    });
  }

   goToSettings(){
    this.navCtrl.push(AccountPage,{hideMenuBtn:true});
  }

}
