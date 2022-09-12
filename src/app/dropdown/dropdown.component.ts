import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild} from '@angular/core';
import {fromEvent, Subject} from "rxjs";
import {filter, takeUntil, tap} from "rxjs/operators";

@Component({
  selector: 'dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent implements AfterViewInit, OnDestroy {
  selectedOptionIndex = -1;
  selectedValue = '';

  @Input() dropdownOptions: string[] = [];
  @Output() selectedOptionValue = new EventEmitter<string>();

  @ViewChild('dropdown') dropdown: ElementRef | undefined;

  unsubscribe$ = new Subject<void>();

  constructor() { }

  ngAfterViewInit(): void {
    fromEvent<KeyboardEvent>(window, 'keydown')
      .pipe(
        filter((event: KeyboardEvent) => event.key === 'ArrowDown'),
        tap(() => {
          this.selectedOptionIndex++;

          if (this.selectedOptionIndex > this.dropdownOptions.length - 1) {
            this.selectedOptionIndex = 0;
          }

          if (this.dropdown) {
            const selectedElement = document.querySelector('.dropdown-options.selected') as HTMLDivElement;

            if (selectedElement) {
              this.dropdown.nativeElement.scrollTop = selectedElement.offsetTop - 70;
            }

            if (this.selectedOptionIndex === 0) {
              this.dropdown.nativeElement.scrollTop = 0;
            }
          }
        }),
        takeUntil(this.unsubscribe$)
      ).subscribe();

    fromEvent<KeyboardEvent>(window, 'keydown')
      .pipe(
        filter((event: KeyboardEvent) => event.key === 'ArrowUp'),
        tap(() => {
          this.selectedOptionIndex--;

          if (this.selectedOptionIndex < 0) {
            this.selectedOptionIndex = this.dropdownOptions.length - 1;
          }

          if (this.dropdown) {
            const selectedElement = document.querySelector('.dropdown-options.selected') as HTMLDivElement;

            if (selectedElement) {
              this.dropdown.nativeElement.scrollTop = selectedElement.offsetTop - 140;
            }

            if (this.selectedOptionIndex === this.dropdownOptions.length - 1) {
              this.dropdown.nativeElement.scrollTop = this.dropdown.nativeElement.scrollHeight;
            }
          }
        }),
        takeUntil(this.unsubscribe$)
      ).subscribe();

    fromEvent<KeyboardEvent>(window, 'keydown')
      .pipe(
        filter((event: KeyboardEvent) => event.key === 'Enter'),
        tap(() => {
          this.selectedValue = this.dropdownOptions[this.selectedOptionIndex];
          this.selectedOptionValue.emit(this.selectedValue);
        }),
        takeUntil(this.unsubscribe$)
      ).subscribe();
  }

  selectOptionOnMouseClick(optionIndex: number): void {
    this.selectedOptionIndex = optionIndex;
    this.selectedValue = this.dropdownOptions[optionIndex];
    this.selectedOptionValue.emit(this.selectedValue);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
