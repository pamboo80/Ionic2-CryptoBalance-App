import { Component } from '@angular/core';
import { BTCPage } from '../BTC/BTC';
import { LTCPage } from '../LTC/LTC';
import { ETCPage } from '../ETC/ETC';
import { ETHPage } from '../ETH/ETH';
import { XRPPage } from "../XRP/XRP";
import { BTSPage } from "../BTS/BTS";
import { DASHPage } from "../DASH/DASH";
import { XEMPage } from "../XEM/XEM";
import { DOGEPage } from "../DOGE/DOGE";
import { NXTPage } from "../NXT/NXT";
import { PPCPage } from "../PPC/PPC";

import { Storage } from '@ionic/storage';
import { BchPage } from "../bch/bch";
import { LskPage } from "../lsk/lsk";
import { NeoPage } from "../neo/neo";
import { IotaPage } from "../iota/iota";
import { SteemPage } from "../steem/steem";
import { SIAPage } from '../sia/sia';
import { ADAPage } from '../ada/ada';
import { XlmPage } from '../xlm/xlm';
import { WAVESPage } from '../waves/waves';
import { DGBPage } from '../dgb/dgb';
import { DCRPage } from '../dcr/dcr';
import { XVGPage } from '../xvg/xvg';
import { COLXPage } from '../colx/colx';
import { PIVXPage } from '../pivx/pivx';
import { XDNPage } from '../xdn/xdn';
import { ZECPage } from '../zec/zec';
@Component({
    selector: 'page-tabs',
    templateUrl: 'tabs.html'
})
export class TabsPage {

    ADAPage = ADAPage;
    XLMPage = XlmPage;
    WAVESPage = WAVESPage;
    DGBPage = DGBPage;
    DCRPage = DCRPage;
    XVGPage = XVGPage;
    COLXPage = COLXPage;
    PIVXPage = PIVXPage;
    XDNPage = XDNPage;
    SIAPage = SIAPage;
    ZECPage = ZECPage;
    BTCPage = BTCPage;
    LTCPage = LTCPage;
    ETHPage = ETHPage;
    ETCPage = ETCPage;
    XRPPage = XRPPage;
    BTSPage = BTSPage;
    XEMPage = XEMPage;
    NXTPage = NXTPage;
    PPCPage = PPCPage;

    DASHPage = DASHPage;
    DOGEPage = DOGEPage;
    BCHPage = BchPage;
    LSKPage = LskPage;
    NEOPage = NeoPage;
    IOTAPage = IotaPage;
    STEEMPage = SteemPage;

    isBTCPage = true;
    isLTCPage = true;
    isETHPage = true;
    isETCPage = true;
    isXRPPage = true;
    isBTSPage = true;
    isXEMPage = true;
    isNXTPage = true;
    isPPCPage = true;
    isBCHPage = true;
    isLSKPage = true;
    isNEOPage = true;
    isIOTAPage = true;
    isDASHPage = true;
    isDOGEPage = true;
    isSTEEMPage = true;
    address:String="hello";
    constructor(private storage: Storage) {
        // this.getvalue("isLTCPage");
        // this.getvalue("isETHPage");
        // this.getvalue("isETCPage");
        // this.getvalue("isXRPPage");
        // this.getvalue("isBTSPage");
        // this.getvalue("isDASHPage");
        // this.getvalue("isXEMPage");
        // this.getvalue("isDOGEPage");
        // this.getvalue("isNXTPage");
        // this.getvalue("isPPCPage");
        // this.getvalue("isBLKPage");
        // this.getvalue("isBCHPage");
        // this.getvalue("isGNOPage");
        // this.getvalue("isGNTPage");
        // this.getvalue("isIOTAPage");
        // this.getvalue("isLSKPage");
        // this.getvalue("isNEOPage");
        // this.getvalue("isSTEEMPage");
    }


    getvalue(type) {
        console.log(type);
        this.storage.get(type).then((val) => {
            this[type] = val;
        });
    }

}
