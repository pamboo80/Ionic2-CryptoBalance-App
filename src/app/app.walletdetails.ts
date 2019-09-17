declare let myAppPlugin: any;

import {SQLite, SQLiteObject} from "@ionic-native/sqlite";

import {ETHTokenDetails} from "./app.ETHtokendetails";

import {OnDestroy} from '@angular/core';
import {Http, Headers, RequestOptionsArgs, Response} from '@angular/http';
import {Observable, Subscription} from 'rxjs/Rx';

import {ConnectivityMonitorProvider} from "../providers/connectivity-monitor/connectivity-monitor";

export class WalletDetail implements OnDestroy {

  address: String;
  encryptedAddress: String;
  balance: String;
  coinType: String;
  walletName: String;
  parentObj: any;
  myETHTokenDetails: Array<ETHTokenDetails> = [];
  tokenValue: Number = 0;
  nthItem: any = 1;

  private tokenCount = 0;

  private httpHeader: Headers;
  private httpRequestOptionsArgsObj: RequestOptionsArgs;
  //private httpResponse:Response;

  private connectivityMonitorSubscription: Subscription = null;
  private httpCallSubscription: Subscription = null;  

  constructor(private http: Http, private sqlite: SQLite,
              coinType: String,
              address: String,
              encryptedAddress: String,
              balance: String,
              walletName:String,
              nthItem: any,
              parentObj: any) {
    this.coinType = coinType;
    this.address = address;
    this.encryptedAddress = encryptedAddress;
    this.balance = balance;
    this.walletName = walletName;
    this.parentObj = parentObj;
    this.nthItem = nthItem;

    if(this.walletName == undefined || this.walletName ==null || this.walletName.trim()==""){
      this.walletName ="NA";
    }     

    setTimeout(() => {   
      this.updateLiveBalance();
    }, this.nthItem * 1000);     

    this.connectivityMonitorSubscription = ConnectivityMonitorProvider.isConnected().subscribe(data => {
      if (data === true) {
        //setTimeout(() => {
        this.updateLiveBalance();
        //}, 100);
      }
    });
  }

  ngOnDestroy() {
    //unsubscribe to ensure no memory leaks
    if (this.connectivityMonitorSubscription != null)
      this.connectivityMonitorSubscription.unsubscribe();
    if (this.httpCallSubscription != null)
      this.httpCallSubscription.unsubscribe();
  }

  public updateLiveBalance() {
    this.httpHeader = new Headers();
    //this.httpHeader.append('Content-Type', 'application/json');
    this.httpHeader.append('Accept', '*!/!*');
    this.httpRequestOptionsArgsObj = {headers: this.httpHeader};

    //HTTP GET Call
    try {
      if (this.httpCallSubscription != null)
        this.httpCallSubscription.unsubscribe();

      //Moved Blockcypher to chain.so
      //let URL: string = 'https://api.blockcypher.com/v1/' + this.coinType.toLocaleLowerCase() + '/main/addrs/' + this.address;
      //let URL: string = 'https://chain.so/api/v2/get_address_balance/' + this.coinType.toLocaleUpperCase() + '/' + this.address;

      let URL: string ="";
      if (this.coinType.toLowerCase() == "BTC".toLowerCase()) {        
        URL = "https://blockchain.info/balance?api_code=your-api-key&active=" + this.address;
      }
      else
      if (this.coinType.toLowerCase() == "LTC".toLowerCase()) {        
        URL = "https://chainz.cryptoid.info/ltc/api.dws?q=getbalance&key=your-api-key&a=" + this.address;
      }
      else          
      if (this.coinType.toLowerCase() == "ETH".toLowerCase()) {        
        URL = "https://api.etherscan.io/api?module=account&action=balance&address=" + this.address;
      }
      else
      if (this.coinType.toLowerCase() == "ETC".toLowerCase()) {
        // URL = "https://etcchain.com/api/v1/getAddressBalance?address=" + this.address;
        URL = "https://api.gastracker.io/addr/" + this.address;
      }
      else
      if (this.coinType.toLowerCase() == "BCH".toLowerCase()) {
         //URL = "https://blockdozer.com/insight-api/addr/"+this.address;
        URL = "https://bch-chain.api.btc.com/v3/address/"+ this.address;
      }
      else
      if (this.coinType.toLowerCase() == "XRP".toLowerCase()) {
        URL = "https://data.ripple.com/v2/accounts/"+this.address+"/balance_changes?descending=true&limit=1";
      }
      /*else
      if (this.coinType.toLowerCase() == "ZEC".toLowerCase()) {
        URL = "https://chain.so/api/v2/get_address_balance/ZEC/"+this.address;
      }*/

      //this.parentObj.toastMsg(URL, 5000);
           
      if(URL=="") return;

      this.httpCallSubscription = Observable.interval(2 * 60 * 1000)
        .startWith(0)
        .flatMap(() => this.http.get(URL, {}/*this.httpRequestOptionsArgsObj*/))
        .subscribe(res => {
          try { 
            //console.log(res.json());
            //this.parentObj.toastMsg(JSON.stringify(res.json()), 5000);
            let balanceInfo = res.json(); //(this.coinType.toLowerCase() == "LTC".toLowerCase())? res:
            if(this.coinType.toLowerCase() == "BTC".toLowerCase()){            
                this.balance=(String) (Number(balanceInfo[this.address.toString()].final_balance) / Number(10 ** 8));              
            }
            else if(this.coinType.toLowerCase() == "LTC".toLowerCase()) {             
                this.balance=(String) (Number(balanceInfo));            
            }
            else if (this.coinType.toLowerCase() == "ETC".toLowerCase()) {
              // this.balance = (String)(Number(balanceInfo.balance));
                 this.balance = (String)(Number(balanceInfo.balance.ether));
            }
            else if(this.coinType.toLowerCase() == "BCH".toLowerCase()){                         
                if(balanceInfo.err_no=="0")
                {                  
                  this.balance = (String)(Number(balanceInfo.data.balance) / Number(10 ** 8));
                }
                else 
                {
                  //this.parentObj.toastMsg("BCH address should be in it's legacy address format.", 3000);
                }
            }
            else if(this.coinType.toLowerCase() == "XRP".toLowerCase()){
              if(balanceInfo.result=="success"){
                this.balance=(String) (Number(balanceInfo.balance_changes[0].final_balance));
              }
            }
            else {
              let sBalance: string;
              if (this.coinType.toLowerCase() == "ETH".toLowerCase()/* && sBalance.length>=18*/) {

                sBalance = balanceInfo.result.toString().trim();  
                this.balance = (String)(Number(sBalance) / Number(10 ** 18)); //Ethereum decimals

                /*sBalance = balanceInfo.balance.toString().trim();                
                sBalance = this.toFixed(sBalance);
                while(sBalance.length<18)
                 sBalance= "0"+ sBalance;

                this.balance = (((sBalance.length==18)? "0".toString() : sBalance.substr(0,sBalance.length-18))
                 + "." + ((sBalance.length==18)? sBalance : sBalance.substr(sBalance.length-18)));
                 */

                //Update the balance to the SQLLite table
                this.updateBalanceInDB(this.address, this.balance);
                //Call the parent data member
                this.parentObj.sumBalance();                                                    

                setTimeout(() => {                
                                  
                if(this.parentObj.ETHTokensSetLoaded.size < this.parentObj.getmyETHWalletsSize() )                
                {
                  this.parentObj.toastMsg("Retrieving token details...", 3000);
                }
                
                this.parentObj.ETHTokensSetLoaded.add(this.address);

                //For token balances
                URL = "https://api.ethplorer.io/getAddressInfo/" + this.address + "?apiKey=freekey";
                this.http.get(URL)
                  .subscribe(res=>
                  {
                    balanceInfo = res.json();
                    /*sBalance = balanceInfo.ETH.balance.toString().trim();
                    this.balance = sBalance;*/

                    if (balanceInfo.tokens != undefined && balanceInfo.tokens != null) {
                      //Tokens found
                      //console.log(balanceInfo.tokens);
                      this.myETHTokenDetails = [];
                      this.tokenCount = balanceInfo.tokens.length;
                      for (var i = 0; i < this.tokenCount; i++) {

                        let balance = (String)(Number(balanceInfo.tokens[i].balance) / Number(10 ** balanceInfo.tokens[i].tokenInfo.decimals));

                        let tokenDetails: ETHTokenDetails = new ETHTokenDetails(this.sqlite, this.http, balanceInfo.tokens[i].tokenInfo.symbol,
                          balanceInfo.tokens[i].tokenInfo.address, balance, this, this.parentObj);
                        this.myETHTokenDetails.push(tokenDetails);
                      }
                    }

                    //Update the balance to the SQLLite table
                    this.updateBalanceInDB(this.address, this.balance);
                    //Call the parent data member
                    this.parentObj.sumBalance();

                  });
                //}, this.parentObj.getArraymyETHWalletsIndex(this.address)*5000);   
                }, this.nthItem * 5000);              

              }
              // all other coins
              else {
               
                //Commented the Blockcypher APIs
                /*
                sBalance = balanceInfo.balance.toString().trim();
                //this.parentObj.toastMsg(sBalance, 5000);
                this.balance = (String)(Number(sBalance) / Number(10 ** 8));
                //this.parentObj.toastMsg(this.balance, 5000);
                */

                //Replaced with chain.so APIs                        
                if(balanceInfo.status=="success"){     
                  this.balance=(String) (Number(balanceInfo.data.confirmed_balance));
                 }                                         

              }
            }

            if (this.coinType.toLowerCase() != "ETH".toLowerCase()) {
              //Update the balance to the SQLLite table
              this.updateBalanceInDB(this.address, this.balance);

              //Call the parent data member
              this.parentObj.sumBalance();
            }

          }
          catch (ex) {
            //alert(ex);
            //this.parentObj.toastMsg(ex, 3000);
          }
        }, (error => {

          //this.parentObj.toastMsg(error, 3000);

          //console.log("error"+error);
          
          //alert("Exception: " + error);

          //TODO
          //Check internet connection and report it to user.
          /*if(error.status===0 && ConnectivityMonitorProvider.bConnected==false)
           {
           //Not required as it will be reported to the user when refresh happens in get coin value call itself.
           }*/

        }))

    }
    catch (exception) {
      //alert("exception:"+exception.message);
    }
  }

  public sumTokenValue() {
    if (this.tokenCount == this.myETHTokenDetails.length) {

      var balances = this.myETHTokenDetails.map(i => Number(i.value));
      // gets the sum of the array of balances
      this.tokenValue = balances.reduce((c, d) => c + d, 0);
      this.tokenValue = Number(this.tokenValue.toFixed(2));
      //console.log("Total: " + this.tokenValue);

      this.parentObj.ChangeDetectorRef.detectChanges();
    }
  }

  private updateBalanceInDB(address, balance) {
    var config = {
      name: 'crypto.db',
      location: 'default'/*,
       key: this.dbKey*/
    };

    this.sqlite.create(config)
      .then((db: SQLiteObject) => {

        if (this.parentObj.platform.is('android')) {
          myAppPlugin.encrypt(
            (success) => {
              var obj = JSON.parse(success);
              if (obj != null) {
                db.executeSql("UPDATE " + this.coinType + "_wallet  SET balance=" + balance + " WHERE address='" + obj.address + "'", []).then(
                  (results) => console.log(results)
                ).catch(
                  /* e => alert(e.message)*/
                );
              }
            },
            (error) => {
            },
            {"address": address});
        }
        else {
          db.executeSql("UPDATE " + this.coinType + "_wallet  SET balance=" + balance + " WHERE address='" + address + "'", []).then(
            (results) => console.log(results)
          ).catch(
            /* e => alert(e.message)*/
          );
        }

      })
      .catch(
        /*e => alert(e.message)*/
      );
  }

  private toFixed(x) {
    var e=null;
    if (Math.abs(x) < 1.0) {
      e = parseInt(x.toString().split('e-')[1]);
      if (e!=null) {
          x *= Math.pow(10,e-1);
          x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
      }
    } else {
      e = parseInt(x.toString().split('+')[1]);
      if (e > 20) {
          e -= 20;                  
          x /= Math.pow(10,e);
          x += (new Array(e+1)).join('0');
      }
    }
    return x;
  }

  static getCurrencySymbol(currencyType) {
    let symbol:String = "$";

    switch (currencyType) {
      case "USD":
        symbol =  '$';
        break;
      case "INR":
        symbol =  '\u20B9';
        break;
      case "EUR":
        symbol =  '\u20AC';
        break;
      case "GBP":
        symbol =  '\u00A3';
        break;
      case "SGD":
        symbol =  'S$';
        break;
      case "JPY":
        symbol =  '\u00A5';
        break;
      case "CNY":
        symbol =  '\u00A5';
        break;
      case "AUD":
        symbol =  'A$';
        break;
      case "BRL":
        symbol =  'R$';
        break;
      case "CAD":
        symbol =  'C$';
        break;      
      case "CHF":
        symbol =  'SFr';
        break;
      case "HKD":
        symbol =  'HK$';
        break;
      case "KRW":
        symbol =  '₩';
        break;
      case "MXN":
        symbol =  'Mex$';
        break;
      case "MYR":
        symbol =  'RM';
        break;
      case "NZD":
        symbol =  '$';
        break;
      case "PHP":
        symbol =  '₱';
        break;
      case "RUB":
        symbol =  '₽';
        break;
      case "TRY":
        symbol =  '₺';
        break;
      case "ZAR":
        symbol =  'R';
        break;
      case "AED":
        symbol =  'AED';
        break;      
    }
    return symbol;
  }

}