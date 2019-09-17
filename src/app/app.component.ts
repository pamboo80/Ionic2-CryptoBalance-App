declare let myAppPlugin: any;

import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TabsPage } from '../pages/tabs/tabs';

import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { ConnectivityMonitorProvider } from "../providers/connectivity-monitor/connectivity-monitor";
import { SharedContentProvider } from "../providers/shared-content/shared-content";

//import { FiatCurrency } from "./app.fiatcurrency";

import { enableProdMode } from '@angular/core';
enableProdMode();

@Component({
  templateUrl: 'app.html',
  providers: [ConnectivityMonitorProvider]
})
export class MyApp {
  rootPage: any = TabsPage;

  private splashScreen: SplashScreen;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, private sqlite: SQLite, private ConnectivityMonitorProvider: ConnectivityMonitorProvider, private SharedContentProvider: SharedContentProvider) {
    platform.ready().then(() => {
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      this.splashScreen = splashScreen;

      if (platform.is('android')) {
        //setTimeout(() => {
        this.init();
        //}, 100);

      }
      else {
        splashScreen.hide();
        this.createDBTable('999999999999');
      }

    });
  }

  private init() {
    this.splashScreen.hide();
    //let dbKey:String;

    try {
      /*myAppPlugin.getAndroidID(function(success){ alert(success);},
       function(error){alert(error);},{ "dummy": "123" });*/

      myAppPlugin.getAndroidID(
        (success) => {
          var obj = JSON.parse(success);
          if (obj != null) {
            if (obj.ANDRIOD_ID != null && obj.ANDRIOD_ID.trim() != "") {
              this.createDBTable(obj.ANDRIOD_ID);
            }
          }

        },
        (error) => {
          this.createDBTable('999999999999');
        }, { "dummy": "123" });
    }
    catch (Error) { // Code to handle exception
      //alert(Error.message);
      this.createDBTable('999999999999');
    }
  }

  private alterWalletTables1(dbKey) {
    try {
      var config = {
        name: 'crypto.db',
        location: 'default'/*,
         key: dbKey*/
      };

      //create the sqllite db/table
      this.sqlite.create(config)
        .then((db: SQLiteObject) => {
          db.executeSql('ALTER TABLE BTC_wallet ADD COLUMN notes VARCHAR(2400) DEFAULT ' + "''", [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("BTC table altered")
            )
            .catch(
              //e => alert(e)
            );

          db.executeSql('ALTER TABLE LTC_wallet ADD COLUMN notes VARCHAR(2400) DEFAULT ' + "''", [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("LTC table altered")
            )
            .catch(
              //e => alert(e)
            );

          db.executeSql('ALTER TABLE ETH_wallet ADD COLUMN notes VARCHAR(2400) DEFAULT ' + "''", [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("ETH table altered")
            )
            .catch(
              //e => alert(e)
            );

          db.executeSql('ALTER TABLE ETC_wallet ADD COLUMN notes VARCHAR(2400) DEFAULT ' + "''", [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("ETC table altered")
            )
            .catch(
              //e => alert(e)
            );

            db.executeSql('ALTER TABLE BCH_wallet ADD COLUMN notes VARCHAR(2400) DEFAULT ' + "''", [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("BCH table altered")
            )
            .catch(
              //e => alert(e)
            );

          db.executeSql('ALTER TABLE BTS_wallet ADD COLUMN notes VARCHAR(2400) DEFAULT ' + "''", [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("BTS table altered")
            )
            .catch(
              //e => alert(e)
            );

          db.executeSql('ALTER TABLE DASH_wallet ADD COLUMN notes VARCHAR(2400) DEFAULT ' + "''", [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("DASH table altered")
            )
            .catch(
              //e => alert(e)
            );

          db.executeSql('ALTER TABLE DOGE_wallet ADD COLUMN notes VARCHAR(2400) DEFAULT ' + "''", [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("DOGE table altered")
            )
            .catch(
              //e => alert(e)
            );

          db.executeSql('ALTER TABLE IOTA_wallet ADD COLUMN notes VARCHAR(2400) DEFAULT ' + "''", [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("IOTA table altered")
            )
            .catch(
              //e => alert(e)
            );
          db.executeSql('ALTER TABLE LSK_wallet ADD COLUMN notes VARCHAR(2400) DEFAULT ' + "''", [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("LSK table altered")
            )
            .catch(
              //e => alert(e)
            );

          db.executeSql('ALTER TABLE NEO_wallet ADD COLUMN notes VARCHAR(2400) DEFAULT ' + "''", [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("NEO table altered")
            )
            .catch(
              //e => alert(e)
            );

          db.executeSql('ALTER TABLE NXT_wallet ADD COLUMN notes VARCHAR(2400) DEFAULT ' + "''", [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("NXT table altered")
            )
            .catch(
              //e => alert(e)
            );

          db.executeSql('ALTER TABLE PPC_wallet ADD COLUMN notes VARCHAR(2400) DEFAULT ' + "''", [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("PPC table altered")
            )
            .catch(
              //e => alert(e)
            );

          db.executeSql('ALTER TABLE STEEM_wallet ADD COLUMN notes VARCHAR(2400) DEFAULT ' + "''", [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("STEEM table altered")
            )
            .catch(
              //e => alert(e)
            );

          db.executeSql('ALTER TABLE XEM_wallet ADD COLUMN notes VARCHAR(2400) DEFAULT ' + "''", [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("XEM table altered")
            )
            .catch(
              //e => alert(e)
            );

          db.executeSql('ALTER TABLE XRP_wallet ADD COLUMN notes VARCHAR(2400) DEFAULT ' + "''", [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("XRP table altered")
            )
            .catch(
              //e => alert(e)
            );
        })
        .catch( //e => alert(e)
        );

    }
    catch (error) {
      //alert(error.message);
    }
  }

  private alterWalletTables2(dbKey) {
    try {
      var config = {
        name: 'crypto.db',
        location: 'default'/*,
         key: dbKey*/
      };

      //create the sqllite db/table
      this.sqlite.create(config)
        .then((db: SQLiteObject) => {
          db.executeSql('ALTER TABLE BTC_wallet ADD COLUMN wallet_name VARCHAR(15) DEFAULT ' + "''", [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("BTC table altered")
            )
            .catch(
              //e => alert(e)
            );

          db.executeSql('ALTER TABLE LTC_wallet ADD COLUMN wallet_name VARCHAR(15) DEFAULT ' + "''", [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("LTC table altered")
            )
            .catch(
              //e => alert(e)
            );

          db.executeSql('ALTER TABLE ETH_wallet ADD COLUMN wallet_name VARCHAR(15) DEFAULT ' + "''", [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("ETH table altered")
            )
            .catch(
              //e => alert(e)
            );

          db.executeSql('ALTER TABLE ETC_wallet ADD COLUMN wallet_name VARCHAR(15) DEFAULT ' + "''", [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("ETC table altered")
            )
            .catch(
              //e => alert(e)
            );

          
          db.executeSql('ALTER TABLE BCH_wallet ADD COLUMN wallet_name VARCHAR(15) DEFAULT ' + "''", [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("BCH table altered")
            )
            .catch(
              //e => alert(e)
            );

          db.executeSql('ALTER TABLE BTS_wallet ADD COLUMN wallet_name VARCHAR(15) DEFAULT ' + "''", [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("BTS table altered")
            )
            .catch(
              //e => alert(e)
            );

          db.executeSql('ALTER TABLE DASH_wallet ADD COLUMN wallet_name VARCHAR(15) DEFAULT ' + "''", [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("DASH table altered")
            )
            .catch(
              //e => alert(e)
            );

          db.executeSql('ALTER TABLE DOGE_wallet ADD COLUMN wallet_name VARCHAR(15) DEFAULT ' + "''", [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("DOGE table altered")
            )
            .catch(
              //e => alert(e)
            );

          db.executeSql('ALTER TABLE IOTA_wallet ADD COLUMN wallet_name VARCHAR(15) DEFAULT ' + "''", [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("IOTA table altered")
            )
            .catch(
              //e => alert(e)
            );
          db.executeSql('ALTER TABLE LSK_wallet ADD COLUMN wallet_name VARCHAR(15) DEFAULT ' + "''", [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("LSK table altered")
            )
            .catch(
              //e => alert(e)
            );

          db.executeSql('ALTER TABLE NEO_wallet ADD COLUMN wallet_name VARCHAR(15) DEFAULT ' + "''", [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("NEO table altered")
            )
            .catch(
              //e => alert(e)
            );

          db.executeSql('ALTER TABLE NXT_wallet ADD COLUMN wallet_name VARCHAR(15) DEFAULT ' + "''", [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("NXT table altered")
            )
            .catch(
              //e => alert(e)
            );

          db.executeSql('ALTER TABLE PPC_wallet ADD COLUMN wallet_name VARCHAR(15) DEFAULT ' + "''", [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("PPC table altered")
            )
            .catch(
              //e => alert(e)
            );

          db.executeSql('ALTER TABLE STEEM_wallet ADD COLUMN wallet_name VARCHAR(15) DEFAULT ' + "''", [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("STEEM table altered")
            )
            .catch(
              //e => alert(e)
            );

          db.executeSql('ALTER TABLE XEM_wallet ADD COLUMN wallet_name VARCHAR(15) DEFAULT ' + "''", [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("XEM table altered")
            )
            .catch(
              //e => alert(e)
            );

          db.executeSql('ALTER TABLE XRP_wallet ADD COLUMN wallet_name VARCHAR(15) DEFAULT ' + "''", [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("XRP table altered")
            )
            .catch(
              //e => alert(e)
            );

        })
        .catch( //e => alert(e)
        );

    }
    catch (error) {
      //alert(error.message);
    }
  }

  private createDBTable(dbKey) {
    try {
      var config = {
        name: 'crypto.db',
        location: 'default'/*,
        key: dbKey*/
      };

      //create the sqllite db/table
      this.sqlite.create(config)
        .then((db: SQLiteObject) => {

          // Create BTC_wallet Table
          db.executeSql('CREATE TABLE IF NOT EXISTS BTC_wallet(address VARCHAR(256) PRIMARY KEY , balance VARCHAR(30), notes VARCHAR(2400))', [])
            .then((result) => /*alert('Executed SQL: ' + JSON.stringify(result))*/() => console.log("BTC table created")
            )
            .catch(
              //e => alert(e)
            );

          // Create LTC_wallet Table
          db.executeSql('CREATE TABLE IF NOT EXISTS LTC_wallet(address VARCHAR(256) PRIMARY KEY , balance VARCHAR(30), notes VARCHAR(2400))', [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("LTC table created")
            )
            .catch(
              //e => alert(e)
            );

          // Create ETH_wallet Table
          db.executeSql('CREATE TABLE IF NOT EXISTS ETH_wallet(address VARCHAR(256) PRIMARY KEY , balance VARCHAR(30), notes VARCHAR(2400))', [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("ETH table created")
            )
            .catch(
              //e => alert(e)
            );

          // Create ETC_wallet Table
          db.executeSql('CREATE TABLE IF NOT EXISTS ETC_wallet(address VARCHAR(256) PRIMARY KEY , balance VARCHAR(30), notes VARCHAR(2400))', [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("ETC table created")
            )
            .catch(
              //e => alert(e)
            );

          //Create XRP_wallet Table
          db.executeSql('CREATE TABLE IF NOT EXISTS XRP_wallet(address VARCHAR(256) PRIMARY KEY , balance VARCHAR(30), notes VARCHAR(2400))', [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("XRP table created")
            )
            .catch(
              //e => alert(e)
            );

          //Create BTS_wallet Table
          db.executeSql('CREATE TABLE IF NOT EXISTS BTS_wallet(address VARCHAR(256) PRIMARY KEY , balance VARCHAR(30), notes VARCHAR(2400))', [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("BTS table created")
            )
            .catch(
              //e => alert(e)
            );

          //Create DASH_wallet Table
          db.executeSql('CREATE TABLE IF NOT EXISTS DASH_wallet(address VARCHAR(256) PRIMARY KEY , balance VARCHAR(30), notes VARCHAR(2400))', [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("DASH table created")
            )
            .catch(
              //e => alert(e)
            );

          //Create XEM_wallet Table
          db.executeSql('CREATE TABLE IF NOT EXISTS XEM_wallet(address VARCHAR(256) PRIMARY KEY , balance VARCHAR(30), notes VARCHAR(2400))', [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("XEM table created")
            )
            .catch(
              //e => alert(e)
            );

          //Create DOGE_wallet Table
          db.executeSql('CREATE TABLE IF NOT EXISTS DOGE_wallet(address VARCHAR(256) PRIMARY KEY , balance VARCHAR(30), notes VARCHAR(2400))', [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("DOGE table created")
            )
            .catch(
              //e => alert(e)
            );

          //Create NXT_wallet Table
          db.executeSql('CREATE TABLE IF NOT EXISTS NXT_wallet(address VARCHAR(256) PRIMARY KEY , balance VARCHAR(30), notes VARCHAR(2400))', [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("NXT table created")
            )
            .catch(
              //e => alert(e)
            );

          //Create PPC_wallet Table
          db.executeSql('CREATE TABLE IF NOT EXISTS PPC_wallet(address VARCHAR(256) PRIMARY KEY , balance VARCHAR(30), notes VARCHAR(2400))', [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("PPC table created")
            )
            .catch(
              //e => alert(e)
            );
       
          //Create BCH_wallet Table
          db.executeSql('CREATE TABLE IF NOT EXISTS BCH_wallet(address VARCHAR(256) PRIMARY KEY , balance VARCHAR(30), notes VARCHAR(2400))', [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("BCH table created")
            )
            .catch(
              //e => alert(e)
            );

          //Create IOTA_wallet Table
          db.executeSql('CREATE TABLE IF NOT EXISTS IOTA_wallet(address VARCHAR(256) PRIMARY KEY , balance VARCHAR(30), notes VARCHAR(2400))', [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("IOTA table created")
            )
            .catch(
              //e => alert(e)
            );

          //Create LSK_wallet Table
          db.executeSql('CREATE TABLE IF NOT EXISTS LSK_wallet(address VARCHAR(256) PRIMARY KEY , balance VARCHAR(30), notes VARCHAR(2400))', [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("LSK table created")
            )
            .catch(
              //e => alert(e)
            );

          //Create NEO_wallet Table
          db.executeSql('CREATE TABLE IF NOT EXISTS NEO_wallet(address VARCHAR(256) PRIMARY KEY , balance VARCHAR(30), notes VARCHAR(2400))', [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("NEO table created")
            )
            .catch(
              //e => alert(e)
            );

          //Create STEEM_wallet Table
          db.executeSql('CREATE TABLE IF NOT EXISTS STEEM_wallet(address VARCHAR(256) PRIMARY KEY , balance VARCHAR(30), notes VARCHAR(2400))', [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("STEEM table created")
            )
            .catch(
              //e => alert(e)
            );

          //Create Add Table
          db.executeSql('CREATE TABLE IF NOT EXISTS AddRemaining(address VARCHAR(256) PRIMARY KEY , coinType VARCHAR(30))', [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("Add table created")
            )
            .catch(
              //e => alert(e)
            );

          //Create Add Table
          db.executeSql('CREATE TABLE IF NOT EXISTS DeleteRemaining(address VARCHAR(256) PRIMARY KEY , coinType VARCHAR(30))', [])
            .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("Delete table created")
            )
            .catch(
              //e => alert(e)
            );

          db.executeSql("CREATE TABLE IF NOT EXISTS XLM_wallet(address VARCHAR(256) PRIMARY KEY , balance VARCHAR(30), notes VARCHAR(2400), wallet_name VARCHAR(15) DEFAULT '')", [])
            .then(() => console.log("Delete table created"))
            .catch(
              //e => alert(e)
            );

            db.executeSql("CREATE TABLE IF NOT EXISTS ADA_wallet(address VARCHAR(256) PRIMARY KEY , balance VARCHAR(30), notes VARCHAR(2400), wallet_name VARCHAR(15) DEFAULT '')", [])
            .then(() => console.log("Delete table created"))
            .catch(
              //e => alert(e)
            );

            db.executeSql("CREATE TABLE IF NOT EXISTS WAVES_wallet(address VARCHAR(256) PRIMARY KEY , balance VARCHAR(30), notes VARCHAR(2400), wallet_name VARCHAR(15) DEFAULT '')", [])
            .then(() => console.log("Delete table created"))
            .catch(
              //e => alert(e)
            );

            db.executeSql("CREATE TABLE IF NOT EXISTS DGB_wallet(address VARCHAR(256) PRIMARY KEY , balance VARCHAR(30), notes VARCHAR(2400), wallet_name VARCHAR(15) DEFAULT '')", [])
            .then(() => console.log("Delete table created"))
            .catch(
              //e => alert(e)
            );

            db.executeSql("CREATE TABLE IF NOT EXISTS XVG_wallet(address VARCHAR(256) PRIMARY KEY , balance VARCHAR(30), notes VARCHAR(2400), wallet_name VARCHAR(15) DEFAULT '')", [])
            .then(() => console.log("Delete table created"))
            .catch(
              //e => alert(e)
            );

            db.executeSql("CREATE TABLE IF NOT EXISTS COLX_wallet(address VARCHAR(256) PRIMARY KEY , balance VARCHAR(30), notes VARCHAR(2400), wallet_name VARCHAR(15) DEFAULT '')", [])
            .then(() => console.log("Delete table created"))
            .catch(
              //e => alert(e)
            );
            db.executeSql("CREATE TABLE IF NOT EXISTS PIVX_wallet(address VARCHAR(256) PRIMARY KEY , balance VARCHAR(30), notes VARCHAR(2400), wallet_name VARCHAR(15) DEFAULT '')", [])
            .then(() => console.log("Delete table created"))
            .catch(
              //e => alert(e)
            );
            db.executeSql("CREATE TABLE IF NOT EXISTS XDN_wallet(address VARCHAR(256) PRIMARY KEY , balance VARCHAR(30), notes VARCHAR(2400), wallet_name VARCHAR(15) DEFAULT '')", [])
            .then(() => console.log("Delete table created"))
            .catch(
              //e => alert(e)
            );
            db.executeSql("CREATE TABLE IF NOT EXISTS SC_Wallet(address VARCHAR(256) PRIMARY KEY , balance VARCHAR(30), notes VARCHAR(2400), wallet_name VARCHAR(15) DEFAULT '')", [])
            .then(() => console.log("Delete table created"))
            .catch(
              //e => alert(e)
            );

            db.executeSql("CREATE TABLE IF NOT EXISTS ZEC_Wallet(address VARCHAR(256) PRIMARY KEY , balance VARCHAR(30), notes VARCHAR(2400), wallet_name VARCHAR(15) DEFAULT '')", [])
            .then(() => console.log("Delete table created"))
            .catch(
              //e => alert(e)
            );           


          db.executeSql('PRAGMA table_info(XRP_wallet)', [])
            .then((result) => {

              if (result.rows.length == 2) {
                this.alterWalletTables1(dbKey);
                this.alterWalletTables2(dbKey);
              } /*alert('Executed SQL: ' + result.rows.length)*//* () => console.log("PRAGMA table_info(ETC_wallet)")*/
              else
                if (result.rows.length == 3) {
                                
                  db.executeSql('PRAGMA table_info(ETC_wallet)', [])
                  .then((result) => {
        
                      if (result.rows.length == 2) {
                        this.alterWalletTables1(dbKey);
                        this.alterWalletTables2(dbKey);
                      } /*alert('Executed SQL: ' + result.rows.length)*//* () => console.log("PRAGMA table_info(ETC_wallet)")*/
                      else       {
                        this.alterWalletTables2(dbKey);         
                      }              
                                                         
                    }
                  )
                  .catch(
                    e => {      
                      this.alterWalletTables1(dbKey);                
                      this.alterWalletTables2(dbKey);
                    }
                  );
                  
                }

            }
            )
            .catch(
              e => {
                this.alterWalletTables1(dbKey);
                this.alterWalletTables2(dbKey);
              }
            );



          // Create token Table
          /* db.executeSql('CREATE TABLE IF NOT EXISTS token(ID int PRIMARY KEY,ETH_address VARCHAR(256),symbol_address VARCHAR(256) , symbol VARCHAR(256) , balance VARCHAR(30))', [])
            .then(() => /!*alert('Executed SQL ' + dbKey),*!/ () => console.log("token table created")
            )
            .catch(
              //e => alert(e)
            );*/

        })
        .catch( /*e => alert(e)*/
        );
    }
    catch (error) {
      //alert(error.message);
    }
  }

}
