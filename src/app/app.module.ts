import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { ETCPage } from '../pages/ETC/ETC';
import { ETHPage } from '../pages/ETH/ETH';
import { ETHTokenPage } from '../pages/ETHToken/ETHToken';
import { LTCPage } from '../pages/LTC/LTC';
import { BTCPage } from '../pages/BTC/BTC';
import { XRPPage } from "../pages/XRP/XRP";
import { DASHPage } from "../pages/DASH/DASH"
import { XEMPage } from "../pages/XEM/XEM";
import { DOGEPage } from "../pages/DOGE/DOGE";
import { NXTPage } from "../pages/NXT/NXT";
import { PPCPage } from "../pages/PPC/PPC";

import { BTSPage } from "../pages/BTS/BTS";
import { TabsPage } from '../pages/tabs/tabs';
import { AboutPage } from "../pages/about/about";
import { SettingsPage } from "../pages/settings/settings";
import { MenulistPage } from "../pages/menulist/menulist";

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Network } from '@ionic-native/network';
import { Clipboard } from '@ionic-native/clipboard';

import { SQLite } from '@ionic-native/sqlite';
import { HttpModule, JsonpModule } from "@angular/http";
import { MyAppToolbarComponent } from '../components/my-app-toolbar/my-app-toolbar';

import { customNumber } from "../pipes/customNumber";
import { WalletDetailsPage } from "../pages/wallet-details/wallet-details";

import { ConnectivityMonitorProvider } from '../providers/connectivity-monitor/connectivity-monitor';
import { SharedContentProvider } from "../providers/shared-content/shared-content";
import { SelectCurrencyPage } from "../pages/select-currency/select-currency";
import { Push } from "@ionic-native/push";
import { ExchangePage } from "../pages/exchange/exchange";
import { IonicStorageModule } from '@ionic/storage';
import { CryptoCurrencySelectPage } from "../pages/crypto-currency-select/crypto-currency-select";
import { BchPage } from "../pages/bch/bch";

import { IotaPage } from "../pages/iota/iota";
import { LskPage } from "../pages/lsk/lsk";
import { NeoPage } from "../pages/neo/neo";
import { SteemPage } from "../pages/steem/steem";
import { XlmPage } from '../pages/xlm/xlm';
import { XVGPage } from '../pages/xvg/xvg';
import { ADAPage } from '../pages/ada/ada';
import { WAVESPage } from '../pages/waves/waves';
import { DGBPage } from '../pages/dgb/dgb';
import { DCRPage } from '../pages/dcr/dcr';
import { COLXPage } from '../pages/colx/colx';
import { PIVXPage } from '../pages/pivx/pivx';
import { XDNPage } from '../pages/xdn/xdn';
import { SIAPage } from '../pages/sia/sia';
import { ZECPage } from '../pages/zec/zec';
import { UniqueDeviceID } from '@ionic-native/unique-device-id';


@NgModule({
    declarations: [
        MyApp,
        BTCPage,
        LTCPage,
        ETHPage,
        ETHTokenPage,
        ETCPage,
        XRPPage,
        DASHPage,
        XEMPage,
        DOGEPage,
        NXTPage,
        PPCPage,
        BTSPage,
        TabsPage,
        AboutPage,
        SettingsPage,
        MenulistPage,
        MyAppToolbarComponent,
        customNumber,
        WalletDetailsPage,
        SelectCurrencyPage,
        ExchangePage,
        CryptoCurrencySelectPage,
        BchPage,
        IotaPage,
        LskPage,
        NeoPage,
        SteemPage,
        XlmPage,
        ADAPage,
        WAVESPage,
        DGBPage,
        DCRPage,
        XVGPage,
        COLXPage,
        PIVXPage,
        XDNPage,
        SIAPage,
        ZECPage


    ],
    imports: [
        BrowserModule,
        HttpModule,
        JsonpModule,
        IonicModule.forRoot(MyApp),
        IonicStorageModule.forRoot()
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        BTCPage,
        LTCPage,
        ETHPage,
        ETHTokenPage,
        ETCPage,
        XRPPage,
        DASHPage,
        XEMPage,
        DOGEPage,
        NXTPage,
        PPCPage,
        BTSPage,
        TabsPage,
        AboutPage,
        SettingsPage,
        MenulistPage,
        WalletDetailsPage,
        SelectCurrencyPage,
        ExchangePage,
        CryptoCurrencySelectPage,
        BchPage,
        IotaPage,
        LskPage,
        NeoPage,
        SteemPage,
        XlmPage,
        ADAPage,
        WAVESPage,
        DGBPage,
        DCRPage,
        XVGPage,
        COLXPage,
        PIVXPage,
        XDNPage,
        SIAPage,
        ZECPage
    ],
    providers: [
        StatusBar,
        SplashScreen,
        SQLite,
        Network,
        Clipboard,
        { provide: ErrorHandler, useClass: IonicErrorHandler },
        ConnectivityMonitorProvider,
        SharedContentProvider,
        Push,
        UniqueDeviceID
    ]
})
export class AppModule {
}
