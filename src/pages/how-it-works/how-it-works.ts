import { AccountPage } from './../account/account';
import { baqend } from 'baqend';
import { BasketSizeService } from './../../app/basket.service';
import { DBReady } from './../../app/db.service';
import { HomePage } from './../home/home';
import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';

/**
 * Generated class for the HowItWorksPagePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-how-it-works',
  templateUrl: 'how-it-works.html',
})
export class HowItWorksPage {
  db:baqend;
  screenWidth:number;
  constructor(public navCtrl: NavController, public navParams: NavParams,
    private platform:Platform,private ready:DBReady,private basketService:BasketSizeService) {
    this.screenWidth = this.platform.width();
  }
  ionViewCanEnter(){
    return this.ready.resolve().then(db => {
      this.db = db
      if(this.db.User.me){
        this.basketService.getBasketFromServer(this.db,this.db.User.me.key);
      }else{
        this.basketService.getBasketFromLocal();
      }
    });
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad HowItWorksPage');
  }
  moveToHome(){
    this.navCtrl.setRoot(HomePage);
  }
   goToSettings(){
    this.navCtrl.push(AccountPage,{hideMenuBtn:true});
  }

}
