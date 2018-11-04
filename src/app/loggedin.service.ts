import { Injectable} from '@angular/core'
import {Subject} from 'rxjs/Rx';

@Injectable()
export class LoggedIn {
 
 public refresh = new Subject<string>();
 
 public refreshSubscription() {
   this.refresh.next('refresh');
   console.log("refreshed");   
 }
  
}