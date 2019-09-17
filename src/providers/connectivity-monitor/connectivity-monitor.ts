import { Injectable } from '@angular/core';

import { Network } from '@ionic-native/network';
import { Platform/*, ToastController*/} from 'ionic-angular';

import { Observable , Subject } from 'rxjs/Rx';

/*
  Generated class for the ConnectivityMonitorProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class ConnectivityMonitorProvider {

  static bConnected:boolean = false;
  static bConnectedObserver: any;

  //private toast=null;

  //Initialization
  static initialize() {
    ConnectivityMonitorProvider.bConnectedObserver = new Subject<boolean>();
  }

  constructor(platform: Platform,
              private network: Network/*,
              private toastCtrl: ToastController*/) {

    platform.ready().then(() => {

      if(this.network.type==="none")
      {
        ConnectivityMonitorProvider.bConnected=false;
        ConnectivityMonitorProvider.bConnectedObserver.next(false);
      }
      else
      {
        ConnectivityMonitorProvider.bConnected=true;
        ConnectivityMonitorProvider.bConnectedObserver.next(true);
      }

      let disconnectSub = this.network.onDisconnect().subscribe(() => {
        //console.log("offline");
        ConnectivityMonitorProvider.bConnected=false;
        ConnectivityMonitorProvider.bConnectedObserver.next(false);
      });

      let connectSub = this.network.onConnect().subscribe(()=> {
        //console.log("online");
        ConnectivityMonitorProvider.bConnected=true;
        ConnectivityMonitorProvider.bConnectedObserver.next(true);
      });

    });

  }

  static isConnected(): Observable<any> {
    return ConnectivityMonitorProvider.bConnectedObserver;
  }

  /*
    toastMsg(msg:string, controlToFocus:any=null)
    {
      if(this.toast!=null)
        this.toast.dismiss();

      if (msg!="")
      {
        this.toast = this.toastCtrl.create({
          message: msg,
          /!*showCloseButton: false,*!/
          duration: 3000,
          position: 'bottom'
        });

        this.toast.onDidDismiss(() => {
          //console.log('Dismissed toast');
        });

        this.toast.present();
      }
    }*/

}
ConnectivityMonitorProvider.initialize();
