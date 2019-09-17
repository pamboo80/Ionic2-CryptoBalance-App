declare let myAppPlugin: any;
import { Component, Input, ViewChild, ElementRef, Renderer, NgZone } from '@angular/core';
import {
    AlertController,
    Platform,
    ToastController,
    NavController,
    NavParams,
    ViewController,
    LoadingController,
    Events,
    TextInput
} from 'ionic-angular';
import { Http, Headers, RequestOptionsArgs, RequestOptions/*, Jsonp*/ } from "@angular/http";
import { ConnectivityMonitorProvider } from "../../providers/connectivity-monitor/connectivity-monitor";
import { SelectCurrencyPage } from "../select-currency/select-currency";
import { Storage } from '@ionic/storage';
import { CryptoCurrencySelectPage } from "../crypto-currency-select/crypto-currency-select";
import { SQLite, SQLiteObject } from "@ionic-native/sqlite";
import { count } from 'rxjs/operator/count';
import { MyAppToolbarComponent} from  '../../components/my-app-toolbar/my-app-toolbar';
import { ApiQueue } from '../../app/ApiQueue';
import { ApiData } from '../../app/ApiData';
import { PushOptions, PushObject, Push } from '@ionic-native/push';
import { Subscription } from 'rxjs';

/**
 * Generated class for the SettingPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
    selector: 'page-settings',
    templateUrl: 'settings.html',
})
export class SettingsPage {
    domain = "http://meteorjs-backend:3000/cryptobalance/";
    token: String="";
    email: string = "";
    uuid: String="";
    counter: number =1;
    isChecked: boolean = false;
    saveButtonText:String="Save";
    private httpHeader: Headers;
    private httpRequestOptionsArgsObj: RequestOptionsArgs;

    private platform: Platform = null;

    private deRegister: any;
    private toast = null;
    private loading = null;
    private bAlertControlIsOnTopView = false;
    private bFiatCurencyDailogCalled = false;
    private bValidEmailID = false;
    private config: { name: string; location: string };
    private database: SQLiteObject;
    private isDisplayEmailVerified:boolean=false;
    private apiQueue:ApiQueue; 
    private connectivityMonitorSubscription: Subscription = null;

    private renderer: Renderer;
    private elementRef: ElementRef; //any element reference

    @ViewChild('emailAddress') emailAddressInputBox; //: ElementRef;
    constructor(platform: Platform,
        private navCtrl: NavController,
        private viewCtrl: ViewController,
        private navParams: NavParams,
        private alertCtrl: AlertController,
        private toastCtrl: ToastController,
        private http: Http,
        private sqlite: SQLite,
        /*private jsonp:Jsonp*/
        private loadingCtrl: LoadingController,
        private event:Events,
        private push: Push,
        private zone:NgZone,
        private storage: Storage) {

        // getting  instance of Apiqueue 
        this.apiQueue=ApiQueue.getInstance(event ,http,toastCtrl);

        this.config = {
            name: 'crypto.db',
            location: 'default'/*,
                  key: this.dbKey*/
        };
        this.connectivityMonitorSubscription = ConnectivityMonitorProvider
        .isConnected().subscribe(data => {
            if (data === true) {
                this.verifyEmail();
                this.updateEmailVerification(); //Not needed @@@
            }
        });

        this.sqlite.create(this.config)
            .then((db: SQLiteObject) => {
                this.database = db;
            })
            .catch(
                //e => alert(e)
            );

        this.deRegister = platform.registerBackButtonAction(() => {
            if (this.bAlertControlIsOnTopView == false && this.bFiatCurencyDailogCalled == false) {
                console.log("pop");
                //viewCtrl.dismiss();
                this.navCtrl.pop();
            }
        });


        platform.ready().then(() => {

            this.platform = platform;

            this.updateEmailVerification();        
            this.verifyEmail();
        
            if (platform.is('cordova')){
      
              //Subscribe on pause
              platform.pause.subscribe(() => {
                
              });
      
              //Subscribe on resume
              platform.resume.subscribe(() => {
               this.verifyEmail();
              });
             }

          });
    }

    verifyEmail(){
        this.storage.get("email").then((val) => {
            if (val != null) {
                this.email = val;
                this.isChecked = true;
                this.storage.get("isEmailVerified").then((isEmailVerified)=>{
                    if(isEmailVerified!=null && isEmailVerified==false){
                        
                        this.saveButtonText="Send verification email";
                        this.isDisplayEmailVerified=true;
                        this.storage.get("uuid").then((val) => {
                            this.uuid=val;                        
                            MyAppToolbarComponent.API_COUNTER++;
                            var sendData={};
                            var url="http://meteorjs-backend:3000/isemailverified/"+this.uuid;
                            var eventId=MyAppToolbarComponent.API_COUNTER.toString();
                            this.apiQueue.addToQueue(new ApiData(ApiData.POST,url,sendData,eventId));
                            this.event.subscribe(eventId,(originalData, res)=>{
                                if(res.result=="success"){
                                    this.isDisplayEmailVerified=false;                                    
                                    this.zone.run(()=>{
                                        this.saveButtonText="Save";                                      
                                        this.updateEmailInStorage();
                                    });                                    
                                }/*
                                else
                                {
                                    this.toastMsg("Email address is not verified. Please look for the verification email in your inbox or click the button [Send verification email] to get a new verification email.", null, 4500);                        
                                }*/
                            });
                            this.apiQueue.executeQueue(false);
                        });                        

                    }else{
                        this.isDisplayEmailVerified=false;
                        this.saveButtonText="Save";
                    }
                });
            }          
        });
       
    }

    updateEmailVerification(){

        //@@@ This is not required at all.
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
                this.isDisplayEmailVerified=false;
                this.saveButtonText="Save";
                this.updateEmailInStorage(); 
                this.getRemainAddCoin("ETC");
                this.getRemainAddCoin("BTC");
                this.getRemainAddCoin("LTC");
                this.getRemainAddCoin("ETH");
                this.getRemainAddCoin("BCH");                                
            }
        });
        /////

    }
    
    changeEmail(data){
        if(data.value==""){
            return;
        }        
        if(this.isDisplayEmailVerified){
            this.storage.get("email").then((oldEmail) => {
                if(oldEmail!=null){
                    if(oldEmail!=data.value){
                        this.saveButtonText="Update";
                        this.isDisplayEmailVerified=false;
                    }else{
                        this.saveButtonText="Send verification email";
                        this.isDisplayEmailVerified=true;
                    }
                }            
            });
        }else{
            this.storage.get("email").then((oldEmail) => {
                if(oldEmail!=null){
                    if(oldEmail!=data.value){
                        this.saveButtonText="Update";
                        this.isDisplayEmailVerified=false;
                    }else{
                        this.storage.get("isEmailVerified").then((isEmailVerified)=>{
                            if(isEmailVerified !=null){
                                if(isEmailVerified==false){
                                    this.saveButtonText="Send verification email";
                                    this.isDisplayEmailVerified=true;
                                }else{
                                    this.saveButtonText="Save";
                                    this.isDisplayEmailVerified=false;
                                }
                            }
                        });                        
                    }    
                }
                
            });
        }
    }
    
    presentLoadingCustom() {
        if (this.loading != null)
            this.loading.dismiss();

        this.loading = this.loadingCtrl.create({
            /*spinner: 'dots',*/
            content: `<div>Please wait ...</div>`
        });

        this.loading.onDidDismiss(() => {
            console.log('Dismissed loading');
            this.bAlertControlIsOnTopView = false;
        });

        this.loading.present();
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
                /*if(!this.bValidEmailID)
                  {
                    if(controlToFocus!=null && controlToFocus!= undefined)
                    {
                       controlToFocus.setFocus();
                       /!*if(controlToFocus.nativeElement != undefined)
                       controlToFocus.nativeElement.focus();*!/
                    }
                  }*/
                //console.log('Dismissed toast');
            });

            this.toast.present();

            /*
            let element = this.elementRef.nativeElement.querySelector('emailAddress');
            if (!this.bValidEmailID) {
                this.renderer.invokeElementMethod(element, 'focus', []);  
            }
            */
            
            setTimeout(() => {
                if (controlToFocus != null && controlToFocus != undefined) {
                    if (!this.bValidEmailID) {
                        controlToFocus.setFocus();
                    }
                }
            }, 1500);            

        }
    }

    saveEmail() {

        try{
            if (ConnectivityMonitorProvider.bConnected == false) {
                this.toastMsg("Check your internet connection.", null, 3000);
                return;
            }
            var email = this.email.trim();
            if (email === "") {
                //this.toastMsg("Email address is required.",this.emailAddressInputBox);
                this.toastMsg("Email address is required.", this.emailAddressInputBox, 3000);
                return;
            }
    
            //email regular expression
            let regExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (!regExp.test(email)) {
                //this.toastMsg("Email address is invalid.",this.emailAddressInputBox);
                this.toastMsg("Email address is invalid.", this.emailAddressInputBox, 3000);
            }
            else {
    
                this.bValidEmailID = true;
    
                if (this.toast != null)
                    this.toast.dismiss();
    
                this.bAlertControlIsOnTopView = true;
    
                // this.loading = this.loadingCtrl.create({
                //     /*spinner: 'dots',*/
                //     content: `<div>Please wait ...</div>`
                // });
    
                this.presentLoadingCustom();
    
                this.storage.get("token").then((val) => {
                    if(val!=null)
                    {
                        this.token = val;
                        this.storage.get("uuid").then((uuid) => {
                            if(uuid!=null)
                            {
                                this.uuid = uuid;      
                                
                                this.storage.get("email").then(oldEmail=>{
    
                                    if(oldEmail!=email){
                                        this.storeEmail(email);        
                                    }else{
                                        // oldemail newemail are same email
                                        this.storage.get("isEmailVerified").then(isEmailVerified=>{
                                            if(isEmailVerified==true){
                                                this.toastMsg("Email address is saved already.", this.emailAddressInputBox, 3000);
                                                this.loading.dismiss();
                                                this.bAlertControlIsOnTopView = false;
                                            }else{
                                                this.storeEmail(email); 
                                            }
                                        });                                    
                                    }                                
                                })
                                                                              
                            }
                            else
                            {
                                this.toastMsg("Something went wrong. Check your internet connection and try again.", this.emailAddressInputBox, 3000);                                     
                                this.loading.dismiss();
                                this.bAlertControlIsOnTopView = false;
                            }                        
                        });
                    }
                    else
                    {
                        this.toastMsg("Something went wrong. Check your internet connection and try again.", this.emailAddressInputBox, 3000);
                        this.loading.dismiss();
                        this.bAlertControlIsOnTopView = false;
                    }
                    
                });            
    
            }
        }
        catch(ex)
        {
            this.toastMsg("Something went wrong. Check your internet connection and try again.", this.emailAddressInputBox, 3000);
            this.loading.dismiss();
            this.bAlertControlIsOnTopView = false;
        }
        
    }

    checkboxIsChecked(e: any) {
        if (e.checked) {
            this.isChecked = true;

            //let element = this.elementRef.nativeElement.querySelector('emailAddress');
            //this.renderer.invokeElementMethod(element, 'focus', []);                       
            
            //this.renderer.invokeElementMethod(this.emailAddressInputBox, 'focus', []);      

            setTimeout(() => {
                if (this.emailAddressInputBox != null && this.emailAddressInputBox != undefined) {
                         this.emailAddressInputBox.setFocus();                  
                }
            }, 250);   
                        
        }
        else {  
            this.storage.get("email").then(email=>{
                if (email != null) {               
                    this.storage.get("uuid").then((val) => {                                          
                        this.uuid = val;
                        this.bAlertControlIsOnTopView = true;
                        let alt = this.alertCtrl.create({
                            title: 'CryptoBalance',
                            subTitle: 'Are you sure want to stop notifications?',
                            buttons: [
                                {
                                    text: 'Yes',
                                    handler: () => {
                                        
                                        MyAppToolbarComponent.API_COUNTER++;
                                        var sendData={
                                            "email": "",
                                            "token": "",
                                            "jwtToken":MyAppToolbarComponent.jwtToken,
                                            "uuid": this.uuid
                                        };
                                        var url= "http://meteorjs-backend:3000/updateToken";
                                        var eventId=MyAppToolbarComponent.API_COUNTER.toString();
                                        this.apiQueue.addToQueue(new ApiData(ApiData.POST,url,sendData,eventId));
                                        this.event.subscribe(eventId,(originalData, res)=>{
                                            
                                            if(res.result=="success"){
                                                this.email = "";
                                                this.isChecked = false;
                                                this.storage.remove("email");
                                                this.storage.remove("isEmailVerified");
                                                this.saveButtonText="Save";
                                                this.isDisplayEmailVerified=false;
                                            }else{
                                                this.toastMsg("Something went wrong. Check your internet connection and try again.", this.emailAddressInputBox, 3000);
                                                this.isChecked = true;
                                            }
                                        });
                                        this.apiQueue.executeQueue(false);
                                        
                                        // let URL = "http://meteorjs-backend:3000/updateToken";
                                        // this.http.post(URL, {
                                        //     "email": "",
                                        //     "token": "",
                                        //     "jwtToken":MyAppToolbarComponent.jwtToken,
                                        //     "uuid": this.uuid
                                        // })
                                        //     .subscribe(res => {
                                        //         if(res.json().result=="success"){
                                        //             this.email = "";
                                        //             this.isChecked = false;
                                        //             this.storage.remove("email");
                                        //             this.storage.remove("isEmailVerified");
                                        //             this.saveButtonText="Save";
                                        //             this.isDisplayEmailVerified=false;
                                        //         }                                           
                                        //         // alert("deleted from server");
                                        //     }, (error => {
                                        //         this.toastMsg("Something went wrong. Check your internet connection and try again.", this.emailAddressInputBox, 3000);
                                        //         this.isChecked = true;
                                        //     }))
        
                                    }
                                },
                                {
                                    text: 'No',
                                    handler: () => {
                                        this.isChecked = true;
                                    }
                                }
                            ],
                            enableBackdropDismiss: false
                        });
        
                        alt.onDidDismiss(() => {
                            this.bAlertControlIsOnTopView = false;
                        });
        
                        alt.present();     
                
                    });  
                }else{
                    this.email = "";
                    this.isChecked=false;
                }
            });                         
        }
    }

    dismissPage() {
        this.viewCtrl.dismiss();
    }

    ionViewWillEnter() {        
        this.viewCtrl.showBackButton(false);
        this.storage.set("inAModalPage", "true");
    }

    ionViewWillLeave() {
        this.storage.set("inAModalPage", "false");
        if (this.bFiatCurencyDailogCalled == true) {
            this.bFiatCurencyDailogCalled = false;
            return;
        }
        if (this.bAlertControlIsOnTopView == true) return;

        if (this.toast != null)
            this.toast.dismiss();

        this.deRegister();
    }

    openSelectFiatCurrencies() {
        this.bFiatCurencyDailogCalled = true;
        this.navCtrl.push(SelectCurrencyPage).then(() => {/*this.viewCtrl.dismiss();*/
        });
    }

    openSelectCryptoCurrencies() {
        this.navCtrl.push(CryptoCurrencySelectPage).then(() => {/*this.viewCtrl.dismiss();*/
        });
    }

    storeEmail(email) {   
        
        // new code for verifying email 
        this.storage.get("email").then((storageEmail) =>{

            MyAppToolbarComponent.API_COUNTER++;
            var sendData={
                "emailId": email,
                "fcmToken": this.token
            };
            var url="http://meteorjs-backend:3000/verifyemail/"+this.uuid;
            var eventId=MyAppToolbarComponent.API_COUNTER.toString();
            this.apiQueue.addToQueue(new ApiData(ApiData.POST,url,sendData,eventId));
            this.event.subscribe(eventId,(originalData, res)=>{
                if(res.result=="success"){
                    this.storage.set("email", email);
                    this.storage.get("isEmailVerified").then((isEmailVerified)=>{
                        if(isEmailVerified!=null){
                            if(isEmailVerified==false){
                                // not verified and updating email
                                this.saveButtonText="Send verification email";
                                this.isDisplayEmailVerified=true;
                                this.bAlertControlIsOnTopView = false;
                            }
                        }else{
                            // if isEmailVerified is null then set to false
                            this.saveButtonText="Send verification email";
                            this.isDisplayEmailVerified=true;
                            this.bAlertControlIsOnTopView = false;
                            this.storage.set("isEmailVerified", false);
                        }
                    });
                    if (storageEmail != null && storageEmail != email) {     
                        this.toastMsg("Email address is updated. Please look for the verification email in your inbox and click the link in that email. A confirmation message will appear in your web browser.", this.emailAddressInputBox, 6000);                          
                        this.loading.dismiss();
                        this.saveButtonText="Send verification email";
                        this.isDisplayEmailVerified=true;
                        this.bAlertControlIsOnTopView = false;
                        this.storage.set("isEmailVerified",false);
                        this.getRemainAddCoin("ETC");
                        this.getRemainAddCoin("BTC");
                        this.getRemainAddCoin("LTC");
                        this.getRemainAddCoin("ETH");
                        this.getRemainAddCoin("BCH");
                    }
                    else
                    {
                        //Adding the wallet address.                   
                        //this.loading.present().then(() => {
                            this.storage.get("isEmailVerified").then((isEmailVerified)=>{
                                if(isEmailVerified==null || isEmailVerified==false){
                                    this.getRemainAddCoin("ETC");
                                    this.getRemainAddCoin("BTC");
                                    this.getRemainAddCoin("LTC");
                                    this.getRemainAddCoin("ETH");
                                    this.getRemainAddCoin("BCH");
                                } 
                            })
                            // not verified and updating email
                            this.toastMsg("Email address is saved. Please look for the verification email in your inbox and click the link in that email. A confirmation message will appear in your web browser.", this.emailAddressInputBox, 6000);
                            this.loading.dismiss();
                            this.bAlertControlIsOnTopView = false;

                        //});                                         
                    }
                }else{  
                    this.toastMsg("Something went wrong. Check your internet connection and try again.", this.emailAddressInputBox, 3000);
                    this.loading.dismiss();
                    this.bAlertControlIsOnTopView = false;
                }
            });
            this.apiQueue.executeQueue(false);

            // this.http.post("http://meteorjs-backend:3000/verifyemail/"+this.uuid, {
            //         "emailId": email,
            //         "fcmToken": this.token
            //     }).subscribe(response=>{
            //         if(response.json().result=="success"){  
            //             this.storage.set("email", email);
            //             this.storage.get("isEmailVerified").then((isEmailVerified)=>{
            //                 if(isEmailVerified!=null){
            //                     if(isEmailVerified==false){
            //                         // not verified and updating email
            //                         this.saveButtonText="Send verification email";
            //                         this.isDisplayEmailVerified=true;
            //                     }
            //                 }else{
            //                     // if isEmailVerified is null then set to false
            //                     this.saveButtonText="Send verification email";
            //                     this.isDisplayEmailVerified=true;
            //                     this.storage.set("isEmailVerified", false);
            //                 }
            //             });
            //             if (storageEmail != null && storageEmail != email) {               
            //                 this.toastMsg("Email address is updated.", this.emailAddressInputBox, 3000);
            //                 this.loading.dismiss();
            //                 this.saveButtonText="Save";
            //                 this.isDisplayEmailVerified=false;
            //             }
            //             else
            //             {
            //                 //Adding the wallet address.                   
            //                 //this.loading.present().then(() => {
            //                     this.storage.get("isEmailVerified").then((isEmailVerified)=>{
            //                         if(isEmailVerified==null || isEmailVerified==false){
            //                             this.getRemainAddCoin("ETC");
            //                             this.getRemainAddCoin("BTC");
            //                             this.getRemainAddCoin("LTC");
            //                             this.getRemainAddCoin("ETH");
            //                         } 
            //                     })
            //                     // not verified and updating email
            //                     this.toastMsg("Email address is saved.", this.emailAddressInputBox, 3000);
            //                     this.loading.dismiss();
            //                 //});                     
                        
            //             }
            //         }else{  
            //             this.toastMsg("Something went wrong. Check your internet connection and try again.", this.emailAddressInputBox, 3000);
            //             this.loading.dismiss();
            //         }
            //     } , (error => {
            //         this.toastMsg("Something went wrong. Check your internet connection and try again.", this.emailAddressInputBox, 3000);
            //         this.loading.dismiss();         
            //     }));

        });

        // this.storage.get("email").then((val) => {                          
                
        //         // if (val == email) {
        //         //     this.toastMsg("Email address is saved.", this.emailAddressInputBox, 3000);
        //         //     this.loading.dismiss();
        //         //     return;
        //         // } 

        //         //update email address
        //         this.http.post("http://meteorjs-backend:3000/updateToken", {
        //             "email": email,
        //             "token": this.token,
        //             "jwtToken":MyAppToolbarComponent.jwtToken,
        //             "uuid": this.uuid
        //         })
        //             .subscribe(res => {
                                             
        //                 if(res.json().result=="exist")
        //                 {
        //                     // [later if needed]
        //                     //This is not required now. 
        //                     //Just adding it here if someone wants the same Email ID when he lost the phone or so.

        //                     //Below,instead of toast , it will be a prompt.
        //                     //The email address is already taken. Please choose another one OR press claim to verify it's you"
        //                     //once "Claim" is clicked REST API is called to send an email from server and it's response in ionic should toast
        //                     //A verification code is sent and please verify to claim this account.
                    
        //                     this.toastMsg("The email address is already taken. Please choose another one.", this.emailAddressInputBox, 3000);
        //                     this.loading.dismiss();   
        //                     return;

        //                 }
                        
        //                 this.storage.set("email", email);

        //                 if (val != null && val != email) {               
        //                     this.toastMsg("Email address is updated.", this.emailAddressInputBox, 3000);
        //                     this.loading.dismiss();    
        //                 }
        //                 else
        //                 {
        //                     //Adding the wallet address.                   
        //                     //this.loading.present().then(() => {
        //                         this.getRemainAddCoin("ETC");
        //                         this.getRemainAddCoin("BTC");
        //                         this.getRemainAddCoin("LTC");
        //                         this.getRemainAddCoin("ETH");
                  
        //                         this.toastMsg("Email address is saved.", this.emailAddressInputBox, 3000);
        //                         this.loading.dismiss();
        //                     //});                     
                        
        //                 }
                        

        //             }, (error => {

        //                 // alert("token fail to server" + error.message);
        //                 this.toastMsg("Something went wrong. Check your internet connection and try again.", this.emailAddressInputBox, 3000);
        //                 this.loading.dismiss();

        //             }))
            
        // });

    }

    getRemainAddCoin(coinType) {
        this.database.executeSql('SELECT * FROM ' + coinType + '_wallet;', []).then((data) => {
            //alert(data.rows.length);
            if (data.rows.length > 0) {
                let address: String[] = [];
                let myjson: string = "{";
                try {
                    var i=0;
                    if (this.platform.is('android')) {
                        for (i = 0; i < data.rows.length; i++) {
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
                                        var time=this.counter*1.1*1000;      //@@@ This time is not used at all                                  
                                        this.counter++;    
                                        this.database.executeSql("INSERT INTO AddRemaining values('" + address[i] + "', '" + coinType + "')", [])
                                    .then((results) => console.log(results)).catch(/* e => alert(e.message)*/);                             
                                        this.addtoServerDb(address[i], coinType,time);
                                    }
                                }
                            },
                            (error) => {
                                // alert("error:"+error)
                            },
                            JSON.parse(myjson));   
                    }
                    else{
                        for (i = 0; i < data.rows.length; i++) {
                            var time=this.counter*1.1*1000;            //@@@ This time variable is not used at all                
                            this.counter++;    
                            this.database.executeSql("INSERT INTO AddRemaining values('" + address[i] + "', '" + coinType + "')", [])
                        .then((results) => console.log(results)).catch(/* e => alert(e.message)*/);                             
                            this.addtoServerDb(address[i], coinType,time);
                        }
                    }                
                }
                catch (e) {
                    // alert(e);
                }
            }
            //alert('Executed SELECT SQL' + this.addresses.length), () => console.log("table created")
        })
        .catch(
            // e => alert(e)
        );
    }    

    addtoServerDb(address, coinType, timeOutNumber) {
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
                    let URL = this.domain + coinType + "/" + this.uuid;   //@@@TODO update in server

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
                                .then((results) => console.log(results)).catch(/*e => alert(e.message)*/);                                                          
                                
                                if(res.verified==true)
                                {
                                    this.isDisplayEmailVerified=false;
                                    this.storage.set("isEmailVerified",true);
                                    this.saveButtonText="Save";       
                                }
    
                            }
                        }
                        catch(ex)
                        {

                        }
                      
                    });
                    this.apiQueue.executeQueue(false);

                    // this.http.post(URL, { "address": address, "jwtToken":MyAppToolbarComponent.jwtToken})
                    //     .subscribe(res => {
                    //         if(res.json().result=="success")
                    //         {
                    //             this.database.executeSql("DELETE FROM AddRemaining WHERE address='" + address + "'", [])
                    //             .then((results) => console.log(results)).catch(/*e => alert(e.message)*/);            
                    //             this.isDisplayEmailVerified=false;
                    //             this.storage.set("isEmailVerified",true);
                    //             this.saveButtonText="Save";
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

    updateEmailInStorage(){
        this.storage.get("isEmailVerified").then((isEmailVerified)=>{
            if(isEmailVerified!=null && isEmailVerified==false){
                this.toastMsg("Email address is verified successfully.", null , 3000);
                this.storage.set("isEmailVerified",true);   
                this.isDisplayEmailVerified=false;
                this.zone.run(()=>{
                    this.saveButtonText="Save";                                      
                    this.updateEmailInStorage(); //@@@ WTF he coded!!!
                });                
            }else{
            }
        });        
    }   

}
