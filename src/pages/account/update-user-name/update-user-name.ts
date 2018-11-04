import { DBReady } from './../../../app/db.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { baqend } from 'baqend';
import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';

/**
 * Generated class for the UpdateUserNamePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
  selector: 'page-update-user-name',
  templateUrl: 'update-user-name.html',
})
export class UpdateUserNamePage {
  nameForm:FormGroup;
  db: baqend;
  constructor(public navCtrl: NavController,private ready:DBReady,public loadingCtrl: LoadingController,
    private formBuilder:FormBuilder, public navParams: NavParams) {
    
  }

  ionViewCanEnter(){
    // Check if the Baqend SDK is ready and wait for initialization
    return this.ready.resolve().then(db => {
      this.db = db
      this.nameForm = this.formBuilder.group({
        currentName:[this.db.User.me.Name,Validators.required]
      });
    });
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad UpdateUserNamePage');
  }
  updateName(){
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    loading.present();
    this.db.User.me.Name = this.nameForm.value.currentName;
    this.db.User.me.update().then(user=>{
      console.log("user has been updated",user);
      loading.dismiss();
      this.navCtrl.pop();
    }).catch(error=>{
      console.log("error happend while updating user",error);
      loading.dismiss();
    });
  }
}
