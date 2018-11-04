import { baqend, model } from 'baqend';
import { DBReady } from './db.service';
import { Storage } from '@ionic/storage';
import { Injectable } from '@angular/core';

@Injectable()
export class ShopService{
    db: baqend;
    shop: model.Shops;
    basket:Array<model.Basket>;
    vegs:Array<model.Veg>;
    size:Array<number>;
    constructor(private ready: DBReady,private storage:Storage){
        this.ready.resolve().then(db => this.db = db);
    }
     
    /**
     * Save Basket Items To Storage Or Directly To Baqend
     * @param veg 
     * @param vegQuantity 
     * @param operation '1' for increase , '2' for decrease and '3' for delete
     * @param userId 
     */
    updateBasket(veg:model.Veg,vegQuantity:number,operation:number,userId?:string){

        if(userId){
            //get Items from baqend
            this.getBasketFromBaqend(userId).then((basket)=>{

                if( basket == null){
                    // no items in the basket create new 
                    let bItem:model.Basket = new this.db.Basket();
                    bItem.VegId = veg.key;
                    bItem.VegQuantity = vegQuantity;
                    bItem.VegPrice = veg.Price;
                    bItem.UserID = userId;
                    bItem.save();
                    // fetch new data
                    this.getBasketFromBaqend(userId);
                }else{
                    // one or more items exists
                    for (var i = 0; i < this.basket.length; i++) {
                        var b = this.basket[i];
                        if(b.VegId === veg.key){
                            // item exists => update it
                            // check the operation 
                            switch (operation) {
                                case 1:
                                    b.VegQuantity++;
                                    b.update();
                                    break;
                                case 2:
                                    b.VegQuantity--;
                                    b.update();
                                    break;
                                case 3:
                                    b.delete();
                                    break;
                                default:
                                    break;
                            }
                            // fetch new data
                            this.getBasketFromBaqend(userId);
                            break;
                        }else{
                            if(i == this.basket.length-1){
                                // reached end of the basket array and item doesn't exists create new one and save it to baqend 
                                let bItem:model.Basket = new this.db.Basket();
                                bItem.VegId = veg.key;
                                bItem.VegQuantity = vegQuantity;
                                bItem.VegPrice = veg.Price;
                                bItem.UserID = userId;
                                bItem.save();
                                // fetch new data
                                this.getBasketFromBaqend(userId);
                            }
                        }
                    }
                }
            });
            
        }else{
            // get local basket from storage 
            this.storage.get("localBasket").then((local:Array<model.Basket>)=>{
                //check if there is items
                this.basket = local;
                if(this.basket == null){
                    // if no items create new and save 
                    this.basket = new Array();
                    let bItem:model.Basket = new this.db.Basket();
                    bItem.VegId = veg.key;
                    bItem.VegQuantity = vegQuantity;
                    bItem.VegPrice = veg.Price;
                    this.basket.push(bItem);
                    this.storage.set("localBasket",this.basket);
                }else{
                    //if there is items
                    for (var i = 0; i < this.basket.length; i++) {
                        var b = this.basket[i];
                        // if item exists update it and save to storage 
                        if(b.VegId === veg.key){
                            switch (operation) {
                                case 1:
                                    b.VegQuantity++;
                                    this.basket[i] = b;
                                    break;
                                case 2:
                                    b.VegQuantity--;
                                    this.basket[i] = b;
                                    break;
                                case 3:
                                    let removed = this.basket.splice(i,1);
                                    console.log("item deleted from local",removed);
                                    break;
                                default:
                                    break;
                            }
                            this.storage.remove("localBasket").then(()=>{
                                this.storage.set("localBasket",this.basket);
                            });
                            // sync data
                            this.basket = this.basket;
                            break;
                        }else{
                            // item not exists added to the end of the array and save to storage
                            if(i == this.basket.length-1){
                                let bItem:model.Basket = new this.db.Basket();
                                bItem.VegId = veg.key;
                                bItem.VegQuantity = vegQuantity;
                                bItem.VegPrice = veg.Price;
                                this.basket.push(bItem);
                                this.storage.remove("localBasket").then(()=>{
                                    this.storage.set("localBasket",this.basket);
                                });
                            }
                        }
                    }
                }
            });
        }
    }

    /**
     * fetch data from baqend
     * @param userId 
     */
    getBasketFromBaqend(userId){
       return this.db.Basket.find().where({
            "UserID": { "$eq": userId }
        }).resultList(basket=>{
                console.log(basket);
                this.basket = basket;
        });
    }
    
    /**
     * fetch data from storage
     */
    getBasketFromStorage(){
        return this.storage.get("localBasket").then((local:Array<model.Basket>)=>{
            return this.basket = local;
        });
    }

    increaseItems(id){
        if(this.db.User.me){
            let veg:model.Veg = this.vegs[id];
            console.log(veg);
            if(this.basket.length >= 1){
                for (var i = 0; i < this.basket.length; i++) {
                    console.log("item number ",i);
                    var b = this.basket[i];
                    console.log(b);
                    if( veg.key === b.VegId ){
                    console.log("inside equality");
                    b.VegQuantity++;
                    b.update().then(()=>{
                        this.getBasket();
                    }); 
                    console.log(b);
                    break;
                    }else{
                        if(i == this.basket.length-1){
                            console.log("one or more items in the basket ",veg);
                            let basket:model.Basket = new this.db.Basket();
                            basket.UserID = this.db.User.me.key;
                            basket.VegId = veg.key;
                            basket.VegPrice = veg.Price;
                            this.size[id]++;
                            basket.VegQuantity =  this.size[id];
                            basket.save().then(()=>{
                                this.getBasket();
                            });
                        }
                    }
                }
            }else{
                let veg:model.Veg = this.vegs[id];
                console.log("no items in basket ",veg);
                let basket:model.Basket = new this.db.Basket();
                basket.UserID = this.db.User.me.key;
                basket.VegId = veg.key;
                basket.VegPrice = veg.Price;
                this.size[id]++;
                basket.VegQuantity = this.size[id];
                basket.save().then(()=>{
                    this.getBasket();
                }); 
            }
        }else{
            this.storage.get("basket").then(localBasket=>{
                if(localBasket == null){
                    let veg:model.Veg = this.vegs[id];
                    console.log("no items in basket ",veg);
                    let b:model.Basket = new this.db.Basket();
                    b.VegId = veg.key;
                    b.VegPrice = veg.Price;
                    this.size[id]++;
                    b.VegQuantity = this.size[id];
                    this.basket = [];
                    this.basket.push(b);
                }else{
                    this.basket = localBasket;
                    for (var i = 0; i < this.basket.length; i++) {
                        var b:model.Basket = this.basket[i];
                        if(b.VegId === this.vegs[id].key){
                            b.VegQuantity++;
                            break;
                        }else{
                            if(i == this.basket.length-1 ){
                                let veg:model.Veg = this.vegs[id];
                                console.log("no items in basket ",veg);
                                let b:model.Basket = new this.db.Basket();
                                b.VegId = veg.key;
                                b.VegPrice = veg.Price;
                                this.size[id]++;
                                b.VegQuantity = this.size[id];
                                this.basket.push(b);
                            }
                        }
                    }
                }
            }).then(()=>{
                this.storage.remove("basket").then(()=>{
                    this.storage.set("basket",this.basket).then(()=>{
                        this.storage.get("basket").then((data)=>{
                            console.log(data);
                            this.basket = data;
                        });
                    });
                });
            });
        }
        
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
                                this.getBasket();
                            });
                        }else{
                            b.VegQuantity--;
                            b.update().then(()=>{
                                this.getBasket();
                            });
                        }
                        break;
                    }
                }
            } else {
                console.log('no items in the basket');
            }
        }else{
            this.storage.get("basket").then(localBasket=>{
                if(localBasket == null){
                    return;
                }else{
                    this.basket = localBasket;
                    for (var i = 0; i < this.basket.length; i++) {
                        var b = this.basket[i];
                        if(b.VegId === this.vegs[id].key){
                            if (b.VegQuantity > 1) {
                                b.VegQuantity--;
                            }else{
                                if(b.VegQuantity == 1){
                                    this.basket.splice(i,1);
                                }
                            }
                            break;

                        }else{
                            return;
                        }
                    }
                }
            }).then(()=>{
                this.storage.remove("basket").then(()=>{
                    this.storage.set("basket",this.basket).then(data=>{
                        this.basket = data;
                    });
                });
            });
        }
        
    }

    getBasket(){
        this.db.Basket
        .find()
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
        return this.basket;
    }
}