/**
 * Created by saswa on 9/14/2017.
 */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customNumber'
})
export class customNumber implements PipeTransform {
  transform(x: string): string {
    return this.format(x);
  }

  format(x)
  {
    return  Number(x.toFixed(2)).toString();
  }

}
