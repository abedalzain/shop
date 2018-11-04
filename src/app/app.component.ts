import { BasketPage } from './../pages/basket/basket';
import { PaymentPage } from './../pages/payment/payment';
import { DeliveryPage } from './../pages/delivery/delivery';
import { AddressPage } from './../pages/address/address';
import { OrderPage } from './../pages/order/order';
import { BasketSizeService } from './basket.service';
import { PrivacyPage } from './../pages/privacy/privacy';
import { TermsPage } from './../pages/terms/terms';
import { AboutPage } from './../pages/about/about';
import { HowItWorksPage } from './../pages/how-it-works/how-it-works';
import { baqend } from 'baqend';
import { DBReady } from './db.service';
import { AccountPage } from './../pages/account/account';
import { Component, ViewChild } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar';
import { Nav, Platform, MenuController,App } from 'ionic-angular';
import { HomePage } from '../pages/home/home';
import { LoggedIn } from "./loggedin.service";


@Component({
  templateUrl: 'app.component.html'
})
export class MyApp {
  wide: boolean;
  @ViewChild(Nav) nav: Nav;
  rootPage;
  pages: Array<{title: string, component: any, icon:string}>;
  currentTitle ='';
  activePage:any;
  db: baqend;
  loginStatus :boolean=false ;
  constructor(private platform: Platform, 
              statusBar: StatusBar,
              private app:App,
              public menuCtrl: MenuController,
              public basketService:BasketSizeService,
              private ready: DBReady,
              private loggedInService:LoggedIn) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.ready.resolve().then(db => {
        this.db = db;
        if(db.User.me){
          this.loggedInService.refreshSubscription();
        }
        this.rootPage = HomePage;
        this.currentTitle = 'Shops';
      });
      this.pages = [
          // { title: 'Postcode Search', component: PostcodeSearchPage },
          { title: 'Find a shop', component: HomePage, icon:'search'},
          { title: 'How it works', component: HowItWorksPage, icon: 'ios-information-circle-outline' },
          // { title: 'Login', component: AccountPage, icon:'lock' },
          // { title: 'Account', component: AccountPage }
        ];
      this.activePage = this.pages[0];
      window.addEventListener('resize',()=>{
        this.setWidth();
      });
      this.setWidth();
      // if(window.screen.width > 750){
      //   this.menuCtrl.toggle();
      // }
      this.loggedInService.refresh.subscribe((data)=>{
        this.loginStatus = !this.loginStatus;
      });
      statusBar.styleDefault();      
    });
  }
  openMenu(){
    console.log("menu opened");
    
  }
  setWidth() {
    if (this.platform.width() > 750) {
        this.wide = true;
        // this.menuCtrl.open();
        window.document.getElementsByTagName('ion-nav')[0].setAttribute('style','transform: translateX(0);transition-delay: initial;transition-property: none;');
    } else {
        this.wide = false;
        this.menuCtrl.close();
        window.document.getElementsByTagName('ion-nav')[0].setAttribute('style','transform: translateX(0px);transition-delay: initial;transition-property: none;');
    }
  }

  goToAboutPage(){
    this.nav.push(AboutPage);
  }
  goToHowItWorksPage(){
    this.nav.push(HowItWorksPage);
  }
  goToTermsPage(){
   this.nav.push(TermsPage);
  }
  goToPrivacyPage(){
   this.nav.push(PrivacyPage);    
  }
  openPage(page) {
    this.nav.setRoot(page.component);
    this.currentTitle = page.title;
    this.activePage = page;
  }
  // Check for active page
  checkActive(page) {
    return page == this.activePage;
  }
  checkMyAccountPageActive() {
    let p = AccountPage;
    return p == this.activePage;
  }
  loginOrOut(){
    if(this.loginStatus){
      this.db.User.logout();
      this.loggedInService.refreshSubscription();
      this.nav.setRoot(HomePage).then(()=>{
        this.currentTitle = "Shops";
        this.activePage = HomePage;
        setTimeout(()=> {
          this.checkActive(HomePage);
        }, 10);
      });
      
    }else{
      this.nav.setRoot(AccountPage);
      this.activePage = AccountPage;
    }
  }
  goToMyAccount(){
    this.nav.setRoot(AccountPage);
    this.activePage = AccountPage;
  }
  checkCurrentPage(){
    let currPage = this.nav.getActive().component;
    let pageName = this.nav.getActive().name;
    // console.log(pageName);
    
    if(currPage == BasketPage || currPage == OrderPage || currPage == AddressPage || currPage == DeliveryPage || currPage == PaymentPage){
      return false;
    }else{
      return true
    }
  }
  goToBasketPage(){
    this.nav.push(BasketPage);
  }
}
