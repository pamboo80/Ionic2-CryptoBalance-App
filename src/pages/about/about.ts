import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { Storage } from '@ionic/storage';


/**
 * Generated class for the AboutPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
})
export class AboutPage {

  constructor(public navCtrl: NavController,
              public viewCtrl: ViewController,
              public navParams: NavParams,
              private storage: Storage) {
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad AboutPage');
  }

  ionViewWillEnter() {        
    this.storage.set("inAModalPage", "true");
  }

  ionViewWillLeave() {
   // this.navCtrl.push(SettingsPage);
   this.storage.set("inAModalPage", "false");
  }

  closeModal() {
    this.viewCtrl.dismiss();
  }
}
