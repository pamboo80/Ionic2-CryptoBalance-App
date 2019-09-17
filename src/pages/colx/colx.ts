
declare let myAppPlugin: any;

import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { ModalController, Platform, PopoverController, Events, ToastController  } from 'ionic-angular';
import { Http, Headers, RequestOptionsArgs, Response, RequestOptions } from '@angular/http';

import { WalletDetail } from '../../app/app.walletdetails'
import { MyAppToolbarComponent } from '../../components/my-app-toolbar/my-app-toolbar';
import { MenulistPage } from "../menulist/menulist";
import { WalletDetailsPage } from "../wallet-details/wallet-details";
import { Storage } from '@ionic/storage';
import { ApiData } from "../../app/ApiData";
import { ApiQueue } from "../../app/ApiQueue";

//import { Jsonp} from '@angular/http';
//import {Observable} from 'rxjs/Rx';
//import 'rxjs/Rx';

@Component({
  selector: 'page-colx',
  templateUrl: 'COLX.html',
  providers: [BarcodeScanner, SQLite, MyAppToolbarComponent]
})

export class COLXPage implements OnInit {
  private database: SQLiteObject;

  token: string;
  email: string;
  uuid: string;

  domain = "http://meteorjs-backend:3000/cryptobalance/";
  todayCoinValue: Number = 0;
  totalBalance: Number = 0;
  totalBalanceValue: Number = 0;
  config: any;

  private currencyType: String = "USD";
  private currencySymbol: String = "$";

  private dbKey: String;
  private myCOLXWallets: Array<WalletDetail> = [];

  private httpHeader: Headers;
  private httpRequestOptionsArgsObj: RequestOptionsArgs;
  //private httpResponse:Response;

  private platform: Platform = null;
  private apiQueue:ApiQueue;

  @ViewChild('childComponentToolbar') private myAppToolbarComponentObj: MyAppToolbarComponent;
  constructor(platform: Platform,
    private sqlite: SQLite,
    public modalCtrl: ModalController,
    private http: Http/*,
    private jsonp: Jsonp*/,
    private popoverCtrl: PopoverController,
    private ChangeDetectorRef: ChangeDetectorRef,
    private event: Events,
    private storage: Storage,
    private toastCtrl: ToastController
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
        else
        {
          this.dbKey = '999999999999';
        }
      */

      this.config = {
        name: 'crypto.db',
        location: 'default'/*,
       key: this.dbKey*/
      };

      try {
        console.log("constructor");
        this.sqlite.create(this.config)
          .then((db: SQLiteObject) => {
            this.database = db;

          })
          .catch(
            //e => alert(e)
          );
      } catch (e) {

      }

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
    this.sumBalance();
  }

  createList() {
    /* //loader.show();
    if(this.dbKey=="")
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
        db.executeSql('SELECT * FROM COLX_wallet;', []).then((data) => {
          //alert(data.rows.length);
          if (data.rows.length > 0) {
            this.myCOLXWallets = [];
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
                    var obj = JSON.parse(success);
                    if (obj != null) {
                      for (i = 0; i < obj.length; i++) {
                        let key: string = "address" + i;
                        address.push(obj[key]);
                      }
                      for (i = 0; i < data.rows.length; i++) {
                        let walletDetail: WalletDetail = new WalletDetail(this.http, this.sqlite, "COLX", address[i], data.rows.item(i).address.trim(), data.rows.item(i).balance, data.rows.item(i).wallet_name, i, this);
                        this.myCOLXWallets.push(walletDetail);
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
                  let walletDetail: WalletDetail = new WalletDetail(this.http, this.sqlite, "COLX", data.rows.item(i).address.trim(), data.rows.item(i).address.trim(), data.rows.item(i).balance, data.rows.item(i).wallet_name, i, this);
                  this.myCOLXWallets.push(walletDetail);
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


  ionViewDidEnter() {

  }


  addItemToAddressesArray(addressObj) {
    try {
      let newWalletDetail: WalletDetail = new WalletDetail(this.http, this.sqlite, "COLX", addressObj.address, addressObj.encryptedAddress, "0.0", "", 1, this);
      this.myCOLXWallets.push(newWalletDetail);
      this.sumBalance();
    }
    catch (ex) {
      /* alert(ex);*/
    }
  }

  deleteItemAtIndex(index) {
    let deleteAddress = this.myCOLXWallets[index].address;

    try {

      this.sqlite.create(this.config)
        .then((db: SQLiteObject) => {

          if (this.platform.is('android')) {
            myAppPlugin.encrypt(
              (success) => {
                var obj = JSON.parse(success);
                if (obj != null) {
                  db.executeSql("DELETE FROM COLX_wallet WHERE address='" + obj.address + "';", []).then((result) => {
                    if (result.rowsAffected) {
                      this.myCOLXWallets.splice(index, 1);
                      this.deleteFromServerDb(deleteAddress, "COLX");
                      this.sumBalance();
                      //this.createList();
                    }
                    else {
                      //alert("nothing deleted");
                    }
                  }).catch(/*e => alert(e.message)*/);
                }
              },
              (error) => {/*alert(error.message);*/ },
              { "address": deleteAddress });
          }
          else {
            db.executeSql("DELETE FROM COLX_wallet WHERE address='" + deleteAddress + "';", []).then((result) => {
              if (result.rowsAffected) {
                this.myCOLXWallets.splice(index, 1);
                this.sumBalance();
                //this.createList();
              }
              else {
                //alert("nothing deleted");
              }
            }).catch(/*e => alert(e.message)*/);
          }

        })
        .catch(
          //e => alert(e.message)
        );
    }
    catch (error) {
      //alert(error.message);
    }
  }



  sumBalance() {
    //console.log("sumBalance called.");
    //creates an array of the `balance` property: [1.0, 0.9, 2.27]
    var balances = this.myCOLXWallets.map(i => Number(i.balance));
    // gets the sum of the array of balances
    this.totalBalance = Number(balances.reduce((a, b) => a + b, 0));
    this.totalBalanceValue = Number((Number(this.totalBalance) * Number(this.todayCoinValue)).toFixed(2));
    this.totalBalance = Number(this.totalBalance.toFixed(2));
    this.ChangeDetectorRef.detectChanges();
  }

  refresh() {
    this.myAppToolbarComponentObj.getTodaysCoinValueAll();
    for (var i = 0; i < this.myCOLXWallets.length; i++) {
      let walletDetail: WalletDetail = this.myCOLXWallets[i];
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

  walletDetails(index) {
    var coin = this.myCOLXWallets[index];

    let myModal = this.modalCtrl.create(WalletDetailsPage, {
      "coin": coin,
      "coinType": "COLX",
      "todayCoinValue": this.todayCoinValue,
      "currencySymbol": this.currencySymbol
    });
    myModal.present();
    myModal.onDidDismiss(data => {
      if(data.trim()=="") {
        this.myCOLXWallets[index].walletName = "NA";
      }
      else{
        this.myCOLXWallets[index].walletName = data;
      } 
      this.ChangeDetectorRef.detectChanges();
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
            //           .then((results) => console.log(results)).catch(/*e => alert(e.message)*/);

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

}
