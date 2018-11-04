import { GlobalValidator } from './../../../app/global.validator';
import { DBReady } from './../../../app/db.service';
import { baqend } from 'baqend';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';

/**
 * Generated class for the UpdateUserEmailPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
  selector: 'page-update-user-email',
  templateUrl: 'update-user-email.html',
})
export class UpdateUserEmailPage {
  
  db: baqend;
  email:FormGroup;
  constructor(public navCtrl: NavController,private ready:DBReady,public loadingCtrl: LoadingController,
    private formBuilder:FormBuilder,  public navParams: NavParams) {
    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UpdateUserEmailPage');
  }
  ionViewCanEnter(){
    // Check if the Baqend SDK is ready and wait for initialization
    return this.ready.resolve().then(db => {
      this.db = db
      this.email = this.formBuilder.group({
        username: [this.db.User.me.username, Validators.compose([Validators.email,Validators.required,GlobalValidator.mailFormat])]
      });
    });
  }
  changeEmailAddress(){
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    loading.present();
    let newEmail = this.email.value.username;
    this.db.User.me.username = newEmail;
    this.db.User.me.update({force:true}).then((user)=>{
      console.log(user);
      loading.dismiss();
      this.navCtrl.pop();
    },(error)=>{
      console.log(error);
      loading.dismiss();
    });
  }

}
