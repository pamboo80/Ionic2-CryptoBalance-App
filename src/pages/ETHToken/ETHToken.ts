import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import {WalletDetail} from "../../app/app.walletdetails";

/**
 * Generated class for the EthTokenPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-eth-token',
  templateUrl: 'ETHToken.html',
})
export class ETHTokenPage {
  private tokens:any;
  private totalValue:number=0;

  private currencyType:String;
  private currencySymbol:String;

  constructor(public navCtrl: NavController, public viewCtrl: ViewController, public navParams: NavParams) {
    this.currencyType = localStorage.getItem("ETH");
    this.currencySymbol =  WalletDetail.getCurrencySymbol(this.currencyType);
    this.tokens= navParams.get('token');
    for (var i=0;i<this.tokens.length;i++) {
      this.totalValue = this.totalValue + Number(this.tokens[i].value);
    }
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad EthTokenPage');
  }
  closeModal() {
    this.viewCtrl.dismiss();
  }

}
