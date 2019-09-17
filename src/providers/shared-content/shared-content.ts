import { Injectable } from '@angular/core';
import { Platform } from "ionic-angular";
import { FiatCurrency } from "../../app/app.fiatcurrency";
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Observable, Subject } from 'rxjs/Rx';

/*
  Generated class for the SharedContentProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/

@Injectable()
export class SharedContentProvider {

  static myFiatCurrencies: Array<FiatCurrency> = [];
  static mySelectedFiatCurrencies: Array<FiatCurrency> = [];
  static bMySelectedFiatCurrenciesUpdatedObserver: any;
  static bMySelectedFiatCurrenciesUpdated: boolean = false;

  //Initialization
  static initialize() {
    SharedContentProvider.bMySelectedFiatCurrenciesUpdatedObserver = new Subject<boolean>();
  }

  constructor(platform: Platform, private sqlite: SQLite) {
    platform.ready().then(() => {

      try {

        var config = {
          name: 'crypto.db',
          location: 'default'/*,
           key: dbKey*/
        };

        //create the sqllite db/table
        this.sqlite.create(config)
          .then((db: SQLiteObject) => {

            var i = 0;
            // Create fiat_currency Table
            db.executeSql('CREATE TABLE IF NOT EXISTS fiat_currency(ID int PRIMARY KEY,symbol VARCHAR(10),currency_name VARCHAR(256) , unicode_symbol VARCHAR(20) , selected int)', [])
              .then(() => /*alert('Executed SQL ' + dbKey),*/() => console.log("fiat_currency table created")
              )
              .catch(
                //e => alert(e)
              );

            db.executeSql('SELECT * FROM fiat_currency;', []).then((data) => {
              if (data.rows.length <= 10) { //Insert new
                
                let newFiatCurrencies: Array<FiatCurrency> = [];

                for (i = 0; i < data.rows.length; i++) {
                  let currencyDetails: FiatCurrency = new FiatCurrency(data.rows.item(i).ID, data.rows.item(i).symbol, data.rows.item(i).currency_name,
                    data.rows.item(i).unicode_symbol, data.rows.item(i).selected);
                  SharedContentProvider.myFiatCurrencies.push(currencyDetails);
                }

                if (data.rows.length == 0) { //Insert new
                  newFiatCurrencies.push(new FiatCurrency(1, "USD", "US Dollar", "$", 1));
                  newFiatCurrencies.push(new FiatCurrency(2, "EUR", "Euro", "\u20AC", 1));
                  newFiatCurrencies.push(new FiatCurrency(3, "GBP", "Great Britain Pound", "\u00A3", 1));
                  newFiatCurrencies.push(new FiatCurrency(4, "INR", "Indian Rupee", "\u20B9", 1));
                  newFiatCurrencies.push(new FiatCurrency(5, "SGD", "Singapore Dollar", "S$", 1));
                  newFiatCurrencies.push(new FiatCurrency(6, "CNY", "Chinese Yen", "\u00A5", 1));
                  newFiatCurrencies.push(new FiatCurrency(7, "AUD", "Australian Dollar", "A$", 0));
                  newFiatCurrencies.push(new FiatCurrency(8, "CAD", "Canadian Dollar", "C$", 0));
                  newFiatCurrencies.push(new FiatCurrency(9, "BRL", "Brazilian Real", "R$", 0));
                  newFiatCurrencies.push(new FiatCurrency(10, "JPY", "Japanese Yen", "\u00A5", 0));
                }

                //Insert latest added fiat coins
                newFiatCurrencies.push(new FiatCurrency(11, "CHF", "Switzerland Franc", "SFr", 0));
                newFiatCurrencies.push(new FiatCurrency(12, "HKD", "Hong Kong Dollar", "HK$", 0));
                newFiatCurrencies.push(new FiatCurrency(13, "KRW", "Korea (South)", "₩", 0));
                newFiatCurrencies.push(new FiatCurrency(14, "MXN", "Mexico Peso", "Mex$", 0));
                newFiatCurrencies.push(new FiatCurrency(15, "MYR", "Malaysian Ringgit", "RM", 0));
                newFiatCurrencies.push(new FiatCurrency(16, "NZD", "New Zealand Dollar", "$", 0));
                newFiatCurrencies.push(new FiatCurrency(17, "PHP", "Philippines Peso", "₱", 0));
                newFiatCurrencies.push(new FiatCurrency(18, "RUB", "Russia Ruble", "₽", 0));
                newFiatCurrencies.push(new FiatCurrency(19, "TRY", "Turkey Lira", "₺", 0));
                newFiatCurrencies.push(new FiatCurrency(20, "ZAR", "South Africa Rand", "R", 0));
                newFiatCurrencies.push(new FiatCurrency(21, "AED", "United Arab Emirates", "AED", 0));

                SharedContentProvider.myFiatCurrencies.push(...newFiatCurrencies);
                SharedContentProvider.notifyChange();
                //alert(SharedContentProvider.mySelectedFiatCurrencies.length);

                for (i = 0; i < newFiatCurrencies.length; i++) {
                  db.executeSql("INSERT INTO fiat_currency(ID,symbol,currency_name,unicode_symbol,selected) values('" +
                  newFiatCurrencies[i].ID + "','" +
                  newFiatCurrencies[i].symbol + "','" +
                  newFiatCurrencies[i].currency_name + "','" +
                  newFiatCurrencies[i].unicode_symbol + "','" +
                  newFiatCurrencies[i].selected + "'" +
                    ");", []).then(
                    ).catch(
                      //e => alert(e)
                    );
                }

              }
              else //retrive the existing
              {
                for (i = 0; i < data.rows.length; i++) {
                  let currencyDetails: FiatCurrency = new FiatCurrency(data.rows.item(i).ID, data.rows.item(i).symbol, data.rows.item(i).currency_name,
                    data.rows.item(i).unicode_symbol, data.rows.item(i).selected);
                  SharedContentProvider.myFiatCurrencies.push(currencyDetails);
                }

                SharedContentProvider.notifyChange();

                //console.log(SharedContentProvider.mySelectedFiatCurrencies.length);
              }

            })
              .catch(
                //e => alert(e)
              );

          })
          .catch( //e => alert(e)
          );
      }
      catch (error) {
        //alert(error.message);
      }

    });

  }

  static notifyChange() {
    SharedContentProvider.mySelectedFiatCurrencies = SharedContentProvider.myFiatCurrencies.filter(i => (i.selected == 1)); //function(x){return (x.selected==1);}

    SharedContentProvider.bMySelectedFiatCurrenciesUpdated = true;
    SharedContentProvider.bMySelectedFiatCurrenciesUpdatedObserver.next(true);
  }

  static isMySelectedFiatCurrenciesUpdated(): Observable<any> {
    return SharedContentProvider.bMySelectedFiatCurrenciesUpdatedObserver;
  }

}
SharedContentProvider.initialize();
