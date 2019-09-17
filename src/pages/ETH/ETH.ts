declare let myAppPlugin: any;

import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { BarcodeScanner } from "@ionic-native/barcode-scanner";
import { ModalController, NavController, NavParams, Platform, PopoverController, ViewController, ToastController, Events } from 'ionic-angular';
import { SQLiteObject, SQLite } from "@ionic-native/sqlite";
import { Http, RequestOptions, RequestOptionsArgs } from "@angular/http";

import { WalletDetail } from "../../app/app.walletdetails";
import { MyAppToolbarComponent } from "../../components/my-app-toolbar/my-app-toolbar";
import { MenulistPage } from "../menulist/menulist";
import { ETHTokenPage } from "../ETHToken/ETHToken";
import { WalletDetailsPage } from "../wallet-details/wallet-details";
import { Storage } from '@ionic/storage';
import { ApiData } from '../../app/ApiData';
import { ApiQueue } from '../../app/ApiQueue';
/**
 * Generated class for the ETHPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-eth',
  templateUrl: 'ETH.html',
  providers: [BarcodeScanner, SQLite, MyAppToolbarComponent]
})
export class ETHPage implements OnInit {
  private database: SQLiteObject;
  
  token: string;
  email: string;
  uuid: string;

  // domain="http://meteorjs-backend:3000/cryptobalance/";
  domain = "http://meteorjs-backend:3000/cryptobalance/";
  todayCoinValue: Number = 0;
  totalBalance: Number = 0;
  totalBalanceValue: Number = 0;
  config: any;

  currencyType: String = "USD";
  currencySymbol: String = "$";

  private dbKey: String;
  private myETHWallets: Array<WalletDetail> = [];

  private httpHeader: Headers;
  private httpRequestOptionsArgsObj: RequestOptionsArgs;
  //private httpResponse:Response;

  private platform: Platform = null;
  private toast = null;
  private ETHTokensSetLoaded = new Set();
  private apiQueue:ApiQueue;
  private pageDismissed: Boolean = false;

  @ViewChild('childComponentToolbar') private myAppToolbarComponentObj: MyAppToolbarComponent;

  constructor(platform: Platform,
    public navCtrl: NavController,
    private sqlite: SQLite,
    public modalCtrl: ModalController,
    public viewCtrl: ViewController,
    private toastCtrl: ToastController,
    private http: Http/*,
               private jsonp: Jsonp*/,
    private popoverCtrl: PopoverController,
    private ChangeDetectorRef: ChangeDetectorRef,
    private event: Events,
    private storage: Storage
  ) {

    this.apiQueue=ApiQueue.getInstance(event, http,toastCtrl);

    platform.ready().then(() => {
      this.platform = platform;

      /*
       if(platform.is('android')) {
       try {
       myAppPlugin.getAndroidID(
       (success) => {
       var obj = JSON.parse(success);
       if (obj != null) {
       if (obj.ANDRIOD_ID != null && obj.ANDRIOD_ID.trim() != "") {
       this.dbKey = obj.ANDRIOD_ID;
       }
       }

       },
       (error) => {
       this.dbKey = '999999999999';
       },
       {"dummy": "123"});
       }
       catch (Error) { // Code to handle exception
       //alert(Error.message);
       this.dbKey = '999999999999';
       }
       }
       else {
       this.dbKey = '999999999999';
       }
       */

      this.config = {
        name: 'crypto.db',
        location: 'default'/*,
         key: this.dbKey*/
      };
      this.sqlite.create(this.config)
        .then((db: SQLiteObject) => {
          this.database = db;

        })
        .catch(
          //e => alert(e)
        );

      setTimeout(() => {
        this.createList();
      }, 100);

    });

  }

  ngOnInit(): void {
 
  }

  onChangeCoinValue(todayCoinValue) {
    if (Number(todayCoinValue) > 1) {
      this.todayCoinValue = Number(Number(todayCoinValue).toFixed(2));
    } else {
      this.todayCoinValue = Number(todayCoinValue);
    }
    this.sumBalance();
  }

  onChangeCurrencyType(currencyType) {
    this.currencyType = currencyType;
    this.currencySymbol = WalletDetail.getCurrencySymbol(this.currencyType);
    for (var i = 0; i < this.myETHWallets.length; i++) {
      for (var j = 0; j < this.myETHWallets[i].myETHTokenDetails.length; j++) {
        this.myETHWallets[i].myETHTokenDetails[j].todayTokenValue();
      }
    }

    this.sumBalance();
  }

  walletDetails(index) {
    var coin = this.myETHWallets[index];

    let myModal = this.modalCtrl.create(WalletDetailsPage, {
      "coin": coin,
      "coinType": "ETH",
      "todayCoinValue": this.todayCoinValue,
      "currencySymbol": this.currencySymbol
    });
    myModal.present();
    myModal.onDidDismiss(data => {
      if(data.trim()=="") {
        this.myETHWallets[index].walletName = "NA";
      }
      else{
        this.myETHWallets[index].walletName = data;
      } 
      this.ChangeDetectorRef.detectChanges();
    });
  }

  tokenDetails(event, index) {
    event.stopPropagation();
    let token = this.myETHWallets[index].myETHTokenDetails;
    if (token.length > 0) {
      let myModal = this.modalCtrl.create(ETHTokenPage, { "token": token });
      myModal.present();
    }

  }

  createList() {

    // let walletDetail0: WalletDetail = new WalletDetail(this.http, this.sqlite, "ETH","0xf73c3c65bde10bf26c2e1763104e609a41702efe", "0x6474D2BE8B403352d5eDeBbf630031834C686863", "0.0", this);
    // this.myETHWallets.push(walletDetail0);      
    // let walletDetail1: WalletDetail = new WalletDetail(this.http, this.sqlite, "ETH","0x6474D2BE8B403352d5eDeBbf630031834C686863", "0x6474D2BE8B403352d5eDeBbf630031834C686863", "0.0", this);
    // this.myETHWallets.push(walletDetail1);    
    // let walletDetail2: WalletDetail = new WalletDetail(this.http, this.sqlite, "ETH","0xaAa41feDbccb11E3cE5A2e3EF7c1f3F674a94FBA", "0xaAa41feDbccb11E3cE5A2e3EF7c1f3F674a94FBA", "0.0", this);       
    // this.myETHWallets.push(walletDetail2); 
    // let walletDetail3: WalletDetail = new WalletDetail(this.http, this.sqlite, "ETH","0xC799212CF4E3908e0EC546a5598c28CAa35a0115", "0xC799212CF4E3908e0EC546a5598c28CAa35a0115", "0.0", this);       
    // this.myETHWallets.push(walletDetail3); 
    // let walletDetail4: WalletDetail = new WalletDetail(this.http, this.sqlite, "ETH","0xf02D5c0a9e919B92669c9dD9ac13D48a94390eb2", "0xf02D5c0a9e919B92669c9dD9ac13D48a94390eb2", "0.0", this);       
    // this.myETHWallets.push(walletDetail4); 


    //loader.show();
    /* if(this.dbKey=="")
     {
     setTimeout( () => {
     this.createList();
     }, 200);
     return;
     }*/


    //Read from the DB and create the list

    //create the sqllite db/table
    this.sqlite.create(this.config)
      .then((db: SQLiteObject) => {

        db.executeSql('SELECT * FROM ETH_wallet;', []).then((data) => {
          //alert(data.rows.length);
          if (data.rows.length > 0) {
            this.myETHWallets = [];

            let address: String[] = [];
            let myjson: string = "{";

            try {

              if (this.platform.is('android')) {

                for (var i = 0; i < data.rows.length; i++) {
                  //Construct the input JSON for decrypt
                  myjson = myjson + '"address' + i + '":"' + data.rows.item(i).address.trim() + '",';
                }

                myjson = myjson + '"length":' + data.rows.length + "}";

                myAppPlugin.decrypt(
                  (success) => {

                    //alert(success);
                    var obj = JSON.parse(success);
                    if (obj != null) {
                      for (i = 0; i < obj.length; i++) {
                        let key: string = "address" + i;
                        address.push(obj[key]);
                      }

                      for (i = 0; i < data.rows.length; i++) {
                        let walletDetail: WalletDetail = new WalletDetail(this.http, this.sqlite, "ETH", address[i], data.rows.item(i).address.trim(), data.rows.item(i).balance, data.rows.item(i).wallet_name, i, this);
                        this.myETHWallets.push(walletDetail);
                      }
                      this.sumBalance();
                    }
                  },
                  (error) => {
                    //alert("error:"+error)
                  },
                  JSON.parse(myjson));
              }
              else {
                for (i = 0; i < data.rows.length; i++) {
                  let walletDetail: WalletDetail = new WalletDetail(this.http, this.sqlite, "ETH", data.rows.item(i).address.trim(), data.rows.item(i).address.trim(), data.rows.item(i).balance, data.rows.item(i).wallet_name, i, this);
                  this.myETHWallets.push(walletDetail);
                }
                this.sumBalance();
              }

            }
            catch (e) {
              //alert(e);
            }

          }
          //alert('Executed SELECT SQL' + this.addresses.length), () => console.log("table created")
        })
          .catch(
            //e => alert(e)
          );

      })
      .catch(
        //e => alert(e)
      );

    //loader.hide();
  }

  // getActivePage(): string {
  //   try{

  //     var bEthPage = "false";     

  //     if(this.navCtrl.getActive().instance instanceof ETHPage)
  //     {
  //       bEthPage = "true";
  //     }
        
  //     return "EthPage: " + bEthPage + ", length: " + this.navCtrl.getActive()._nav.length();
  //   }
  //   catch(ex){
  //     return "exception";
  //   }
   
  // }

  // onDidDismiss()
  // {
  //   this.pageDismissed = true;
  // }

  ionViewDidLeave()
  {   
    this.pageDismissed = true;
  }

  ionViewDidEnter() {
    this.pageDismissed = false;
    this.storage.set("inAModalPage", "false");
    this.storage.get("email").then((val) => {
      this.email = val;
    });
    this.storage.get("token").then((val) => {
      this.token = val;
    });
  }

  getmyETHWalletsSize() {
    return this.myETHWallets.length;
  }

  getArraymyETHWalletsIndex(address) {
    let pos: Number = this.myETHWallets.length + 1;
    for (var i = 0; i < this.myETHWallets.length; i++) {
      let walletDetail: WalletDetail = this.myETHWallets[i];
      if (walletDetail.address == address) {
        pos = i;
        break;
      }
    }
    return pos;
  }

  addItemToAddressesArray(addressObj) {
    try {
      let newWalletDetail: WalletDetail = new WalletDetail(this.http, this.sqlite, "ETH", addressObj.address, addressObj.encryptedAddress, "0.0", "", 1, this);
      this.myETHWallets.push(newWalletDetail);
      this.sumBalance();
    }
    catch (ex) {
      //alert(ex);
    }
  }

  deleteItemAtIndex(index) {
    let deleteAddress = this.myETHWallets[index].address;

    try {

      this.sqlite.create(this.config)
        .then((db: SQLiteObject) => {

          if (this.platform.is('android')) {
            myAppPlugin.encrypt(
              (success) => {
                var obj = JSON.parse(success);
                if (obj != null) {
                  db.executeSql("DELETE FROM ETH_wallet WHERE address='" + obj.address + "';", []).then((result) => {
                    if (result.rowsAffected) {
                      this.myETHWallets.splice(index, 1);
                      this.deleteFromServerDb(deleteAddress, "ETH");
                      this.sumBalance();
                      //this.createList();
                    }
                    else {
                      /*alert("nothing deleted");*/
                    }
                  })
                    .catch(/*e => alert(e.message)*/);
                }
              },
              (error) => {/*alert(error.message);*/
              },
              { "address": deleteAddress });
          }
          else {
            db.executeSql("DELETE FROM ETH_wallet WHERE address='" + deleteAddress + "';", []).then((result) => {
              if (result.rowsAffected) {
                this.myETHWallets.splice(index, 1);
                this.deleteFromServerDb(deleteAddress, "ETH");
                this.sumBalance();
                //this.createList();
              }
              else {
                /*alert("nothing deleted");*/
              }
            })
              .catch(/*e => alert(e.message)*/);
          }

          /*
           db.executeSql("DELETE FROM ETH_wallet WHERE address='" + deleteAddress + "';", []).then((data) => {
           if (data.rows.length > 0) {
           this.myETHWallets.splice(index, 1);
           this.sumBalance();
           }
           //this.createList();
           })
           .catch(/!*e => alert(e.message)*!/);*/
        })
        .catch(
          /* e => alert(e.message)*/
        );
    }
    catch (error) {
      /*alert(error.message);*/
    }
  }

  sumBalance() {
    //console.log("sumBalance called.");
    //creates an array of the `balance` property: [1.0, 0.9, 2.27]
    var balances = this.myETHWallets.map(i => Number(i.balance));
    // gets the sum of the array of balances
    this.totalBalance = Number(balances.reduce((a, b) => a + b, 0));
    this.totalBalanceValue = Number((Number(this.totalBalance) * Number(this.todayCoinValue)).toFixed(2));
    this.totalBalance = Number(this.totalBalance.toFixed(2));
    this.ChangeDetectorRef.detectChanges();
  }

  refresh() {
    this.myAppToolbarComponentObj.getTodaysCoinValueAll();
    for (var i = 0; i < this.myETHWallets.length; i++) {
      let walletDetail: WalletDetail = this.myETHWallets[i];
      walletDetail.updateLiveBalance();
    }
  }

  doRefresh(refresher) {
    //console.log('Begin async operation', refresher);
    this.refresh();
    setTimeout(() => {
      //console.log('Async operation has ended');
      refresher.complete();
    }, 2000);
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create(MenulistPage);
    popover.present({
      ev: myEvent
    });
  }

  deleteFromServerDb(address, coinType) {

    this.storage.get("email").then((val) => {
        this.email = val;
        if(this.email==null || this.email=="")
        {
            return;
        }
        else
        {
            this.storage.get("uuid").then((val) => {
            this.uuid = val;

            this.database.executeSql("INSERT INTO DeleteRemaining values('" + address + "', '" + coinType + "')", [])
                      .then((results) => console.log(results)).catch(/*e => alert(e.message)*/);
            MyAppToolbarComponent.API_COUNTER++;
            var sendData={ 
                "uuid": this.uuid,
                "jwtToken":MyAppToolbarComponent.jwtToken,
                address:address,
                coinType:coinType
            };
            var url=this.domain + coinType + "/" + this.uuid + "/" + address;  
            var eventId=MyAppToolbarComponent.API_COUNTER.toString();
            this.apiQueue.addToQueue(new ApiData(ApiData.DELETE,url,sendData,eventId));
            this.event.subscribe(eventId,(originalData, res)=>{
                if(res.result=="success"){
                    this.database.executeSql("DELETE FROM DeleteRemaining WHERE address='" + originalData.address + "'", [])
                        .then((results) => console.log(results)).catch(/*e => alert(e.message)*/);
                }
            });
            this.apiQueue.executeQueue(false);
            
            // var data = { "uuid": this.uuid ,"jwtToken":MyAppToolbarComponent.jwtToken };
            // let URL = this.domain + coinType + "/" + this.uuid + "/" + address;  //@@@TODO update in server
            // this.http.delete(URL, new RequestOptions({ body: data }))
            //     .subscribe(res => {
            //         // alert("deleted from server");
            //         if(res.json().result=="success")
            //         {
            //           this.database.executeSql("DELETE FROM DeleteRemaining WHERE address='" + address + "'", [])
            //           .then((results) => console.log(results)).catch(/*e => alert(e.message)*/);
            //         }else{
            //           this.database.executeSql("INSERT INTO DeleteRemaining values('" + address + "', '" + coinType + "')", [])
            //             .then((results) => console.log(results)).catch(/*e => alert(e.message)*/);
            //         }
                    
            //     }, (error => {
            //         // alert("fail to add server"+error.message);
            //         this.database.executeSql("INSERT INTO DeleteRemaining values('" + address + "', '" + coinType + "')", [])
            //             .then((results) => console.log(results)).catch(/*e => alert(e.message)*/);

            //     }))
                
            });
        }
        
    });
  } 

  toastMsg(msg: string, duration: number = -1) {
    
    if (this.toast != null)
      this.toast.dismiss();

    if(this.pageDismissed==true)
    {
      return;
    }    

    if (msg != "") {
    this.storage.get("inAModalPage").then((val) => {
      if(val!=null && val!= undefined && val=="false")
      {        
          this.toast = this.toastCtrl.create({
            message: msg,
            duration: duration,
            position: 'bottom',
            dismissOnPageChange: true
          });
    
          this.toast.onDidDismiss(() => {
          });
    
          this.toast.present();        
      }
    });

    }

    
  }

}
