import {Http} from "@angular/http";
declare let myAppPlugin:any;

import { SQLite, SQLiteObject} from "@ionic-native/sqlite";
//import { Observable , Subscription} from 'rxjs/Rx';

export class ETHTokenDetails {

  address:String;
  balance:String="0.0";
  coinType:String;
  value:Number=0.0;
  todayCoinValueAll:any=[];

  walletObj:any;
  parentObj:any;

  constructor(private sqlite:SQLite,
              private http:Http,
              coinType:String,
              address:String,
              balance:String,
              walletObj:any,
              parentObj:any)
  {
    if(coinType.trim()=="")
    {
      this.coinType = "-unknown-";
    }
    this.coinType  = coinType;
    this.address   = address;
    this.balance   = balance;
    this.walletObj = walletObj;
    this.parentObj = parentObj;

    //Find the today's symbol value based on the symbol
    this.todayTokenValue();

  }

  public todayTokenValue()
  {
    try {

      if(this.coinType == "-unknown-")
        return;

      // console.log("hello"+this.coinType);
      let URL:string='https://min-api.cryptocompare.com/data/price?fsym='+ this.coinType + '&tsyms=INR,USD,EUR,SGD,AUD,CNY,JPY,GBP,CAD,BRL,CHF,HKD,KRW,MXN,MYR,NZD,PHP,RUB,TRY,ZAR,AED';
      console.log(URL);
      this.http.get(URL)
        .subscribe(res=>
       {
         this.todayCoinValueAll["USD"]=res.json().USD;
         this.todayCoinValueAll["INR"]=res.json().INR;
         this.todayCoinValueAll["EUR"]=res.json().EUR;
         this.todayCoinValueAll["SGD"]=res.json().SGD;
         this.todayCoinValueAll["AUD"]=res.json().AUD;
         this.todayCoinValueAll["CNY"]=res.json().CNY;
         this.todayCoinValueAll["JPY"]=res.json().JPY;
         this.todayCoinValueAll["GBP"]=res.json().GBP;
         this.todayCoinValueAll["CAD"]=res.json().CAD;
         this.todayCoinValueAll["BRL"]=res.json().BRL;

         this.todayCoinValueAll["CHF"]=res.json().CHF;
         this.todayCoinValueAll["HKD"]=res.json().HKD;
         this.todayCoinValueAll["KRW"]=res.json().KRW;
         this.todayCoinValueAll["MXN"]=res.json().MXN;
         this.todayCoinValueAll["MYR"]=res.json().MYR;
         this.todayCoinValueAll["NZD"]=res.json().NZD;
         this.todayCoinValueAll["PHP"]=res.json().PHP;
         this.todayCoinValueAll["RUB"]=res.json().RUB;
         this.todayCoinValueAll["TRY"]=res.json().TRY;
         this.todayCoinValueAll["ZAR"]=res.json().ZAR;
         this.todayCoinValueAll["AED"]=res.json().AED;

         let currencyValue= this.todayCoinValueAll[this.parentObj.currencyType];
         this.value = Number((isNaN(currencyValue))?"0.0":currencyValue) * Number((this.balance=="")?"0.0":this.balance);

         this.walletObj.sumTokenValue();

         //console.log("data"+this.value);

        });       

    }
    catch(exception)
    {
      //alert("exception:"+exception.message);
    }
  }

}
