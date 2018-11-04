import { baqend } from 'baqend';
import { Storage } from '@ionic/storage';
import { Injectable} from '@angular/core'

@Injectable()

export class BasketSizeService{
    public basketSize = 0;
    public total=0;
    public basket:any;
    constructor(private storage:Storage){
        
    }

    getBasketFromLocal(){
        this.storage.get("basket").then((basket)=>{
            if(basket){
                this.basket = basket;
                this.basketSize = basket.length;
                this.total =0;
                basket.forEach(b => {
                    let itemCost = b.VegPrice * b.VegQuantity;
                    this.total += itemCost; 
                });
            }
        });
    }
    getBasketFromServer(db:baqend,userId:string){
        db.Basket.find().where({
            "UserID": { "$eq": db.User.me.key },
            "Ordered":{ "$eq": false}
        }).resultList(basket=>{
            this.basket = basket;
            this.basketSize = basket.length;
            this.total =0;
            let vegs = [];
            basket.forEach(b => {
                let itemCost = b.VegPrice * b.VegQuantity;
                this.total += itemCost; 
            });
        });
    }
}