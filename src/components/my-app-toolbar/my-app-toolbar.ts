declare let myAppPlugin: any;

import { Component, EventEmitter, Input, Output, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Platform, ToastController, Events } from 'ionic-angular';
import { Http, Headers, RequestOptionsArgs, Response, RequestOptions } from '@angular/http';
import { Observable, Subscription } from 'rxjs/Rx';

import { ConnectivityMonitorProvider } from "../../providers/connectivity-monitor/connectivity-monitor";
import { ChangeDetectorRef } from '@angular/core';

import { SharedContentProvider } from "../../providers/shared-content/shared-content";
import { FiatCurrency } from "../../app/app.fiatcurrency";
import { Push, PushObject, PushOptions } from "@ionic-native/push";
import { Storage } from '@ionic/storage';
import { UniqueDeviceID } from '@ionic-native/unique-device-id';
import { base58check } from 'base58check';
import { Queue } from 'queue-typescript';
import { ApiQueue } from '../../app/ApiQueue';
import { ApiData } from '../../app/ApiData';

/**
 * Generated class for the MyComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */

@Component({
    selector: 'my-app-toolbar',
    templateUrl: 'my-app-toolbar.html',
    providers: [BarcodeScanner, SQLite]
})

export class MyAppToolbarComponent implements OnDestroy {
    database: SQLiteObject;
    config: {
        name: string;
        location: string;
    };
    
    id = '';
    domain = "http://meteorjs-backend:3000/cryptobalance/";

    private dbKey: String;   
    private counter:number =1; 
    public static API_COUNTER=1;
    public static initialTime: number; //It's not even used? Remove it atfer testing properly //@@@

    public static jwtToken: String = "";
    private addAddressForm: FormGroup;
    private walletAddress: AbstractControl;
    private showError: boolean;
    private todayCoinValueAll: any = "";
    private todayCoinValue: String = "";
    private currencyType: String = "USD";

    private httpHeader: Headers;
    private httpRequestOptionsArgsObj: RequestOptionsArgs;
    //private httpResponse:Response;

    private toast = null;
    
    private uuid: String = "";
    private token: String = "" ;
    private email: String = "";

    private platform: Platform = null;
    

    private connectivityMonitorSubscription: Subscription = null;
    private myFiatCurrenciesUpdateSubscription: Subscription = null;
    private httpCallSubscription: Subscription = null;

    private myCurrency: Array<FiatCurrency> = [];
    apiQueue:ApiQueue; 

    @ViewChild('walletAddressInput') walletAddressInputBox: ElementRef;
    @Input('coin-type') coinType: string = "";
    @Output() onCoinValueChange = new EventEmitter();
    @Output() onAddWalletAddress = new EventEmitter();
    @Output() onCurrencyTypeChange = new EventEmitter();

    constructor(platform: Platform,
        private barcodeScanner: BarcodeScanner,
        private formBuilder: FormBuilder,
        private sqlite: SQLite,
        private http: Http,
        private toastCtrl: ToastController,
        private ChangeDetectorRef: ChangeDetectorRef,
        private push: Push,
        private storage: Storage,
        private event:Events,
        private uniqueDeviceID: UniqueDeviceID) {

        this.apiQueue=ApiQueue.getInstance(event,http,toastCtrl);

        this.push.hasPermission()
            .then((res: any) => {
                if (res.isEnabled) {
                    // this.toastMsg("We have permission to send push notifications", null, 3000);
                    console.log("We have permission to send push notifications");
                } else {
                    // this.toastMsg("We do not have permission to send push notifications", null, 3000);
                    console.log("We do not have permission to send push notifications");
                }

            });

        this.showError = false;
        this.dbKey = "";

        //Validations
        this.addAddressForm = formBuilder.group({
            "walletAddress": ["", Validators.required]
        });
        this.walletAddress = this.addAddressForm.controls['walletAddress'];
    
        platform.ready().then(() => {
            this.uniqueDeviceID.get().then((val) => {
                this.uuid = val;
                this.storage.set("uuid", this.uuid);
                let URL = this.domain +  "/getToken";  
                
                MyAppToolbarComponent.API_COUNTER++;                        
                var eventId=MyAppToolbarComponent.API_COUNTER.toString();
                var data={"uuid": this.uuid };
                this.apiQueue.addToQueue(new ApiData(ApiData.POST,URL,data,eventId));
            
                this.event.subscribe(eventId,(originalData, data)=> {
                    if(data.result=="success")
                    {
                        MyAppToolbarComponent.jwtToken=data.jwtToken;      
                        storage.get("email").then((val) => {
                            (val==null)? this.email = "" : this.email = val;
                            
                        //Don't do on each tab click - Do only on BTC as default tab on launch of the app                                    
                        if (this.coinType.toLowerCase() == "BTC".toLowerCase()) {
                            this.storage.get("uuid")
                                .then((uuid: any) => {
                                    this.uuid = uuid;
                                    storage.get("token").then((val) => {                                                        
                                        if(val!=null)
                                        {
                                            this.token = val;
                                        }                                        
                                        //this.toastMsg(this.uuid+ "..."+this.email,null,3000);
                                        MyAppToolbarComponent.API_COUNTER++;
                                        var url="http://meteorjs-backend:3000/updateToken";
                                        var data={
                                            "email": this.email,
                                            "token": this.token,
                                            "uuid": this.uuid,
                                            "jwtToken":MyAppToolbarComponent.jwtToken 
                                            };
                                        var eventId=MyAppToolbarComponent.API_COUNTER.toString();
                                        this.apiQueue.addToQueue(new ApiData(ApiData.POST,url,data,eventId));
                                        event.subscribe(eventId,(originalData, data)=>{
                                             if(data.result=="success"){
                                                this.updateEmailVerification(data.verified);
                                                this.syncLocalTablesAddressWithServer();
                                            } 
                                        });
                                        this.apiQueue.executeQueue(false);
                                        this.syncLocalTablesAddressWithServer();                                                                                                          
                                                
                                        const options: PushOptions = {
                                            android: {
                                            },
                                            ios: {
                                                alert: 'true',
                                                badge: true,
                                                sound: 'false'
                                            },
                                            windows: {},
                                            browser: {
                                                pushServiceURL: 'http://push.api.phonegap.com/v1/push'
                                            }
                                        };
                
                                        /////////////// Push Notification Event Handling ////////////////
                                        /////////////// Begin ///////////////////////////////////////////
                                        const pushObject: PushObject = this.push.init(options);                
                                        pushObject.on('notification').subscribe((notification: any) => {
                                            console.log('Received a notification', notification);
                                            if(notification.title=="CryptoBalance" && notification.message=="Email address is verified successfully."){
                                                this.updateEmailVerification(true);     
                                                this.syncLocalTablesAddressWithServer();                                           
                                            }  
                                        });
                
                                        pushObject.on('registration').subscribe((registration: any) => {
                                            if(registration.registrationId!=null && registration.registrationId!="")
                                            {
                                                this.storage.set("token", registration.registrationId);
                                                this.token=registration.registrationId;
                                                MyAppToolbarComponent.API_COUNTER++;
                                                var url="http://meteorjs-backend:3000/updateToken";
                                                var data={
                                                    "email": this.email,
                                                    "token": this.token,
                                                    "uuid": this.uuid,
                                                    "jwtToken":MyAppToolbarComponent.jwtToken
                                                };
                                                var eventId=MyAppToolbarComponent.API_COUNTER.toString();
                                                this.apiQueue.addToQueue(new ApiData(ApiData.POST,url,data,eventId));
                                                event.subscribe(eventId,(originalData, data)=>{                                                    
                                                    if(data.result=="success"){                                                        
                                                        this.updateEmailVerification(data.verified);
                                                        this.syncLocalTablesAddressWithServer();
                                                    } 
                                                });
                                                this.apiQueue.executeQueue(false);                                            
                                            }
                        
                                        }
                                        );
                                        pushObject.on('error').subscribe(error => console.error('Error with Push plugin', "er" + error));

                                        ////////////////// End ////////////////////
                                    });
                                                    

                                })
                                .catch((error: any) => console.log(error));
                        }

                        });    
                    }else if(data.result=="fail"){
                        
                    }
                }, (error => {   
                }));
                this.apiQueue.executeQueue(false);            
                });

            this.platform = platform;
            if (platform.is('android')) {
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
                        { "dummy": "123" });
                }
                catch (Error) { // Code to handle exception
                    //servError.message);
                    this.dbKey = '999999999999';
                }
            }
            else {
                this.dbKey = '999999999999';
            }

            this.myFiatCurrenciesUpdateSubscription = SharedContentProvider.isMySelectedFiatCurrenciesUpdated().subscribe(data => {
                if (data === true) {
                    this.myCurrency = SharedContentProvider.mySelectedFiatCurrencies;

                    let tempCoinType: String = localStorage.getItem(this.coinType);
                    let selectedCurrency = this.myCurrency.find(x => x.symbol.toLowerCase() == tempCoinType.toLowerCase());
                    if (selectedCurrency == null || selectedCurrency == undefined)
                        this.currencyType = "USD";

                    this.getTodaysCoinValue();

                    this.ChangeDetectorRef.detectChanges();
                }
            });
                    
            //@@@ Moved this to after getting token
            // Why he coded for some delay. Worst :(
            /*if (this.coinType == "BTC") {
                // 3 second delay because get token and update token both will call in next two second
                var date=Date.now();
                MyAppToolbarComponent.initialTime= date;
                if(ConnectivityMonitorProvider.bConnected==true){
                    this.syncLocalTablesAddressWithServer();
                }                                
            }
            */

            this.connectivityMonitorSubscription = ConnectivityMonitorProvider.isConnected().subscribe(data => {
                if (data === true) {
                    if(MyAppToolbarComponent.jwtToken==""){
                        this.getTokenAndUpdateTokenApiCall(); 
                        // calling because on app start no updateToken and getToken api call failed 
                    }
                    //setTimeout(() => {
                    this.getTodaysCoinValueAll();

                    //@@@ Moved this to after getting token
                    // Why he coded for some delay. Worst :(
                    /*
                    // call will occur only when internet connectivity change 
                    if (this.coinType == "BTC") {
                        // giving timeout because calling api for getingToken and updateToken
                        var InitialTime=MyAppToolbarComponent.initialTime + (MyAppToolbarComponent.API_COUNTER *1.1*1000);
                        var difference=InitialTime-Date.now();
                        this.syncLocalTablesAddressWithServer();
                    }
                    */

                    //TODO:Optimization: A shared variable DBSyncRequired=true (default) , after sync it will become false. It will become
                    // true again on error.

                    //}, 100);
                }
            });
        });
        this.config = {
            name: 'crypto.db',
            location: 'default'
        };

        try {
            this.sqlite.create(this.config)
                .then((db: SQLiteObject) => {
                    this.database = db;
                })
                .catch(
                    //e => alert(e)
                );
        } catch (e) {

        }
    }
   
    syncLocalTablesAddressWithServer() {
        this.storage.get("email").then((val) => {
            this.email = val;
            if(this.email==null || this.email=="")
            {
                return;
            }
            else{
              this.counter=1;
              this.checkForAdd();
              this.checkForDelete();
              this.counter=1;
            }    
        }  
        );  
    }

    checkForAdd() {
        this.database.executeSql("SELECT * FROM AddRemaining;", []).then((data) => {
            //alert(data.rows.length);            
            if (data.rows.length > 0) {
                try {
                    //if (this.platform.is('android')) {
                        for (var i = 0; i < data.rows.length; i++) {    
                            var time=this.counter*1.1*1000; //@@@ This time is not used at all
                            this.counter++;
                            MyAppToolbarComponent.API_COUNTER++;
                            this.addtoServerDb(data.rows.item(i).address.trim(), data.rows.item(i).coinType.trim(), time);
                            // alert(data.rows.item(i).coinType.trim()+"Add:"+data.rows.item(i).address.trim());
                        }
                    //}
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
    }

    checkForDelete() {
        this.database.executeSql("SELECT * FROM DeleteRemaining;", []).then((data) => {
            // alert(data.rows.length);
            if (data.rows.length > 0) {
                try {
                    //if (this.platform.is('android')) {
                        for (var i = 0; i < data.rows.length; i++) {
                            //Construct the input JSON for decrypt
                            var time=this.counter*1.1*1000;
                            this.counter++;
                            MyAppToolbarComponent.API_COUNTER++;
                            this.deleteFromServerDb(data.rows.item(i).address.trim(), data.rows.item(i).coinType.trim(), time);                              
                            // alert(data.rows.item(i).coinType.trim()+"delete:"+data.rows.item(i).address.trim());
                        }
                    //}
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

    }

    ngAfterViewInit() {
        this.myCurrency = SharedContentProvider.mySelectedFiatCurrencies;
        let tempCoinType: String = localStorage.getItem(this.coinType);
        this.currencyType = (tempCoinType == null || tempCoinType == undefined || tempCoinType == "") ? "USD" : tempCoinType;
        this.getTodaysCoinValueAll();

        //For testing
        /*if(this.coinType=="ETH")
         this.onAddSuccess("0x788ac1DE2798e6787bE46E64D255de8554BCeb10","0x788ac1DE2798e6787bE46E64D255de8554BCeb10");*/

        /*setTimeout(() => {
         if(this.walletAddressInputBox.nativeElement!=null && this.walletAddressInputBox.nativeElement!=undefined)
         {
         this.walletAddressInputBox.nativeElement.focus();
         }
         }, 1000);*/

    }

    /*
     ngOnInit(): any {
     this.buildForm();
     }

     buildForm(): void {
     this.addAddress = new FormGroup({
     'walletAddress': new FormControl('', Validators.required),
     'mobileNo': new FormControl('', Validators.required),
     'email': new FormControl('', [Validators.required, Validators.pattern("[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{1,63}$")]),
     'password': new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(24)])
     });
     }
     */

    ngOnDestroy() {
        //unsubscribe to ensure no memory leaks
        if (this.connectivityMonitorSubscription != null)
            this.connectivityMonitorSubscription.unsubscribe();
        if (this.httpCallSubscription != null)
            this.httpCallSubscription.unsubscribe();
        if (this.myFiatCurrenciesUpdateSubscription != null)
            this.myFiatCurrenciesUpdateSubscription.unsubscribe();            
    }

    onAddSuccess(address, encryptedAddress) {
        var paramObj: any = {};//new Object();
        paramObj.address = address;
        paramObj.encryptedAddress = encryptedAddress;

        ///this.onAddWalletAddress.emit(paramObj);
        this.onAddWalletAddress.emit(paramObj);
    }

    addToAddRemain(address, coinType){
        this.database.executeSql("INSERT INTO AddRemaining values('" + address + "', '" + coinType + "')", [])
                    .then((results) => console.log(results)).catch(/* e => alert(e.message)*/);    
    }

    toastMsg(msg: string, controlToFocus: any = null, duration: number = -1) {
        if (this.toast != null)
            this.toast.dismiss();

        if (msg != "") {
            if (duration == -1) {
                this.toast = this.toastCtrl.create({
                    message: msg,
                    showCloseButton: true,
                    closeButtonText: 'OK',
                    position: 'bottom'
                });
            }
            else {
                this.toast = this.toastCtrl.create({
                    message: msg,
                    duration: duration,
                    position: 'bottom'
                });
            }

            this.toast.onDidDismiss(() => {
                /*if(controlToFocus!=null && controlToFocus!= undefined)
                 {
                 controlToFocus.setFocus();
                 /!*if(controlToFocus.nativeElement != undefined)
                 controlToFocus.nativeElement.focus();*!/
                 }*/
                //console.log('Dismissed toast');
            });

            this.toast.present();

            setTimeout(() => {
                if (controlToFocus != null && controlToFocus != undefined) {
                    controlToFocus.setFocus();
                }
            }, 1500);

        }
    }

    insertInToDBTable(address) {
        try {

            if (this.dbKey == "") {
                return;
            }

            var config = {
                name: 'crypto.db',
                location: 'default'/*,
                 key: this.dbKey*/
            };

            this.sqlite.create(config)
                .then((db: SQLiteObject) => {
                    //encrpt address and insert
                    try {

                        if (this.platform.is('android')) {
                            myAppPlugin.encrypt(
                                (success) => {
                                    var obj = JSON.parse(success);
                                    if (obj != null) {
                                        db.executeSql("INSERT INTO " + this.coinType + "_wallet(address,balance) values('" + obj.address + "', '0.0')", []).then(
                                            //(results) => this.onAddSuccess(address,results.insertId)
                                            (results) => {
                                                this.onAddSuccess(address, obj.address);
                                                this.addToAddRemain(address,this.coinType);
                                                this.addtoServerDb(address, this.coinType);
                                            }
                                        ).catch(
                                            e => this.toastMsg((e.message.toLowerCase().includes("constraint") ? "This address is added already." : ""), null, 3000)
                                        );
                                    }
                                    else {
                                        this.toastMsg("Something went wrong. Check your internet connection and try again.", null, 3000);
                                    }
                                },
                                (error) => {
                                },
                                { "address": address });
                        }
                        else {
                            db.executeSql("INSERT INTO " + this.coinType + "_wallet(address,balance) values('" + address + "', '0.0')", []).then(
                                //(results) => this.onAddSuccess(address,results.insertId)
                                (results) => {
                                    this.onAddSuccess(address, address);
                                    this.addToAddRemain(address,this.coinType);
                                    this.addtoServerDb(address, this.coinType);
                                }
                            ).catch(
                                e => this.toastMsg((e.message.toLowerCase().includes("constraint") ? "This address is added already." : ""), null, 3000)
                            );
                        }

                    }
                    catch (e) {
                        /*alert(e.message);*/
                        this.toastMsg("Something went wrong. Check your internet connection and try again.", null, 3000);
                    }

                })
                .catch(
                    e => /*this.toastMsg(""+e.message)*/  this.toastMsg("Something went wrong. Check your internet connection and try again.", null, 3000)
                );
        }
        catch (error) {
            //alert(error.message);
            this.toastMsg("Something went wrong. Check your internet connection and try again.", null, 3000);
        }
    }

    //Add item to the SQL storage
    //and update UI list
    addWalletAddress() {

        if (this.toast != null)
            this.toast.dismiss();

        if (this.addAddressForm.valid) {
            var data: string = this.id;

            if (!this.isValidWalletAddress(data, this.coinType)) {
                this.toastMsg(this.coinType + " address is invalid.", this.walletAddressInputBox, 3000);
                return;
            }

            //For testing (in Browser)
            // this.onAddSuccess(data);

            //Add to SQLLite
            this.insertInToDBTable(data);

            this.id = '';
            this.showError = false;
        }
        else {
            //this.toastMsg("Wallet address is required.",this.walletAddressInputBox);
            this.toastMsg("Wallet address is required.", this.walletAddressInputBox, 3000);
            this.showError = true;
        }
    }

    //QR Code scanner UI event
    scanbarcode() {
        this.barcodeScanner.scan({
            prompt: "Place a QR Code inside the scan area.",
            formats: "QR_CODE"
        }).then((barcodeData) => {

            if (barcodeData.cancelled || barcodeData.text == "")
                return;

            // Success! QR code is here
            if (barcodeData.format == "QR_CODE") {
                let scanAddress: string = "";
                try {
                    let JSONObj = JSON.parse(barcodeData.text);
                    this.id = JSONObj[0].toString();
                }
                catch (ex) {
                    scanAddress = barcodeData.text;
                }

                let pos: number = 0;
                if ((pos = scanAddress.indexOf(":")) != -1) {
                    this.id = scanAddress.substr(pos + 1).trim();
                }
                else
                    this.id = scanAddress.trim();

                this.ChangeDetectorRef.detectChanges();
                this.addWalletAddress();

            }
            else {
                //Display a toast as 'Not a valid QR code' with OK button.
                this.toastMsg("Not a valid QR code.", null, 3000);
            }

        }, (err) => {
            //alert("error");
            // An error occurred
            this.toastMsg("Something went wrong. Check your internet connection and try again.", null, 3000);
        });
    }

    public getTodaysCoinValueAll() {
        this.httpHeader = new Headers();
        //this.httpHeader.append('Content-Type', 'application/json');
        this.httpHeader.append('Accept', '*/*');
        this.httpRequestOptionsArgsObj = { headers: this.httpHeader };

        //HTTP GET Call
        try {

            if (this.httpCallSubscription != null)
                this.httpCallSubscription.unsubscribe();

            let URL: string = 'https://min-api.cryptocompare.com/data/price?fsym=' + this.coinType + '&tsyms=INR,USD,EUR,SGD,AUD,CNY,JPY,GBP,CAD,BRL,CHF,HKD,KRW,MXN,MYR,NZD,PHP,RUB,TRY,ZAR,AED';
            this.httpCallSubscription = Observable.interval(2 * 60 * 1000)
                .startWith(0)
                .flatMap(() => this.http.get(URL, this.httpRequestOptionsArgsObj))
                /*.map(res=> res.json())*/
                .subscribe(res => {
                    //console.log(res.json());
                    let coinInfo = res.json();
                    this.todayCoinValueAll = coinInfo;
                    this.getTodaysCoinValue();
                    this.ChangeDetectorRef.detectChanges();

                }, (error => {
                    //console.log(error);
                    //alert("Exception: " + error);

                    //TODO
                    //Check internet connection and report it to user.
                    if (error.status === 0 && ConnectivityMonitorProvider.bConnected == false) {
                        this.toastMsg("Check your internet connection.", null, 3000);
                    }

                }))

                /*
                 // ...and calling .json() on the response to return data
                 .map((res:Response) => alert(res.json()))
                 //...errors if any
                 .catch((error:any) => Observable.throw(error.json().error || 'Server error'))
                 */
                ;

            //Javascript HTTP Call
            //httpGetAsync('http://api.coindesk.com/v1/bpi/currentprice/INR.json');

            /*
             JSONP is a method of performing API requests which go around the issue of CORS.
             This is a security measure implemented in all browsers that stops you from using an API in a potentially
             unsolicited way and most APIs, including the iTunes API, are protected by it.
             */
            /*
             try {

             this.jsonp.request('http://api.coindesk.com/v1/bpi/currentprice/INR.json', { method: 'Get' })
             .subscribe(res => {
             var bitcoinInfo = res.json();
             alert(bitcoinInfo.bpi.USD.rate);
             alert(bitcoinInfo.bpi.INR.rate);
             }, (error => {
             alert("error:" + error);
             }))
             //.map(res => alert(res.json()))
             //.toPromise()
             //  .then((response) => alert("response"+response.json()))
             ;
             }
             catch(exception)
             {
             alert("exception:"+exception.message);
             }
             */
        }
        catch (exception) {
            //console.log(exception.message);
            //alert("exception:"+exception.message);
        }
    }

    getTodaysCoinValue() {

        //Preserve the currencyType selected
        localStorage.setItem(this.coinType, this.currencyType.toString());
        //console.log(this.coinType+ ":"+this.currencyType.toString());

        switch (this.currencyType) {
            case "USD":
                this.todayCoinValue = (isNaN(this.todayCoinValueAll.USD) ? "0.0" : this.todayCoinValueAll.USD);
                break;
            case "INR":
                this.todayCoinValue = (isNaN(this.todayCoinValueAll.INR) ? "0.0" : this.todayCoinValueAll.INR);
                break;
            case "EUR":
                this.todayCoinValue = (isNaN(this.todayCoinValueAll.EUR) ? "0.0" : this.todayCoinValueAll.EUR);
                break;
            case "GBP":
                this.todayCoinValue = (isNaN(this.todayCoinValueAll.GBP) ? "0.0" : this.todayCoinValueAll.GBP);
                break;
            case "SGD":
                this.todayCoinValue = (isNaN(this.todayCoinValueAll.SGD) ? "0.0" : this.todayCoinValueAll.SGD);
                break;
            case "AUD":
                this.todayCoinValue = (isNaN(this.todayCoinValueAll.AUD) ? "0.0" : this.todayCoinValueAll.AUD);
                break;
            case "CNY":
                this.todayCoinValue = (isNaN(this.todayCoinValueAll.CNY) ? "0.0" : this.todayCoinValueAll.CNY);
                break;
            case "JPY":
                this.todayCoinValue = (isNaN(this.todayCoinValueAll.JPY) ? "0.0" : this.todayCoinValueAll.JPY);
                break;
            case "CAD":
                this.todayCoinValue = (isNaN(this.todayCoinValueAll.CAD) ? "0.0" : this.todayCoinValueAll.CAD);
                break;
            case "BRL":
                this.todayCoinValue = (isNaN(this.todayCoinValueAll.BRL) ? "0.0" : this.todayCoinValueAll.BRL);
                break;
            case "CHF":
                this.todayCoinValue = (isNaN(this.todayCoinValueAll.CHF) ? "0.0" : this.todayCoinValueAll.CHF);
                break;
            case "HKD":
                this.todayCoinValue = (isNaN(this.todayCoinValueAll.HKD) ? "0.0" : this.todayCoinValueAll.HKD);
                break;
            case "KRW":
                this.todayCoinValue = (isNaN(this.todayCoinValueAll.KRW) ? "0.0" : this.todayCoinValueAll.KRW);
                break;
            case "MXN":
                this.todayCoinValue = (isNaN(this.todayCoinValueAll.MXN) ? "0.0" : this.todayCoinValueAll.MXN);
                break;
            case "MYR":
                this.todayCoinValue = (isNaN(this.todayCoinValueAll.MYR) ? "0.0" : this.todayCoinValueAll.MYR);
                break;
            case "NZD":
                this.todayCoinValue = (isNaN(this.todayCoinValueAll.NZD) ? "0.0" : this.todayCoinValueAll.NZD);
                break;
            case "PHP":
                this.todayCoinValue = (isNaN(this.todayCoinValueAll.PHP) ? "0.0" : this.todayCoinValueAll.PHP);
                break;
            case "RUB":
                this.todayCoinValue = (isNaN(this.todayCoinValueAll.RUB) ? "0.0" : this.todayCoinValueAll.RUB);
                break;
            case "TRY":
                this.todayCoinValue = (isNaN(this.todayCoinValueAll.TRY) ? "0.0" : this.todayCoinValueAll.TRY);
                break;
            case "ZAR":
                this.todayCoinValue = (isNaN(this.todayCoinValueAll.ZAR) ? "0.0" : this.todayCoinValueAll.ZAR);
                break;
            case "AED":
                this.todayCoinValue = (isNaN(this.todayCoinValueAll.AED) ? "0.0" : this.todayCoinValueAll.AED);
                break;
            default:
                this.todayCoinValue = (isNaN(this.todayCoinValueAll.USD) ? "0.0" : this.todayCoinValueAll.USD);
        }


        this.onCurrencyTypeChange.emit(this.currencyType);
        this.onCoinValueChange.emit(this.todayCoinValue);
    }

    isValidWalletAddress(address:String, type) {
        let regexp;
        var isValid;
        switch (type) {
            case "BTC":
            case "BCH":
                regexp = new RegExp('^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$');
                break;
            case "LTC":
                regexp = new RegExp('^[Ll3Mm][a-zA-Z0-9]{25,34}$');
                break;
            case "ETC":
            case "ETH":
                regexp = new RegExp('^0[xX][0-9a-fA-F]+$');
                if (address.substring(0, 2) != '0x' || address.length != 42) {
                    return false;
                }
                if (regexp.test(address)) {
                    return true;
                }
                else {
                    return false;
                }
            case "XRP":
                regexp=new RegExp("r[0-9a-zA-Z]{33}");
                isValid=regexp.test(address);
                return isValid;
            case "DASH":
                regexp=new RegExp("X[1-9A-HJ-NP-Za-km-z]{33}");
                isValid=regexp.test(address);
                return isValid;
            case "ZEC":
                if(address.charAt(0).toLowerCase()!="t"){
                // not start with t
                    if(address.charAt(0).toLowerCase()!="z"){
                        // not start with z
                        return false;
                    }
                }
                try{
                    var checkzec = base58check.decode(address, 'hex');
                    return checkzec.prefix === '1c';
                }catch(error){
                    return false;
                }
            case "DOGE":
                if(address.charAt(0).toUpperCase()!="D"){
                // not start with D
                    if(address.charAt(0).toUpperCase()!="A"){
                        // not start with A
                        return false;
                    }
                }
                try{
                    var checkdoge = base58check.decode(address, 'hex');
                    if(checkdoge.prefix === '1e' || checkdoge.prefix === '16'){
                        return true
                    }else{
                        return false;
                    }
                }catch(error){
                    return false;
                }
            case "WAVE":
                regexp=new RegExp("3P[0-9a-zA-Z]{33}");
                isValid=regexp.test(address);
                return isValid;
            case "DGB":
            case "PIVX":
            case "COLX":
                if(address.charAt(0)!="D"){
                    // not start with D
                    return false;
                }
                try{
                    var checkcolx = base58check.decode(address, 'hex');
                    return checkcolx.prefix === '1e';
                }catch(error){
                    return false;
                }
            case "XVG":
                if(address.charAt(0)!="V"){
                    // not start with V
                    return false;
                }
                try{
                    const checkxvg = base58check.decode(address, 'hex');
                    return checkxvg.prefix === '46';
                }catch(error){
                    return false;
                }
            case "PPC":
                if(address[0]!="P"){
                    // not start with P
                    return false;
                }
                try{
                    const checkppc = base58check.decode(address, 'hex');
                    return checkppc.prefix === '37';
                }catch(error){
                    return false;
                }                                  

            default:
                return true;
        }
        if (regexp.test(address)) {
            return true;
        }
        else {
            return false;
        }
    }

    addtoServerDb(address, coinType, timeOutNumber=0) {                        
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
                    MyAppToolbarComponent.API_COUNTER++;
                    var sendData={ 
                        "uuid": this.uuid,
                        "jwtToken":MyAppToolbarComponent.jwtToken,
                        address:address,
                        coinType:coinType
                    };
                    var url=this.domain + coinType + "/" + this.uuid; 
                    var eventId=MyAppToolbarComponent.API_COUNTER.toString();
                    this.apiQueue.addToQueue(new ApiData(ApiData.POST,url,sendData,eventId));
                    this.event.subscribe(eventId,(originalData, res)=>{

                    try{
                        if(res.result=="success"){
                            this.database.executeSql("DELETE FROM AddRemaining WHERE address='" + originalData.address + "'", [])
                            .then((results) => console.log(results)).catch(/* e => alert(e.message)*/);                              
                                this.updateEmailVerification(res.verified);                                                    
                        }
                    }
                    catch(ex)
                    {

                    }   
                       
                    });
                    this.apiQueue.executeQueue(false);

                    // let URL = this.domain + coinType + "/" + this.uuid;  //@@@TODO update in server
                    // this.http.post(URL, { "address": address,"jwtToken":MyAppToolbarComponent.jwtToken  })
                    //     .subscribe(res => {
                    //         if(res.json().result=="success")
                    //         {
                    //             this.database.executeSql("DELETE FROM AddRemaining WHERE address='" + address + "'", [])
                    //             .then((results) => console.log(results)).catch(/*e => alert(e.message)*/);            
                    //             this.updateEmailVerification();
                    //         }else{
                    //             this.database.executeSql("INSERT INTO AddRemaining values('" + address + "', '" + coinType + "')", [])
                    //             .then((results) => console.log(results)).catch(/* e => alert(e.message)*/);
                    //         }
                    //     }, (error => {
                    //         // alert("fail to server"+error.message);
                    //         this.database.executeSql("INSERT INTO AddRemaining values('" + address + "', '" + coinType + "')", [])
                    //             .then((results) => console.log(results)).catch(/* e => alert(e.message)*/);
                    //     }))                    
                });
            }
            
        });                
    }

    deleteFromServerDb(address, coinType, timeOutNumber) {
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
                    try{
                        if(res.result=="success"){
                            this.database.executeSql("DELETE FROM DeleteRemaining WHERE address='" + originalData.address + "'", [])
                                .then((results) => console.log(results)).catch(/*e => alert(e.message)*/);                           
                                this.updateEmailVerification(res.verified);                           
                        }
                    }
                    catch(ex)
                    {

                    }                    
                });
                this.apiQueue.executeQueue(false);
                    
                // var data = { "uuid": this.uuid,"jwtToken":MyAppToolbarComponent.jwtToken };
                // let URL = this.domain + coinType + "/" + this.uuid + "/" + address;  //@@@TODO update in server
                // this.http.delete(URL, new RequestOptions({ body: data }))
                //     .subscribe(res => {
                //         // alert("deleted from server");
                //         if(res.json().result=="success")
                //         {
                //             this.database.executeSql("DELETE FROM DeleteRemaining WHERE address='" + address + "'", [])
                //                 .then((results) => console.log(results)).catch(/*e => alert(e.message)*/);
                //             this.updateEmailVerification();
                //         }else{
                //             this.database.executeSql("INSERT INTO DeleteRemaining values('" + address + "', '" + coinType + "')", [])
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

    updateEmailVerification(bVerified){         
        this.storage.set("isEmailVerified",bVerified);                    
    }

    getTokenAndUpdateTokenApiCall(){
        this.storage.get("uuid").then((val) => {
            this.uuid = val;
            let URL = this.domain +  "/getToken";  
            MyAppToolbarComponent.API_COUNTER++;
            var sendData={"uuid": this.uuid };
            var eventId=MyAppToolbarComponent.API_COUNTER.toString();
            this.apiQueue.addToQueue(new ApiData(ApiData.POST,URL,sendData,eventId));
            this.event.subscribe(eventId,(originalData, res)=>{
                    if(res.result=="success")
                    {
                        MyAppToolbarComponent.jwtToken=res.jwtToken;                          
                        this.storage.get("email").then((val) => {
                            (val==null)? this.email = "" : this.email = val;
                            this.uniqueDeviceID.get()
                            .then((uuid: any) => {
                                    this.uuid = uuid;
                                    this.storage.get("token").then((val) => {                                                        
                                        if(val!=null)
                                        {
                                            this.token = val;
                                        }                                                                                
                                        MyAppToolbarComponent.API_COUNTER++;
                                        var sendData={
                                            "email": this.email,
                                            "token": this.token,
                                            "uuid": this.uuid,
                                            "jwtToken":MyAppToolbarComponent.jwtToken 
                                            };
                                        var url="http://meteorjs-backend:3000/updateToken";
                                        var eventId=MyAppToolbarComponent.API_COUNTER.toString();
                                        this.apiQueue.addToQueue(new ApiData(ApiData.POST,url,sendData,eventId));
                                        this.event.subscribe(eventId,(originalData, data)=>{                                                                                    
                                            if(data.result=="success"){
                                                this.updateEmailVerification(data.verified);
                                                this.syncLocalTablesAddressWithServer();
                                            }                                           
                                        });
                                        this.apiQueue.executeQueue(false);     
                                        
                                        this.syncLocalTablesAddressWithServer();
                                        
                                        //@@@ Don't know why is this repeat event definition???
                                        // Check and remove it
                                        // Begin
                                        ////////////////////////////////////////////////////////////////////////////

                                        const options: PushOptions = {
                                            android: {
                                            },
                                            ios: {
                                                alert: 'true',
                                                badge: true,
                                                sound: 'false'
                                            },
                                            windows: {},
                                            browser: {
                                                pushServiceURL: 'http://push.api.phonegap.com/v1/push'
                                            }
                                        };
                                        const pushObject: PushObject = this.push.init(options);
                                        pushObject.on('notification').subscribe((notification: any) => {
                                            console.log('Received a notification', notification);
                                            if(notification.title=="CryptoBalance" && notification.message=="Email address is verified successfully."){
                                                this.updateEmailVerification(true);     
                                                this.syncLocalTablesAddressWithServer();                                         
                                            }                                            
                                        });
                
                                        pushObject.on('registration').subscribe((registration: any) => {
                                            if(registration.registrationId!=null && registration.registrationId!="")
                                            {
                                                this.storage.set("token", registration.registrationId);
                                                this.token=registration.registrationId;

                                                MyAppToolbarComponent.API_COUNTER++;
                                                var sendData={
                                                    "email": this.email,
                                                    "token": this.token,
                                                    "uuid": this.uuid,
                                                    "jwtToken":MyAppToolbarComponent.jwtToken
                                                };
                                                var url="http://meteorjs-backend:3000/updateToken";
                                                var eventId=MyAppToolbarComponent.API_COUNTER.toString();
                                                this.apiQueue.addToQueue(new ApiData(ApiData.POST,url,sendData,eventId));
                                                this.event.subscribe(eventId,(originalData, data)=>{                                                                                                  
                                                    if(data.result=="success"){
                                                        this.updateEmailVerification(data.verified);
                                                        this.syncLocalTablesAddressWithServer();
                                                    }                                           
                                                });
                                                this.apiQueue.executeQueue(false);
                                                // MyAppToolbarComponent.API_COUNTER++;
                                                // setTimeout(() => {  
                                                // this.http.post("http://meteorjs-backend:3000/updateToken", {
                                                //     "email": this.email,
                                                //     "token": this.token,
                                                //     "uuid": this.uuid,
                                                //     "jwtToken":MyAppToolbarComponent.jwtToken
                                                // }).subscribe(res => {
                                                //     if(res.json().result=="success"){
                                                //         this.updateEmailVerification();
                                                //     }
                                                //     // alert("added to server");
                                                // }, (error => {
                                                //     // alert("fail to server"+error.message);
                                                // }))
                                                // },2200);
                                            }
                                        });
                                        pushObject.on('error').subscribe(error => console.error('Error with Push plugin', "er" + error));

                                        //End
                                        /////////////////////////////////////////////////////////////////////////////////////////////////
                                    });
                                }).catch((error: any) => console.log(error));


                        });    
                    }
                })            
            });
            this.apiQueue.executeQueue(false);
    }            
}

// function httpGetAsync(theUrl) {
//     var xmlHttp = new XMLHttpRequest();
//     xmlHttp.onreadystatechange = function () {
//         if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
//             var bitcoinInfo = JSON.parse(xmlHttp.responseText);
//         alert(bitcoinInfo.bpi.USD.rate);
//         alert(bitcoinInfo.bpi.INR.rate);
//
//     }
//     xmlHttp.open("GET", theUrl, true);
//     xmlHttp.send(null);
// };

