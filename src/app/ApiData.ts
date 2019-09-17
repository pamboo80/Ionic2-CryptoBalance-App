export class ApiData {
    public static POST=1;
    public static DELETE=2;
    public static GET=3;

    data:any;
    url:string;
    method:Number;
    eventId:string;
    
    constructor(method:Number, url:string, data, eventId:string) {
        this.data=data;
        this.url=url;
        this.method=method;
        this.eventId=eventId;
    }
  
  }