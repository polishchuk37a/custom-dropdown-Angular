import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {FormControl} from "@angular/forms";
import {fromEvent, Subject} from "rxjs";
import {DataService} from "../../services/data.service";
import {debounceTime, filter, switchMap, takeUntil, tap} from "rxjs/operators";

@Component({
  selector: 'app-search-field',
  templateUrl: './search-field.component.html',
  styleUrls: ['./search-field.component.scss']
})
export class SearchFieldComponent implements OnInit, OnDestroy, AfterViewInit {
  titles: string[] = [];
  selectedOptionIndex = -1;
  selectedOption = '';

  isResultsNotFound = false;
  isValueNotSelected = false;

  @ViewChild('dropdown') dropdown: ElementRef | undefined;
  @ViewChild('option') option: ElementRef | undefined;

  searchField = new FormControl('');

  private unsubscribe$ = new Subject<void>();

  constructor(private readonly dataService: DataService) { }

  ngOnInit(): void {
    this.searchField?.valueChanges
      .pipe(
        debounceTime(500),
        filter(searchValue => searchValue !== ''),
        tap(() => this.isResultsNotFound = false),
        switchMap(searchValue => this.dataService.getDataFromApi(searchValue)),
        tap(result => {
          if (result.items.length === 0) {
            this.isResultsNotFound = true;
            this.titles = [];

            return;
          }

          this.titles = result.items.map(res => res.title);
        }),
        takeUntil(this.unsubscribe$)
      ).subscribe();
  }

  selectValueOnMouseClick(index: number): void {
    this.selectedOptionIndex = index;
    this.selectedOption = this.titles[index];
    this.isValueNotSelected = false;
  }

  ngAfterViewInit(): void {
    fromEvent<KeyboardEvent>(window, 'keydown')
      .pipe(
        tap((event: KeyboardEvent) => {
          this.isValueNotSelected = true;

          if (event.key === 'ArrowDown') {
            this.selectedOptionIndex++;

            if (this.selectedOptionIndex > this.titles.length - 1) {
              this.selectedOptionIndex = 0;
            }

            if (this.dropdown) {
              const selectedElement = document.querySelector('.title-block.selected') as HTMLDivElement;

              if (selectedElement) {
                this.dropdown.nativeElement.scrollTop = selectedElement.offsetTop - 70;
              }

              if (this.selectedOptionIndex === 0) {
                this.dropdown.nativeElement.scrollTop = 0;
              }
            }
          }

          if (event.key === 'ArrowUp') {
            this.selectedOptionIndex--;

            if (this.selectedOptionIndex < 0) {
              this.selectedOptionIndex = this.titles.length - 1;
            }

            if (this.dropdown) {
              const selectedElement = document.querySelector('.title-block.selected') as HTMLDivElement;

              if (selectedElement) {
                this.dropdown.nativeElement.scrollTop = selectedElement.offsetTop - 140;
              }

              if (this.selectedOptionIndex === this.titles.length - 1) {
                this.dropdown.nativeElement.scrollTop = this.dropdown.nativeElement.scrollHeight;
              }
            }
          }

          if (event.key === 'Enter') {
            this.selectedOption = this.titles[this.selectedOptionIndex];
            this.isValueNotSelected = false;
          }
        }),
        takeUntil(this.unsubscribe$)
      ).subscribe();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
