import { Injectable } from '@angular/core';

@Injectable()
export class SearchQuery{
    public query:string = '';
    public selectedPlace:any;
}