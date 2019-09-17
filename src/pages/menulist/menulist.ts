import { Component, NgModule } from '@angular/core';
import { IonicPageModule, ModalController, NavController, NavParams, ViewController } from 'ionic-angular';
import { AboutPage } from "../about/about";
import { SettingsPage } from "../settings/settings";
import {ExchangePage} from "../exchange/exchange";
import {TabsPage} from "../tabs/tabs";
import {CryptoCurrencySelectPage} from "../crypto-currency-select/crypto-currency-select";
import { MyAppToolbarComponent } from '../../components/my-app-toolbar/my-app-toolbar';

/**
 * Generated class for the MenulistPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
/*@NgModule({
  declarations: [
    SettingsPage
  ],
  imports: [
    IonicPageModule.forChild(SettingsPage)
  ],
  exports: [
    SettingsPage
  ]
})*/

@Component({
  selector: 'page-menulist',
  templateUrl: 'menulist.html',
})
export class MenulistPage {

  constructor(public navCtrl: NavController,
              public modalCtrl: ModalController,
              public viewCtrl: ViewController,
              public navParams: NavParams) {
  }

  /* ionViewDidLoad() {
   console.log('ionViewDidLoad MenulistPage');
   }*/

  openAbout()
  {
    let myModal = this.modalCtrl.create(AboutPage);
    myModal.present();
    this.viewCtrl.dismiss();
  }
  openSetting()
  {
    this.navCtrl.push(SettingsPage);
    this.viewCtrl.dismiss();
  }
  openExchange()
  {
    this.navCtrl.push(ExchangePage);
    this.viewCtrl.dismiss();
  }
  openCrypto()
  {
    this.navCtrl.push(CryptoCurrencySelectPage);
    this.viewCtrl.dismiss();
  }
}
