import { AccountPage } from './../account/account';
import { SearchQuery } from './../../app/search.service';
import { BasketSizeService } from './../../app/basket.service';
import { HomePage } from './../home/home';
import { Component, NgZone, ViewChild } from '@angular/core';
import { NavController, AlertController, NavParams, Navbar } from 'ionic-angular';
import { baqend, model,GeoPoint } from "baqend";
import { DBReady } from '../../app/db.service';
import { AddShopPage } from "../addshop/addshop";
import { ShopPage } from "../shop/shop";

@Component({
  selector: 'page-shops',
  templateUrl: 'shops.html'
})
export class ShopsPage {
  @ViewChild(Navbar) navBar: Navbar;
  db: baqend;
  shops: Array<model.Shops>;
  placeId;
  queryText:string;
  place;
  geocoder = new google.maps.Geocoder();
  lng:number;
  lat:number;
  result:Array<Array<any>> =[];
  constructor(private zone: NgZone,private ready: DBReady,private searchServ:SearchQuery,
              private navCtrl: NavController,private alertCtrl: AlertController,
              private navParams:NavParams, private basketService:BasketSizeService) {
    this.placeId = navParams.get("placeId");
    this.lat = navParams.get("latitude");
    this.lng = navParams.get("longitude");
    
    this.place = {
      name: '',
      geoLocation:'',
      id:''
    };
  }
  viewShop(shop){
      this.navCtrl.push(ShopPage, { id: shop.key });
  }
  ionViewCanEnter() {
    // Check if the Baqend SDK is ready and wait for initialization
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
    
    this.getShopsWithPlaceId();
    this.navBar.backButtonClick = (e:UIEvent)=>{
     // todo something
     this.navCtrl.setRoot(HomePage);
    }
  }
  getShopsWithPlaceId(id?:any){
    let placeId ;
    if(id){
      placeId=id;
    }else{
      placeId = this.placeId;
    }
    this.db.Shops.find().where({
        "PlaceID": { "$eq": placeId}
      }).resultList(Shops=>{
        if(Shops.length>0){
          this.shops =[];
          this.shops = Shops;
          this.result = new Array();
          let gPoint:GeoPoint = new GeoPoint();
          gPoint.latitude = this.lat;
          gPoint.longitude = this.lng;
          this.result.push([Math.round(gPoint.milesTo(Shops[0].Location)),Shops[0]]);
        }else{
          this.getNearestTenShops();
        }
      });
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
        this.lat = lat;
        this.lng = lng;
        this.searchServ.selectedPlace ={
          placeId:place.place_id,
          lat:lat,
          lng:lng
        }
      });
      // this.placeId = place.place_id;
    });
    this.getShopsWithPlaceId(place.place_id);
  }
  addShop(){
    this.navCtrl.push(AddShopPage);
  }
  editShop(shop){
    this.navCtrl.push(AddShopPage,{ id: shop.key });
  }
  deleteShop(shop:model.Shops){
  let alert = this.alertCtrl.create({
    title: 'Confirm Deletion',
    message: 'Do you want to delete this item?',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      },
      {
        text: 'Delete',
        handler: () => {
          shop.delete().then(()=>{
            console.log("shop deleted successfully");
          }).catch((error)=>{
            console.log(error);
          });
          this.getAllShops();
        }
      }
    ]
  });
  alert.present();
  }
  getAllShops(){
    this.db.Shops
    .find()
      .resultList(shops => {this.shops = shops;});
  }
  getNearestTenShops(){
    let gPoint:GeoPoint = new GeoPoint();
    gPoint.latitude = this.lat;
    gPoint.longitude = this.lng;
    this.db.Shops
      .find()
      .near('Location', gPoint , 100000)
      .limit(10)
      .resultList(shops=>{
          console.log(shops);
          this.shops = [];
          this.shops = shops;
          this.result = new Array(shops.length);
          for (var i = 0; i < shops.length; i++) {
            var shop = shops[i];
            let a:Array<any> = [Math.round(gPoint.milesTo(shop.Location)),shop]
            this.result[i] = a;
          }
          // shops.forEach(shop => {
          //   this.result[i][0].push(gPoint.milesTo(shop.Location));
          //   this.result[1].push(shop);
          // });
          
      }).then(()=>{
        this.result.sort((n1,n2) => {
              if (n1[0] > n2[0]) {
                  return 1;
              }

              if (n1[0] < n2[0]) {
                  return -1;
              }

              return 0;
          });
      });
  }
  moveToHome(){
    this.navCtrl.setRoot(HomePage);
  }
   goToSettings(){
    this.navCtrl.push(AccountPage,{hideMenuBtn:true});
  }
}
