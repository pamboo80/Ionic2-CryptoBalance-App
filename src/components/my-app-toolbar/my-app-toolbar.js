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
var forms_1 = require("@angular/forms");
var sqlite_1 = require("@ionic-native/sqlite");
var http_1 = require("@angular/http");
/**
 * Generated class for the MyComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
var MyAppToolbarComponent = (function () {
    function MyAppToolbarComponent(platform, barcodeScanner, formBuilder, sqlite, http) {
        var _this = this;
        this.barcodeScanner = barcodeScanner;
        this.formBuilder = formBuilder;
        this.sqlite = sqlite;
        this.http = http;
        this.id = '';
        this.todayCoinValue = "";
        this.todayCoinValueAll = "";
        this.currencyType = "USD";
        //private httpResponse:Response;
        this.coinType = "";
        this.onAddWalletAddress = new core_1.EventEmitter();
        this.showError = false;
        this.dbKey = "";
        //Validations
        this.addAddressForm = formBuilder.group({
            "walletAddress": ["", forms_1.Validators.required]
        });
        this.walletAddress = this.addAddressForm.controls['walletAddress'];
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
        });
    }
    MyAppToolbarComponent.prototype.ngAfterViewInit = function () {
        this.getTodaysCoinValueAll();
    };
    MyAppToolbarComponent.prototype.onAddSuccess = function (address, id) {
        var paramObj = {}; //new Object();
        paramObj.address = address;
        paramObj.id = id;
        this.onAddWalletAddress.emit(paramObj);
    };
    MyAppToolbarComponent.prototype.insertInToDBTable = function (address) {
        var _this = this;
        try {
            if (this.dbKey == "") {
                return;
            }
            var config = {
                name: 'crypto.db',
                location: 'default' /*,
                 key: this.dbKey*/
            };
            this.sqlite.create(config)
                .then(function (db) {
                db.executeSql("INSERT INTO " + _this.coinType + "_wallet(address,balance) values('" + address + "', '0.0')", []).then(function (results) { return _this.onAddSuccess(address, results.insertId); }).catch(function (e) { return alert(e); });
            })
                .catch(function (e) { return alert(e); });
        }
        catch (error) {
            alert(error.message);
        }
    };
    //Add item to the SQL storgae
    //and update UI list
    MyAppToolbarComponent.prototype.addWalletAddress = function () {
        if (this.addAddressForm.valid) {
            var data = this.id;
            //For testing
            //this.onAddSuccess(data,"1");
            //Add to SQLLite
            this.insertInToDBTable(data);
            this.id = '';
            this.showError = false;
        }
        else {
            this.showError = true;
        }
    };
    //QR Code scanner UI event
    MyAppToolbarComponent.prototype.scanbarcode = function () {
        var _this = this;
        this.barcodeScanner.scan().then(function (barcodeData) {
            // Success! QR code is here
            if (barcodeData.format == "QR_CODE") {
                var scanAddress = "";
                try {
                    var JSONObj = JSON.parse(barcodeData.text);
                }
                catch (ex) {
                    scanAddress = barcodeData.text;
                }
                var pos = 0;
                if ((pos = scanAddress.indexOf(":")) != -1) {
                    _this.id = scanAddress.substr(pos + 1);
                }
            }
        }, function (err) {
            //alert("error");
            // An error occurred
        });
    };
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
    MyAppToolbarComponent.prototype.getTodaysCoinValueAll = function () {
        var _this = this;
        this.httpHeader = new http_1.Headers();
        //this.httpHeader.append('Content-Type', 'application/json');
        this.httpHeader.append('Accept', '*/*');
        this.httpRequestOptionsArgsObj = { headers: this.httpHeader };
        //HTTP GET Call
        try {
            var temp;
            var URL_1 = 'https://min-api.cryptocompare.com/data/price?fsym=' + this.coinType + '&tsyms=INR,USD,EUR';
            this.http.get(URL_1, this.httpRequestOptionsArgsObj)
                .subscribe(function (res) {
                var coinInfo = res.json();
                _this.todayCoinValueAll = coinInfo;
                _this.getTodaysCoinValue(_this.currencyType);
            }, (function (error) {
                alert("Exception: " + error);
            }));
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
            alert("exception:" + exception.message);
        }
    };
    MyAppToolbarComponent.prototype.getTodaysCoinValue = function (currencyType) {
        this.currencyType = currencyType;
        switch (this.currencyType) {
            case "USD":
                this.todayCoinValue = this.todayCoinValueAll.USD;
                break;
            case "INR":
                this.todayCoinValue = this.todayCoinValueAll.INR;
                break;
            case "EUR":
                this.todayCoinValue = this.todayCoinValueAll.EUR;
                break;
            default: this.todayCoinValue = this.todayCoinValueAll.USD;
        }
    };
    return MyAppToolbarComponent;
}());
__decorate([
    core_1.Input('coin-type')
], MyAppToolbarComponent.prototype, "coinType", void 0);
__decorate([
    core_1.Output()
], MyAppToolbarComponent.prototype, "onAddWalletAddress", void 0);
MyAppToolbarComponent = __decorate([
    core_1.Component({
        selector: 'my-app-toolbar',
        templateUrl: 'my-app-toolbar.html',
        providers: [barcode_scanner_1.BarcodeScanner, sqlite_1.SQLite]
    })
], MyAppToolbarComponent);
exports.MyAppToolbarComponent = MyAppToolbarComponent;
function httpGetAsync(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            var bitcoinInfo = JSON.parse(xmlHttp.responseText);
        alert(bitcoinInfo.bpi.USD.rate);
        alert(bitcoinInfo.bpi.INR.rate);
    };
    xmlHttp.open("GET", theUrl, true);
    xmlHttp.send(null);
}
;
