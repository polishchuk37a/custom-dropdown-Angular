import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {FormControl} from "@angular/forms";
import {Subject} from "rxjs";
import {DataService} from "../../services/data.service";
import {debounceTime, filter, switchMap, takeUntil, tap} from "rxjs/operators";

@Component({
  selector: 'app-search-field',
  templateUrl: './search-field.component.html',
  styleUrls: ['./search-field.component.scss']
})
export class SearchFieldComponent implements OnInit, OnDestroy {
  options: string[] = [];
  selectedValueFromDropdown = '';

  searchField = new FormControl('');

  private unsubscribe$ = new Subject<void>();

  constructor(private readonly dataService: DataService) { }

  ngOnInit(): void {
    this.searchField?.valueChanges
      .pipe(
        debounceTime(500),
        filter(searchValue => searchValue !== ''),
        switchMap(searchValue => this.dataService.getDataFromApi(searchValue)),
        tap(result => this.options = result.items.map(res => res.title)),
        takeUntil(this.unsubscribe$)
      ).subscribe();
  }

  getSelectedValueFromDropdown(newValue: string): void {
    this.selectedValueFromDropdown = newValue;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
