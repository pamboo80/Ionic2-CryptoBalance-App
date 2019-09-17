
export class FiatCurrency {

  ID: number;
  symbol: String;
  currency_name: String;
  unicode_symbol: String;
  selected: number;

  constructor(ID: number,
              symbol: String,
              currency_name: String,
              unicode_symbol: String,
              selected: number) {
    this.ID  = ID;
    this.symbol = symbol;
    this.currency_name = currency_name;
    this.unicode_symbol = unicode_symbol;
    this.selected = selected;
  }

}
