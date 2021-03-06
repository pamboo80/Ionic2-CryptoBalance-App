"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var sqlite_1 = require("@ionic-native/sqlite");
var app_walletdetails_1 = require("../../app/app.walletdetails");
var my_app_toolbar_1 = require("../../components/my-app-toolbar/my-app-toolbar");
var barcode_scanner_1 = require("@ionic-native/barcode-scanner");
/**
 * Generated class for the ETHPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
var ETHPage = (function () {
    //private httpResponse:Response;
    function ETHPage(platform, sqlite, http /*,
         private jsonp: Jsonp*/, MyAppToolbar) {
        var _this = this;
        this.sqlite = sqlite;
        this.http = http; /*,
         private jsonp: Jsonp*/
        this.MyAppToolbar = MyAppToolbar;
        this.id = '';
        this.myETHWallets = [];
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
    ETHPage.prototype.createList = function () {
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
            db.executeSql('SELECT * FROM ETH_wallet;', []).then(function (data) {
                //alert(data.rows.length);
                if (data.rows.length > 0) {
                    _this.myETHWallets = [];
                    for (var i = 0; i < data.rows.length; i++) {
                        var walletDetail = new app_walletdetails_1.WalletDetail(_this.http, "ETH", data.rows.item(i).id, data.rows.item(i).address, data.rows.item(i).balance);
                        _this.myETHWallets.push(walletDetail);
                    }
                }
                //alert('Executed SELECT SQL' + this.addresses.length), () => console.log("table created")
            })
                .catch();
        })
            .catch();
        //loader.hide();
    };
    ETHPage.prototype.addItemToAddressesArray = function (addWalletDetails) {
        try {
            var newWalletDetail = new app_walletdetails_1.WalletDetail(this.http, "ETH", addWalletDetails.id, addWalletDetails.address, "0.0");
            this.myETHWallets.push(newWalletDetail);
        }
        catch (ex) {
            alert(ex);
        }
    };
    ETHPage.prototype.deleteItemAtIndex = function (index) {
        var _this = this;
        var deleteID = this.myETHWallets[index].id;
        var config = {
            name: 'crypto.db',
            location: 'default' /*,
             key: this.dbKey*/
        };
        try {
            this.sqlite.create(config)
                .then(function (db) {
                db.executeSql("DELETE FROM ETH_wallet WHERE id='" + deleteID + "';", []).then(function () {
                    _this.myETHWallets.splice(index, 1);
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
    return ETHPage;
}());
ETHPage = __decorate([
    core_1.Component({
        selector: 'page-eth',
        templateUrl: 'src/pages/ETH/ETH.html',
        providers: [barcode_scanner_1.BarcodeScanner, sqlite_1.SQLite, my_app_toolbar_1.MyAppToolbarComponent]
    })
], ETHPage);
exports.ETHPage = ETHPage;
