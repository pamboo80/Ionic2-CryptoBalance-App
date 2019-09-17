import { Component, NgZone, ElementRef, ViewChild } from '@angular/core';
import { NavController, NavParams, Platform, ViewController, ToastController, TextInput } from 'ionic-angular';
import { Http } from "@angular/http";
import {SharedContentProvider} from "../../providers/shared-content/shared-content";
import {Subscription} from "rxjs/Subscription";
import {Observable} from "rxjs/Observable";
import { Storage } from '@ionic/storage';

/**
 * Generated class for the ExchangePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-exchange',
  templateUrl: 'exchange.html',
})
export class ExchangePage {

    coinType: any = "BTC";
    fiatCurrency: any = "USD";
    coinValue = 1.00;
    fiatValue = 0;
    fiatActual = 0;
    myCurrency=SharedContentProvider.myFiatCurrencies;
    email:TextInput
    isFiat=true;
    isCrypto=true;

    private httpCallSubscription: Subscription = null;

    private deRegister: any;
    private bPopoverOnTopView = false;


    
    
    constructor(platform: Platform, public navCtrl: NavController, public navParams: NavParams, private viewCtrl: ViewController,
                private http: Http,private toastCtrl: ToastController, private zone:NgZone,
                private storage: Storage) {

        this.getCurrency();
        this.deRegister = platform.registerBackButtonAction(() => {
            this.navCtrl.pop();
        });

    }
   
    ionViewDidLoad() {
        console.log('ionViewDidLoad ExchangePage');
    }

    ionViewWillEnter() {        
        this.storage.set("inAModalPage", "true");
    }
         
    ionViewWillLeave() {
        this.storage.set("inAModalPage", "false");
        if (this.bPopoverOnTopView == true) {
            this.bPopoverOnTopView = false;
            return;
        }
        this.deRegister();
  }

  onClick()
  {
      this.bPopoverOnTopView = true;
  }

  getCurrency(){
      if (this.httpCallSubscription != null)
          this.httpCallSubscription.unsubscribe();
    let URL:string='https://min-api.cryptocompare.com/data/price?fsym='+ this.coinType + '&tsyms='+this.fiatCurrency;

      this.httpCallSubscription = Observable.interval(2 * 60 * 1000)
          .startWith(0)
          .flatMap(() => this.http.get(URL, {}))
          /*.map(res=> res.json())*/
          .subscribe(res => {
              //console.log(res.json());
              var data=res.json();
              // console.log(data);
              this.fiatActual=data[this.fiatCurrency];
              this.fiatValue=this.fiatActual;
              this.coinValue=1.00;
          }, (error => {
              //console.log(error);
              //alert("Exception: " + error);

          }))
    // this.http.get(URL).subscribe(res=>{
    //   var data=res.json();
    //   // console.log(data);
    //   this.fiatActual=data[this.fiatCurrency];
    //   this.fiatValue=this.fiatActual;
    //   this.coinValue=1.00;
    // });
  }
  onChangeCoin(data){
    this.fiatValue=this.fiatActual*data.target.value;
  }
  onChangeFiat(data){
    this.coinValue=data.target.value/this.fiatActual;
  }           
             
}
