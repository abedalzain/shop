import { AccountPage } from './../account/account';
import { SearchQuery } from './../../app/search.service';
import { BasketSizeService } from './../../app/basket.service';
import { ShopPage } from './../shop/shop';
import { Storage } from '@ionic/storage';
import { Geolocation } from '@ionic-native/geolocation';

import { DBReady } from './../../app/db.service';
import { baqend,model } from 'baqend';
import { ShopsPage } from './../shops/shops';
import {Component, NgZone} from '@angular/core';

import { NavController, ToastController } from 'ionic-angular';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  place;
  geocoder = new google.maps.Geocoder();
  db: baqend;
  ChosenShop:model.Shops;
  constructor(private navCtrl: NavController,
              private zone: NgZone,
              private ready: DBReady,
              private storage:Storage,
              private toast:ToastController,
              private searchServ:SearchQuery,
              private basketService:BasketSizeService,
              private geolocation: Geolocation) {
    this.place = {
      name: '',
      geoLocation:'',
      id:''
    };
    // console.log(this.navCtrl.getPrevious().component);
    // if(this.navCtrl.getPrevious().component == ShopPage){
    //   console.log("shop page true");
    // }else{
    //   console.log(this.navCtrl.getPrevious().component);
    // }
    console.log(this.navCtrl.parent);
    
    
  }
  moveToHome(){
    this.navCtrl.setRoot(HomePage);
  }
   goToSettings(){
    this.navCtrl.push(AccountPage,{hideMenuBtn:true});
  }

  ionViewCanEnter() {
    // Check if the Baqend SDK is ready and wait for initialization
    return this.ready.resolve().then(db => {
      this.db = db;
      let user = this.db.User.me;
      if(user){
        if(user.ChosenShop){
          this.db.Shops.load(user.ChosenShop).then((shop)=>{
              this.ChosenShop = shop;
            });
        }
        this.basketService.getBasketFromServer(this.db,user.key);
        console.log(this.basketService.basketSize);
        
      }else{
        this.storage.get("ChosenShop").then((ChosenShop)=>{
          if(ChosenShop !=null && ChosenShop.length){
            this.db.Shops.load(ChosenShop).then((shop)=>{
              this.ChosenShop = shop;
            });
          }
        });
        this.basketService.getBasketFromLocal();
        console.log(this.basketService.basketSize);
      }
    });
  }
  ionViewDidLoad(){
    
  }
  
  onChosenPlace(place){
    this.place.name = place.description;
    this.place.id = place.place_id;
    this.geocoder.geocode({
      'placeId': place.place_id,
    },results => {
      console.log(results);
      
      this.zone.run(() => {
        const lat = results[0].geometry.location.lat();
        const lng = results[0].geometry.location.lng();
        this.place.geoLocation = lat+" "+lng ;
        this.searchServ.selectedPlace ={
          placeId:place.place_id,
          lat:lat,
          lng:lng
        }
        // this.getShopsWithPlaceId(place.place_id,lat,lng);
      });
      
    });
    
  }

  getShopsWithPlaceId(){
    if(this.searchServ.selectedPlace){
      this.db.Shops.find().where({
        "PlaceID": { "$eq": this.searchServ.selectedPlace.placeId }
      }).resultList(Shops=>{
        this.navCtrl.push(ShopsPage,{placeId:this.searchServ.selectedPlace.placeId,latitude:this.searchServ.selectedPlace.lat,longitude:this.searchServ.selectedPlace.lng});
      });
    }else{
      let alert = this.toast.create({message:"Please enter a UK post code",position:"top",duration:2000});
      alert.present();
    }
    
  }
  goToChosenShop(){
    this.navCtrl.push(ShopPage,{id:this.ChosenShop.key});
  }
}
