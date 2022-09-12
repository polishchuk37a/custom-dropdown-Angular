import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {FormControl} from "@angular/forms";
import {Subject} from "rxjs";
import {DataService} from "../../services/data.service";
import {debounceTime, distinctUntilChanged, filter, switchMap, takeUntil, tap} from "rxjs/operators";

@Component({
  selector: 'app-search-field',
  templateUrl: './search-field.component.html',
  styleUrls: ['./search-field.component.scss']
})
export class SearchFieldComponent implements OnInit, OnDestroy {
  options: string[] = [];
  selectedValueFromDropdown = '';

  isDropdownVisible = false;

  searchField = new FormControl('');

  private unsubscribe$ = new Subject<void>();

  get dropdownVisibility(): boolean {
    return this.isDropdownVisible;
  }

  get resultsNotFound(): boolean {
    return this.options.length === 0 && this.searchField.value.length > 0;
  }

  constructor(private readonly dataService: DataService) { }

  ngOnInit(): void {
    this.searchField?.valueChanges
      .pipe(
        tap(() => this.options = []),
        debounceTime(500),
        distinctUntilChanged(),
        filter(searchValue => searchValue !== ''),
        switchMap(searchValue => this.dataService.getDataFromApi(searchValue)),
        tap(result => {
          this.options = result.items.map(res => res.title);
          this.isDropdownVisible = true;
        }),
        takeUntil(this.unsubscribe$)
      ).subscribe();
  }

  setSelectedOption(newValue: string): void {
    this.selectedValueFromDropdown = newValue;
    this.isDropdownVisible = false;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
