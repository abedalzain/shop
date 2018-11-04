import { AccountPage } from './../account/account';
import { BasketSizeService } from './../../app/basket.service';
import { baqend } from 'baqend';
import { DBReady } from './../../app/db.service';
import { HomePage } from './../home/home';
import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';

/**
 * Generated class for the AboutPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
})
export class AboutPage {
  db:baqend;
  screenWidth:number;
  constructor(public navCtrl: NavController, private ready:DBReady ,
    public navParams: NavParams,private platform:Platform,private basketService:BasketSizeService) {
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
    console.log('ionViewDidLoad AboutPage');
  }
  moveToHome(){
    this.navCtrl.setRoot(HomePage);
  }

   goToSettings(){
    this.navCtrl.push(AccountPage,{hideMenuBtn:true});
  }
}
