"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var barcode_scanner_1 = require("@ionic-native/barcode-scanner");
var sqlite_1 = require("@ionic-native/sqlite");
var app_walletdetails_1 = require("../../app/app.walletdetails");
var my_app_toolbar_1 = require("../../components/my-app-toolbar/my-app-toolbar");
//import { Jsonp} from '@angular/http';
//import {Observable} from 'rxjs/Rx';
//import 'rxjs/Rx';
var BTCPage = (function () {
    //private httpResponse:Response;
    function BTCPage(platform, sqlite, http /*,
        private jsonp: Jsonp*/, MyAppToolbar) {
        var _this = this;
        this.sqlite = sqlite;
        this.http = http; /*,
        private jsonp: Jsonp*/
        this.MyAppToolbar = MyAppToolbar;
        this.id = '';
        this.myBTCWallets = [];
        platform.ready().then(function () {
            try {
                myAppPlugin.getAndroidID(function (success) {
                    var obj = JSON.parse(success);
                    if (obj != null) {
                        if (obj.ANDRIOD_ID != null && obj.ANDRIOD_ID.trim() != "") {
                            _this.dbKey = obj.ANDRIOD_ID;
                        }
                    }
                }, function (error) {
                    _this.dbKey = '999999999999';
                }, { "dummy": "123" });
            }
            catch (Error) {
                //alert(Error.message);
                _this.dbKey = '999999999999';
            }
            _this.createList();
        });
    }
    BTCPage.prototype.createList = function () {
        //loader.show();
        /* if(this.dbKey=="")
         {
           setTimeout( () => {
             this.createList();
           }, 200);
           return;
         }*/
        var _this = this;

        //Read from the DB and create the list
        var config = {
            name: 'crypto.db',
            location: 'default' /*,
             key: this.dbKey*/
        };
        //create the sqllite db/table
        this.sqlite.create(config)
            .then(function (db) {
            db.executeSql('SELECT * FROM BTC_wallet;', []).then(function (data) {
                //alert(data.rows.length);
                if (data.rows.length > 0) {
                    _this.myBTCWallets = [];
                    for (var i = 0; i < data.rows.length; i++) {
                        var walletDetail = new app_walletdetails_1.WalletDetail(_this.http, "BTC", data.rows.item(i).id, data.rows.item(i).address, data.rows.item(i).balance);
                        _this.myBTCWallets.push(walletDetail);
                        //API call to find the balance
                    }
                }
                //alert('Executed SELECT SQL' + this.addresses.length), () => console.log("table created")
            })
                .catch();
        })
            .catch();
        //loader.hide();
    };
    BTCPage.prototype.addItemToAddressesArray = function (addWalletDetails) {
        try {
            var newWalletDetail = new app_walletdetails_1.WalletDetail(this.http, "BTC", addWalletDetails.id, addWalletDetails.address, "0.0");
            this.myBTCWallets.push(newWalletDetail);
        }
        catch (ex) {
            alert(ex);
        }
    };
    BTCPage.prototype.deleteItemAtIndex = function (index) {
        var _this = this;
        var deleteID = this.myBTCWallets[index].id;
        var config = {
            name: 'crypto.db',
            location: 'default' /*,
             key: this.dbKey*/
        };
        try {
            this.sqlite.create(config)
                .then(function (db) {
                db.executeSql("DELETE FROM BTC_wallet WHERE id='" + deleteID + "';", []).then(function () {
                    _this.myBTCWallets.splice(index, 1);
                    _this.createList();
                })
                    .catch(function (e) { return alert(e.message); });
            })
                .catch(function (e) { return alert(e.message); });
        }
        catch (error) {
            alert(error.message);
        }
    };
    return BTCPage;
}());
BTCPage = __decorate([
    core_1.Component({
        selector: 'page-btc',
        templateUrl: 'BTC.html',
        providers: [barcode_scanner_1.BarcodeScanner, sqlite_1.SQLite, my_app_toolbar_1.MyAppToolbarComponent]
    })
], BTCPage);
exports.BTCPage = BTCPage;
