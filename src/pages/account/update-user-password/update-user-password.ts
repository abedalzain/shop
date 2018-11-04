import { DBReady } from './../../../app/db.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { baqend } from 'baqend';
import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, ToastController, AlertController } from 'ionic-angular';

/**
 * Generated class for the UpdateUserPasswordPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
  selector: 'page-update-user-password',
  templateUrl: 'update-user-password.html',
})
export class UpdateUserPasswordPage {
  db: baqend;
  passForm: FormGroup;
  constructor(public navCtrl: NavController,private ready:DBReady, private alertCtrl:AlertController,
    public loadingCtrl: LoadingController, public toastCtrl:ToastController,
    private formBuilder:FormBuilder,  public navParams: NavParams) {
    this.passForm = this.formBuilder.group({
          currentPass: [null, Validators.compose([Validators.required,Validators.pattern(/(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)])],
          newPass: [null, Validators.compose([Validators.required,Validators.pattern(/(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)])],
          confirmPass: [null, Validators.compose([Validators.required,Validators.pattern(/(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)])]
        });
  }

  ionViewCanEnter(){
    // Check if the Baqend SDK is ready and wait for initialization
    return this.ready.resolve().then(db => {
      this.db = db
    });
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad UpdateUserPasswordPage');
  }
  alertError(){
    let alert = this.alertCtrl.create({
      title: 'Weak Password!',
      message: 'Password must have a minimum of 8 characters with at least 1 upper case letter and 1 number.',
      buttons: ['OK']
    });
    alert.present();
  }
  changePassword(){
    if(!this.passForm.controls.currentPass.valid || !this.passForm.controls.newPass.valid || !this.passForm.controls.confirmPass.valid){
      this.alertError();
      return;
    }
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    
    loading.present();
    console.log(this.passForm.value);
    this.db.User.me.newPassword(this.passForm.value.currentPass,this.passForm.value.confirmPass).then((user)=>{
      console.log(user);
      let toast = this.toastCtrl.create({message:"Password Successfuly Updated",duration:2000,position:"top"});
      toast.present();
      loading.dismiss();
      this.navCtrl.pop();
    }).catch(error=>{
      console.log(error);
      let toast = this.toastCtrl.create({message:error.message,duration:2000,position:"top"});
      toast.present();
      loading.dismiss();
    });
  }
  checkResetPassValid(){
    // if(!this.passForm.valid){
    //   return true;
    // }
    if(this.passForm.value.newPass !== this.passForm.value.confirmPass){
      return true;
    }
    return false;
  }
}
