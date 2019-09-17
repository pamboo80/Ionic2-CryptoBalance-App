declare let myAppPlugin:any;
import {Component} from '@angular/core';
import {NavController, NavParams, ViewController, ToastController} from 'ionic-angular';
import {Clipboard} from '@ionic-native/clipboard';
import {SQLite, SQLiteObject} from "@ionic-native/sqlite";
/**
 * Generated class for the WalletDetailsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-wallet-details',
  templateUrl: 'wallet-details.html',
})
export class WalletDetailsPage {

  private coin;
  private currencySymbol;
  private todayCoinValue;
  private coinType;
  private notes="";
  private wallet_name="";

  private encryptedAddress;
  config = {
    name: 'crypto.db',
    location: 'default'/*,
     key: this.dbKey*/
  };

  private enableSaveButton = true;
  private toast = null;

  constructor(private sqlite: SQLite,
              public navCtrl: NavController,
              public viewCtrl: ViewController,
              public navParams: NavParams,
              private toastCtrl: ToastController,
              private clipboard: Clipboard) {
    this.coin = navParams.get('coin');
    this.coinType = navParams.get('coinType');
    this.currencySymbol = navParams.get('currencySymbol');
    this.todayCoinValue = navParams.get('todayCoinValue');

    //Disbable the save button while reading the notes value from DB
    this.enableSaveButton = false;

    //Read the wallet address note from the SQL table
    this.readfromDB();

  }

  private readfromDB() {
    this.sqlite.create(this.config)
      .then((db: SQLiteObject) => {
        db.executeSql("SELECT notes,wallet_name FROM "+this.coinType+"_wallet  WHERE address='" + this.coin.encryptedAddress + "'", []).then((data) => {
          //alert(data.rows.length);
          if (data.rows.length >= 0) {
            if(data.rows.item(0).notes!=null)
             this.notes=data.rows.item(0).notes;
             this.wallet_name=data.rows.item(0).wallet_name;
          }
          this.enableSaveButton = true;
        })
          .catch(
            ()=>this.enableSaveButton = true
            //e => alert(e.message)
          );

      })
      .catch(
        ()=>this.enableSaveButton = true
        //e => alert(e.message)
      );
  }

  copyTextToClipboard() {
    //copy address value to clipboard
    //this.coin.address
    this.clipboard.copy(this.coin.address);
    this.toastMsg("Address is copied to the clipboard.", 3000);
  }


  saveNotesToDB(siletMode=false) {
    this.sqlite.create(this.config)
      .then((db: SQLiteObject) => {
        db.executeSql("UPDATE " + this.coinType + "_wallet  SET notes='" + this.notes + "' , wallet_name='"+this.wallet_name.trim()+"' WHERE address='" + this.coin.encryptedAddress + "'", []).then(
          (results) => {
            
            if(siletMode==false)
             this.toastMsg("Saved successfully.", 2500);
          }
        ).catch(          
          ()=> { if(siletMode==false) this.toastMsg("Something went wrong. Check your internet connection and try again.", 3000);}
          /* e => alert(e.message)*/
        );
      })
    //this.notes
  }

  ionViewWillLeave() {
    //Save notes value to DB
    //Auto save
    this.saveNotesToDB(true);
    this.viewCtrl.dismiss(this.wallet_name.trim());
  }


  ionViewDidLoad() {
    //console.log('ionViewDidLoad WalletDetailsPage');
  }

  closeModal() {
    this.viewCtrl.dismiss(this.wallet_name.trim());
  }

  toastMsg(msg: string, duration: number = -1) {
    if (this.toast != null)
      this.toast.dismiss();

    if (msg != "") {
      this.toast = this.toastCtrl.create({
        message: msg,
        duration: duration,
        position: 'bottom'
      });

      this.toast.onDidDismiss(() => {
      });

      this.toast.present();
    }
  }

}
