import { AccountPage } from './../account/account';
import { ShopPage } from './../shop/shop';
import { HomePage } from './../home/home';
import { OrderPage } from './../order/order';
import { Storage } from '@ionic/storage';
import { model } from 'baqend';
import { baqend } from 'baqend';
import { DBReady } from './../../app/db.service';
import { Component } from '@angular/core';
import { NavController, Platform, NavParams } from 'ionic-angular';

/**
 * Generated class for the BasketPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
  selector: 'page-basket',
  templateUrl: 'basket.html',
})
export class BasketPage {
  shopId: string;
  db: baqend;
  userId:any;
  basket:Array<any>;
  vegs:Array<model.Veg>;
  totalPrice:number =0;
  screenWidth:number;
  showMenuBtn:boolean = false;
  constructor(private ready: DBReady,public navCtrl: NavController,private navParams:NavParams,
    private storage:Storage,private platform:Platform) {
   this.screenWidth = this.platform.width();
   if(navParams.get("showMenuBtn")){
     this.showMenuBtn = navParams.get("showMenuBtn");
   }
  }

  ionViewCanEnter() {
    // Check if the Baqend SDK is ready and wait for initialization
    return this.ready.resolve().then(db => {
      this.db = db;
      let user = this.db.User.me;
      this.getBasketItems();
    });
  }

  ionViewDidLoad() {
     
    console.log('ionViewDidLoad PaymentPage');
    
  }
  removeBasketItem(basket:any,id){
    if(this.db.User.me){
      basket.delete().then(()=>{
        this.getBasketItems();
      });
    }else{
      this.basket.splice(id,1);
      this.storage.remove('basket').then(()=>{
        this.storage.set('basket',this.basket).then(()=>{
          this.getBasketItems();
        })
      })
    }
    
  }
  getBasketItems(){
    if(this.db.User.me){
      this.db.Basket.find().where({
          "UserID": { "$eq": this.db.User.me.key },
          "Ordered":{ "$eq": false}
        }).resultList(basket=>{
          if(basket.length > 0){
            this.shopId = basket[0].ShopId;
            this.basket = basket;
            console.log(basket);
            this.vegs = new Array<model.Veg>();
            this.totalPrice =0;
            basket.forEach(b => {
              this.db.Veg.load(b.VegId).then(veg=>{
                this.vegs.push(veg);
                let itemCost = b.VegPrice * b.VegQuantity;
                this.totalPrice += itemCost; 
              })
            });
          }
          
      });
    }else{
      this.storage.get('basket').then((data)=>{
        if(data == null){
          this.basket = [];
        }else{
          if(data.length > 0){
            this.shopId = data[0].ShopId;
            this.basket = data;
            this.vegs = new Array<model.Veg>();
            this.totalPrice =0;
            this.basket.forEach(b => {
              this.db.Veg.load(b.VegId).then(veg=>{
                this.vegs.push(veg);
                let itemCost = b.VegPrice * b.VegQuantity;
                this.totalPrice += itemCost; 
              });
            });
          }
        }
      });
    }
    
  }

  increaseToSizeIndex(id,event,basketItem:any){
    event.stopPropagation();
    if(this.db.User.me){
      basketItem.VegQuantity++;
      basketItem.update().then(baske=>{
        console.log("basket item quantity increased");
      },error=>{
        console.log(error);
      });
      this.getBasketItems();
    }else{
      let tempBasket = new Array();
      this.basket.forEach(b => {
        tempBasket.push(b);
      });
      tempBasket[id].VegQuantity++;
      this.storage.remove('basket').then(()=>{
        this.storage.set('basket',tempBasket).then(()=>{
          this.getBasketItems();
        });
      });
    }
    
  }
  decreaseToSizeIndex(id,event,basketItem:any){
    event.stopPropagation();
    if(this.db.User.me){
      if(basketItem.VegQuantity >1){
        basketItem.VegQuantity--;
        basketItem.update().then(baske=>{
          console.log("basket item quantity increased");
        },error=>{
          console.log(error);
        });
      }else{
        if(basketItem.VegQuantity == 1 ){
          this.removeBasketItem(basketItem,id);
        }
      }
      this.getBasketItems();
    }else{
      let tempBasket =new Array();
      this.basket.forEach(b => {
        tempBasket.push(b);
      });
      if(basketItem.VegQuantity >1){
        tempBasket[id].VegQuantity--;
        this.storage.remove('basket').then(()=>{
          this.storage.set('basket',tempBasket).then(()=>{
            this.getBasketItems();
          });
        });
      }else{
        if(basketItem.VegQuantity == 1){
          tempBasket.splice(id,1);
          this.storage.remove('basket').then(()=>{
            this.storage.set('basket',tempBasket).then(()=>{
              this.getBasketItems();
            });
          });
        }
      }
      
    }
    
  }
  orderNow(){
    let amount = 0 ;
    console.log(this.basket);
    let orderItems = [];
    this.basket.forEach(b => {
      amount = this.totalPrice;
      if(this.db.User.me){
        orderItems.push({VegId:b.VegId,price:b.VegPrice,VegQuantity:b.VegQuantity,ShopId:b.ShopId,basketItemId:b.key});
      }else{
        orderItems.push({VegId:b.VegId,price:b.VegPrice,VegQuantity:b.VegQuantity,ShopId:b.ShopId});
      }
    });
    setTimeout(()=> {
      this.navCtrl.push(OrderPage,{amount:amount,orderItems:orderItems})
      .then((data)=>{console.log("data ",data,"amount",amount,"items",orderItems);})
      .catch(error=>{console.log("error",error,"amount",amount,"items",orderItems);});    
    }, 15);
  }
  moveToHome(){
    this.navCtrl.setRoot(HomePage);
  }
  goToOrderShop(){
    this.navCtrl.push(ShopPage,{id:this.shopId});
  }
  goToSettings(){
    this.navCtrl.push(AccountPage,{hideMenuBtn:true});
  }
}
