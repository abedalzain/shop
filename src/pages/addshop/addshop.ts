import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { baqend, model } from "baqend";
import { DBReady } from '../../app/db.service';

@Component({
  selector: 'page-addshop',
  templateUrl: 'addshop.html'
})
export class AddShopPage {
  car:FormGroup;
  db: baqend;
  carToEdit:model.Cars;
  edit:boolean = false;
  constructor(private ready: DBReady,
            private formBuilder: FormBuilder, 
            private navCtrl: NavController,
            private navParams: NavParams) {
       this.car = this.formBuilder.group({
            carname: ['', Validators.required],
            color: ['', Validators.required],
            price:[0,Validators.required]
        });
  }
  ionViewCanEnter() {
    // Check if the Baqend SDK is ready and wait for initialization
    return this.ready.resolve().then(db => this.db = db);
    
  }

  ionViewWillEnter() {
    // load message object from id parameter
     if(this.navParams.get('id')){
        this.edit = true;
        let id = this.navParams.get('id');
        this.db.Cars.load(id)
        .then(car => {
            this.carToEdit = car;
            this.car = this.formBuilder.group({
                carname: [car.CarName, Validators.required],
                color: [car.Color, Validators.required],
                price:[car.Price,Validators.required]
            });
        });
      }
  }
  addCar(){
    //   console.log(this.car.value);
    if(!this.edit){
        let car:model.Cars = new this.db.Cars();
        car.CarName = this.car.value.carname;
        car.Color = this.car.value.color;
        car.Price = this.car.value.price;
        console.log(car);
        car.insert().then(()=>{
            console.log('car inserted');
            this.navCtrl.pop(AddShopPage);
        }).catch(error=>{
            console.log(error);
            this.navCtrl.pop(AddShopPage);
        });
    }else{
        this.carToEdit.CarName = this.car.value.carname;
        this.carToEdit.Color = this.car.value.color;
        this.carToEdit.Price = this.car.value.price;
        this.carToEdit.update().then(()=>{
            console.log("car updated successfuly");
            this.navCtrl.pop(AddShopPage);
        }).catch(error=>{
            console.log(error);
            this.navCtrl.pop(AddShopPage);
        });   
    }
    
    // this.db.Cars
  }
  cancel(){
    this.navCtrl.pop(AddShopPage);
  }
}
