import { Component } from '@angular/core';
import { Platform, NavController, NavParams , ViewController} from 'ionic-angular';
import { SharedContentProvider } from "../../providers/shared-content/shared-content";
import { Storage } from '@ionic/storage';

import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { SettingsPage } from "../settings/settings";

@Component({
  selector: 'page-select-currency',
  templateUrl: 'select-currency.html',
})
export class SelectCurrencyPage {
  selectCount: number = 1;
  myCurrency:any;
  isSelectMore: boolean = true;
  private deRegister:any;

  constructor(platform: Platform,public navCtrl: NavController, private viewCtrl: ViewController, public navParams: NavParams,private sqlite: SQLite, private storage: Storage) {

    this.myCurrency=SharedContentProvider.myFiatCurrencies;
    this.selectCount = SharedContentProvider.mySelectedFiatCurrencies.length;
    if (this.selectCount>=6)
    {
      this.isSelectMore = false;
    }

    this.deRegister=platform.registerBackButtonAction(() => {
      //viewCtrl.dismiss();
      console.log("pop");
      this.navCtrl.pop();
    });

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SelectCurrencyPage');
  }

  updateCheckBox(index) {

    /*
    if(this.myCurrency[index].ID==1)//US is default
    {
      this.myCurrency[index].selected = true; //Always checked
      return;
    }*/

    let selected:number=-1;

    if (this.myCurrency[index].selected==true) {
      SharedContentProvider.myFiatCurrencies[index].selected=1;
      this.selectCount++;
      selected = 1;
    }
    else {
      SharedContentProvider.myFiatCurrencies[index].selected=0;
      selected = 0;
      this.selectCount--;
    }

    SharedContentProvider.notifyChange();

    try {

      var config = {
        name: 'crypto.db',
        location: 'default'/*,
         key: dbKey*/
      };

      //create the sqllite db/table
      this.sqlite.create(config)
        .then((db: SQLiteObject) => {
          db.executeSql("UPDATE fiat_currency  SET selected='" + selected + "' WHERE ID=" + this.myCurrency[index].ID + "", []).then((results) => {
               //(results) => console.log(results)
        })
        .catch(
          //e => alert(e)
        );

        })
    .catch( /*e => alert(e)*/
    );
    }
    catch (error) {
      //alert(error.message);
    }

    if (this.selectCount >= 6) {
      this.isSelectMore = false;
    } else {
      this.isSelectMore = true;
    }

  }

  ionViewWillEnter() {        
    this.storage.set("inAModalPage", "true");
  }

  ionViewWillLeave() {
   // this.navCtrl.push(SettingsPage);
   this.storage.set("inAModalPage", "false");
   this.deRegister();
  }

}
