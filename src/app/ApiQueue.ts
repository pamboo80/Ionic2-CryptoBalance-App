import { Events } from 'ionic-angular';
import { Queue } from "queue-typescript";
import { ApiData } from "./ApiData";
import { Http, RequestOptions } from "@angular/http";
import { ToastController} from 'ionic-angular';


export class ApiQueue {

  private toast = null;

  private static instance: ApiQueue;
  apiQueue:Queue<ApiData>=new Queue<ApiData>();
  isRunning:boolean=false;
  addToQueue(apiData:ApiData){
    this.apiQueue.enqueue(apiData);
  }

  static getInstance(event:Events, http: Http, toastCtrl: ToastController){
    if(!ApiQueue.instance){
      ApiQueue.instance=new ApiQueue(event, http,toastCtrl);
    }
    return ApiQueue.instance;
  }

  constructor(public event:Events,public http: Http, private toastCtrl: ToastController) {
    this.isRunning=false;
  }

  public executeQueue(isRecursiveCall){  

    try{
      if(this.isRunning==true && isRecursiveCall==false){
        console.log("running");
        return;
      }else{
        if(this.apiQueue.length>0){
          this.isRunning=true;      
          let apiData:ApiData=this.apiQueue.dequeue();
          if(apiData!=null){      
  
            // var d = new Date();
            // var n = d.getTime();
            // console.log("time "+n);         
            // this.toastMsg(n.toString(),9000);
  
            //@@@ For testing
            //this.toastMsg(apiData.url,3000);
  
            // 1 POST, 2 DELETE, 3 GET
            if(apiData.method==ApiData.POST){ 
              this.http.post(apiData.url,apiData.data)
              .timeout(20000)
              .subscribe(res => {
                if(res==null){
                  this.event.publish(apiData.eventId,apiData.data,{"result":"fail"});
                }else{
                  this.event.publish(apiData.eventId,apiData.data, res.json());
                }
              }, (error => {
                this.event.publish(apiData.eventId,apiData.data,{"result":"fail"});
              }));
              
              // this.http.post(url,apiData.data).subscribe(res => {
              //   if(res.json().result=="success"){
                    
              //   }
              // }, (error => {}));
                            
            }else if(apiData.method==ApiData.DELETE){
              this.http.delete(apiData.url, new RequestOptions({ body: apiData.data }))
              .timeout(20000)
              .subscribe(res => {
                if(res==null){
                  this.event.publish(apiData.eventId,apiData.data,{"result":"fail"});
                }else{
                  this.event.publish(apiData.eventId,apiData.data, res.json());
                }
              }, (error => {
                this.event.publish(apiData.eventId,apiData.data,{"result":"fail"});
              }));
            }else if(apiData.method==ApiData.GET){
              this.event.publish(apiData.eventId,apiData.data, apiData.data);
            }
          }
          
          setTimeout(()=>{         
            this.isRunning=false;
            if(this.apiQueue.length>0){
              this.executeQueue(true);
            }        
          },1500);
         
          }
      }
    }
    catch(ex)
    {
      this.isRunning=false;
    }
    
  }

  toastMsg(msg: string, duration: number = -1) {
    if(this.toastCtrl!=null)
    {
      if (this.toast != null)
       this.toast.dismiss();

      if (msg != "") {
      this.toast = this.toastCtrl.create({
        message: msg,
        duration: duration,
        position: 'bottom'
      });

      this.toast.onDidDismiss(() => {
      });

      this.toast.present();
    }
    }
  }

}