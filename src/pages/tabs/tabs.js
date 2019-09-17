"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var BTC_1 = require("../BTC/BTC");
var LTC_1 = require("../LTC/LTC");
var ETC_1 = require("../ETC/ETC");
var ETH_1 = require("../ETH/ETH");
var TabsPage = (function () {
    function TabsPage() {
        this.tab1Root = BTC_1.BTCPage;
        this.tab2Root = LTC_1.LTCPage;
        this.tab3Root = ETH_1.ETHPage;
        this.tab4Root = ETC_1.ETCPage;
    }
    return TabsPage;
}());
TabsPage = __decorate([
    core_1.Component({
        selector: 'page-tabs',
        templateUrl: 'tabs.html'
    })
], TabsPage);
exports.TabsPage = TabsPage;
