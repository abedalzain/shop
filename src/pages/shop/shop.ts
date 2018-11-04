import { AccountPage } from './../account/account';
import { BasketSizeService } from './../../app/basket.service';
import { Storage } from '@ionic/storage';
import { ShopService } from './../../app/shop.service';
import { AboutShopPage } from './../about-shop/about-shop';
import { Component } from '@angular/core';
import { NavParams, NavController, AlertController } from 'ionic-angular';
import { baqend, model } from "baqend";
import { DBReady } from '../../app/db.service';
import { HomePage } from "../home/home";

@Component({
  selector: 'page-shop',
  templateUrl: 'shop.html'
})
export class ShopPage {
  db: baqend;
  shop: model.Shops;
  vegs:Array<model.Veg>;
  size:any;
  prices:any;
  // basketSize:number = 0;
  basket:Array<any> = [];
  tempbasket:Array<any>;
  vegStock:Array<model.VegStock>;
  constructor(private ready: DBReady, private navParams: NavParams, 
              private shopService:ShopService,private storage:Storage,private alertCtrl:AlertController,
              private navCtrl: NavController,private basketService:BasketSizeService) {
   
  }

  ionViewCanEnter() {
    // Check if the Baqend SDK is ready and wait for initialization
    return this.ready.resolve().then(db => {
        this.db = db
       
    });
  }

  getImageUrl(shop) {
    // return new this.db.File(msg.face).url;
    return shop.Img;
  }

  ionViewWillEnter() {
    
  }
  ionViewDidLoad() {
    
    this.fetchItems();
    
  }
  fetchItems(){
    let id = this.navParams.get('id');
    this.db.Shops.load(id)
      .then(shop => {this.shop = shop});
      
    this.db.VegStock.find().where({
        "ShopID": { "$eq": id},
        "NumberInStock": {"$gt":0}
    }).resultList((vegStock)=>{
        this.vegStock = [];
        this.vegStock = vegStock;
        this.vegs = [];
        this.size = [];
        this.prices=[];
        for (var i = 0; i < vegStock.length; i++) {
            let vs = vegStock[i];
            this.size[i] =0;
            this.db.Veg.load(vs.VegID).then((veg)=>{
                this.vegs.push(veg);
                this.prices.push(vs.Price);
            });
        }
       
        setTimeout(()=> {
            this.getBasketSize();
        }, 50);
    });
  }

  presentConfirm() {
  let alert = this.alertCtrl.create({
    title: 'Empty Basket?',
    message: 'Your basket already contains items from another shop. Empty basket and continue?',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      },
      {
        text: 'Empty Basket',
        handler: () => {
          console.log('Empty Basket clicked');
          this.emptyBasket();
        }
      }
    ]
  });
  alert.present();
}
emptyBasket(){
    if(this.db.User.me){
        this.db.Basket.find().where({
              "UserID":{"$eq":this.db.User.me.key},
              "Ordered":{"$eq":false}
          }).resultList(basketItems=>{
                this.size = new Array<number>(this.vegStock.length);
                for (var j = 0; j < this.vegStock.length; j++) {
                    this.size[j]=0;
                }

                for (var i = 0; i < basketItems.length; i++) {
                var bItem = basketItems[i];
                bItem.delete().then(data=>{
                    console.log("basket item deleted",data);                      
                }).catch(error=>{
                    console.log("error deleting basket item",error);                      
                });
              }
            console.log("basket cleared for user ",this.db.User.me.key);  
            this.getBasketSize();             
          });
    }else{
        this.size = new Array<number>(this.vegStock.length);
        for (var j = 0; j < this.vegStock.length; j++) {
            this.size[j]=0;
        }
        this.storage.set('basket',[]).then(data=>{
            console.log('local basket is empty now',data);   
            this.getBasketSize();     
        }).catch(error=>{
            console.log(error);                
        });
    }
}
  increaseToSizeIndex(id){
    console.log(`vegStock[${id}]`,this.vegStock[id].NumberInStock);
    console.log(`size[${id}]`,this.size[id]);
    console.log(this.vegStock[id].NumberInStock > this.size[id]);

    if(this.db.User.me){
        let veg:model.Veg = this.vegs[id];
        console.log(veg);
        if(this.basket.length >= 1){
            for (var i = 0; i < this.basket.length; i++) {
                console.log("item number ",i);
                var b = this.basket[i];
                console.log(b);
                if(this.shop.key === b.ShopId){
                    if( veg.key === b.VegId ){
                            console.log("inside equality");
                            if(this.vegStock[id].NumberInStock > this.size[id] ){
                                b.VegQuantity++;
                                b.update().then(()=>{
                                    this.getBasketSize();
                                }); 
                                console.log(b);
                            }
                        break;
                    }else{
                        if(i == this.basket.length-1){
                            if(this.vegStock[id].NumberInStock > this.size[id] ){
                                console.log("one or more items in the basket ",veg);
                                let basket:model.Basket = new this.db.Basket();
                                basket.UserID = this.db.User.me.key;
                                basket.VegId = veg.key;
                                basket.VegPrice = veg.Price;
                                basket.ShopId = this.shop.key;
                                this.size[id]++;
                                basket.VegQuantity =  this.size[id];
                                basket.save().then(()=>{
                                    this.getBasketSize();
                                });
                            }                        
                        }
                    }
                }else{
                    this.presentConfirm();
                    break;
                }
            }
        }else{
            if(this.vegStock[id].NumberInStock > this.size[id] ){
                let veg:model.Veg = this.vegs[id];
                console.log("no items in basket ",veg);
                let basket:model.Basket = new this.db.Basket();
                basket.UserID = this.db.User.me.key;
                basket.VegId = veg.key;
                basket.VegPrice = veg.Price;
                basket.ShopId = this.shop.key;
                this.size[id]++;
                basket.VegQuantity = this.size[id];
                basket.save().then(()=>{
                    this.getBasketSize();
                }); 
            }
        }
    }else{
      
        this.storage.get('basket').then((localBasket:Array<model.Basket>)=>{
          // console.log("print all vegs ",this.vegs);
          console.log("print selected veg  ",this.vegs[id]);          
          
            if(localBasket == null){
                if(this.vegStock[id].NumberInStock > this.size[id] ){
                    console.log("fetched from local , ",localBasket);
                    let veg:model.Veg = this.vegs[id];
                    console.log("no items in basket ",veg);
                    let b:any = {};
                    b.VegId = veg.key;
                    b.VegPrice = veg.Price;
                    b.ShopId = this.shop.key;
                    this.size[id]++;
                    b.VegQuantity = this.size[id];
                    this.basket = [];
                    this.basket.push(b);

                    console.log("print b ",b);
                    console.log("print array ",this.basket);
                }                
            }else{
                this.basket = [];
                this.basket = localBasket;
                console.log("local basket ",localBasket);
                if(this.basket.length > 0){
                  this.tempbasket = new Array();
                  this.basket.forEach(b => {
                    this.tempbasket.push(b);
                  });
                  // this.tempbasket = this.basket;
                  for (var i = 0; i < this.basket.length; i++) {
                      var b:any= this.tempbasket[i];
                      console.log("current basket Item ",b);
                      console.log("selected veg id ",id);
                      if(this.shop.key === b.ShopId){
                        if(b.VegId === this.vegs[id].key ){
                            if(this.vegStock[id].NumberInStock > this.size[id] ){
                                console.log("inside equality","basket "+b.VegId ,"veg "+ this.vegs[id].key);
                                b.VegQuantity++;
                                this.size[id]++;
                                console.log("after update basket ",b);
                                break;
                            }
                        }else{
                            if(i == this.basket.length-1 ){
                                if(this.vegStock[id].NumberInStock > this.size[id] ){
                                    console.log("size is "+this.size[id]);
                                    let veg:model.Veg = this.vegs[id];
                                    console.log("there are items in basket ",veg);
                                    let b:any= {};
                                    b.VegId = veg.key;
                                    b.VegPrice = veg.Price;
                                    b.ShopId = this.shop.key;
                                    this.size[id]++;
                                    console.log("size is "+this.size[id]);
                                    b.VegQuantity = this.size[id];
                                    this.tempbasket.push(b);
                                }
                            }
                        }
                      }else{
                        this.presentConfirm();
                        break;
                    }
                      console.log("this.basket ",this.basket);
                      console.log("tempbasket  ",this.tempbasket);
                  }
                    this.basket= new Array<any>();
                    this.basket = this.tempbasket;
              }else{
                if(this.vegStock[id].NumberInStock > this.size[id] ){
                    console.log("fetched from local else , ",localBasket);
                    let veg:model.Veg = this.vegs[id];
                    console.log("no items in basket length 0 ",veg);
                    let b:any = {};
                    b.VegId = veg.key;
                    b.VegPrice = veg.Price;
                    b.ShopId = this.shop.key;
                    this.size[id]++;
                    b.VegQuantity = this.size[id];
                    this.basket.push(b);
                }
              }
            }
              // console.log("print basket 2 ",this.basket);
              this.storage.set('basket',this.basket).then(()=>{
                    this.storage.get('basket').then((data)=>{
                        // this.basket = data;
                        console.log("items from get basket",data);
                        this.getBasketSize();
                    });
                });
            
        });
    }
      ///this.getBasketSize();
    
  }
    test(){
      this.storage.get('basket').then((data)=>{
          console.log("From test",data);
      });
    }
  decreaseToSizeIndex(id){
    if(this.db.User.me){
            if (this.basket.length>0) {
                let veg:model.Veg = this.vegs[id];
                for (var i = 0; i < this.basket.length; i++) {
                    var b = this.basket[i];
                    if(veg.key === b.VegId ){
                        this.size[id]--;
                        if(b.VegQuantity ==1){
                            b.delete().then(()=>{
                                this.getBasketSize();
                            });
                        }else{
                            b.VegQuantity--;
                            b.update().then(()=>{
                                this.getBasketSize();
                            });
                        }
                        break;
                    }
                }
            } else {
                console.log('no items in the basket');
            }
        }else{
            let tempbasket ;
            this.storage.get('basket').then(localBasket=>{
                console.log("fetched from local , ",localBasket);
                if(localBasket == null){
                    return;
                }else{
                    this.basket = localBasket;
                    console.log("there is items ",this.basket);
                    
                    tempbasket = new Array();
                    this.basket.forEach(b => {
                        tempbasket.push(b);
                    });
                    console.log("clicked on ",this.vegs[id].key);
                    
                    for (var i = 0; i < this.basket.length; i++) {
                        var b = tempbasket[i];
                        console.log("basket item key ",b.key);
                        if(b.VegId === this.vegs[id].key){
                            console.log("inside equality and keys are basket item "+b.key+" veg key "+this.vegs[id].key);
                            
                            
                            if (b.VegQuantity > 1) {
                                b.VegQuantity--;
                                this.size[id]--;
                            }else{
                                if(b.VegQuantity == 1){
                                    tempbasket.splice(i,1);
                                    this.size[id]--;
                                }
                            }
                            break;

                        }
                    }
                }
            });
            this.storage.remove('basket').then(()=>{
                this.storage.set('basket',tempbasket).then(data=>{
                    this.basket = data;
                    console.log("items removed and reset to new value",data);
                    this.getBasketSize();
                });
            });
        }
    
  }
  vegItemClicked(i){
    // if(this.size[i]>=1){
    //   let veg:model.Veg = this.vegs[i];
    //   console.log("item Clicked");
    //   console.log(veg);
    //   let basket:model.Basket = new this.db.Basket();
    //   basket.UserID = this.db.User.me.key;
    //   basket.VegId = veg.key;
    //   basket.VegPrice = veg.Price;
    //   basket.VegQuantity = this.size[i];
    //   basket.save(); 
    //   this.getBasketSize();
    // }
  }
  getBasketSize(){
    if(this.db.User.me){
      this.db.Basket
      .find().where({
          "UserID": { "$eq": this.db.User.me.key },
          "Ordered":{ "$eq": false}
        })
      .resultList(basket=>{
        this.basket = [];
        this.basket = basket;
        basket.forEach(item => {
          for (var i = 0; i < this.vegs.length; i++) {
            var veg = this.vegs[i];
            if(veg.key === item.VegId){
              this.size[i] = item.VegQuantity;
            }
          }
        });
      });
    this.basketService.getBasketFromServer(this.db,this.db.User.me.key);
    }else{
      this.storage.get('basket').then((data)=>{
        if(data == null){
          this.basket = [];
        }else{
            this.basket = data;
            console.log("vegs ",this.vegs);
            console.log("vegs ",this.basket);    
            for (var i = 0; i < this.basket.length; i++) {
                var item = this.basket[i];
                for (var j = 0; j < this.vegs.length; j++) {
                    var veg = this.vegs[j];
                    if(veg.key === item.VegId){
                        this.size[j] = item.VegQuantity;
                        console.log("quantit per item in basket ",item.VegQuantity);
                        
                    }
                }
            }
           this.basketService.getBasketFromLocal();
        }
      });
    }
  }
   goToSettings(){
    this.navCtrl.push(AccountPage,{hideMenuBtn:true});
  }
  goToAboutShop(){
    this.navCtrl.push(AboutShopPage,{shopId:this.shop.key});
  }
  
  ionViewCanLeave(){
      if(this.db.User.me){
        this.db.User.me.ChosenShop = this.shop.key;
        this.db.User.me.update().then(()=>{
            console.log("shop saved");
        });
            
      }else{
        this.storage.set("ChosenShop",this.shop.key).then(()=>{
            console.log("shop saved");
        });
      }
    
  }

  moveToHome(){
      this.navCtrl.setRoot(HomePage);
  }


}
