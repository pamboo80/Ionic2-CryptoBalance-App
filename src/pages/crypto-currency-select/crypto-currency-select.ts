import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {Storage} from '@ionic/storage';

/**
 * Generated class for the CryptoCurrencySelectPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
    selector: 'page-crypto-currency-select',
    templateUrl: 'crypto-currency-select.html',
})
export class CryptoCurrencySelectPage {
    isBTCPage = true;
    isLTCPage = true;
    isETHPage = true;
    isETCPage = true;
    isXRPPage = true;
    isBTSPage = true;
    isXEMPage = true;
    isNXTPage = true;
    isPPCPage = true;
    isBLKPage = true;
    isBCHPage = true;
    isGNOPage = true;
    isGNTPage = true;
    isLSKPage = true;
    isNEOPage = true;
    isIOTAPage = true;
    isDASHPage = true;
    isDOGEPage = true;
    isSTEEMPage = true;

    constructor(public navCtrl: NavController, public navParams: NavParams, private storage: Storage) {
        this.getvalue("isLTCPage");
        this.getvalue("isETHPage");
        this.getvalue("isETCPage");
        this.getvalue("isXRPPage");
        this.getvalue("isBTSPage");
        this.getvalue("isDASHPage");
        this.getvalue("isXEMPage");
        this.getvalue("isDOGEPage");
        this.getvalue("isNXTPage");
        this.getvalue("isPPCPage");
        this.getvalue("isBLKPage");
        this.getvalue("isBCHPage");
        this.getvalue("isGNOPage");
        this.getvalue("isGNTPage");
        this.getvalue("isIOTAPage");
        this.getvalue("isLSKPage");
        this.getvalue("isNEOPage");
        this.getvalue("isSTEEMPage");

    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad CryptoCurrencySelectPage');
    }

    getvalue(type) {
        console.log(type);
        this.storage.get(type).then((val) => {
            this[type] = val;
        });
    }

    updateValue(type, e: any) {
        console.log(e.checked);
        if (e.checked) {
            this.storage.set(type, true);
        }
        else {
            this.storage.set(type, false);
        }

    }
}
