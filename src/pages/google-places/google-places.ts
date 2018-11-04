import { Component, EventEmitter, NgZone, Output } from '@angular/core';
import { SearchQuery } from "../../app/search.service";


@Component({
  selector: 'google-places',
  templateUrl: 'google-places.html'
})

export class googlePlacesComponent {
  // @Input() searchedQuery:string;
  autocompleteItems;
  autocomplete;
  service = new google.maps.places.AutocompleteService();
  @Output() public onChosenPlace: EventEmitter<any> = new EventEmitter();
  isListShow = false;

  constructor(private zone: NgZone,private queryServ:SearchQuery) {
    this.autocompleteItems = [];
    
    this.autocomplete = {
      query: queryServ.query
    };
  }
  
  dismiss() {
    this.isListShow = false;
    this.queryServ.query="";
    this.queryServ.selectedPlace = null;
    // console.log(this.queryServ.query,this.queryServ.selectedPlace);
    
  }
  
  chooseItem(item: any) {
    this.isListShow = false;
    this.onChosenPlace.emit(item);
    console.log(item);
    localStorage.setItem("textSearched",this.autocomplete.query);
    this.autocomplete.query = item.description;
    this.queryServ.query = item.description;
  }

  updateSearch() {
    this.isListShow = true;
    if (this.autocomplete.query == '') {
      this.autocompleteItems = [];
      this.queryServ.query="";
      this.queryServ.selectedPlace = null;
      // console.log(this.queryServ.query,this.queryServ.selectedPlace);
      return;
    }

    this.service.getPlacePredictions({
      input: this.autocomplete.query,
      componentRestrictions: {country: 'uk'},
      types:['(regions)']
    }, predictions => {
      this.autocompleteItems = [];
      this.zone.run(() => {
        if(predictions != null){
          predictions.forEach(prediction => {
            this.autocompleteItems.push(prediction);
          });
        }
      });
    });
  }
}