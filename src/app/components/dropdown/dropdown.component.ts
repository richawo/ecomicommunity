import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { State } from 'src/app/state/app.state';
import * as AppActions from '../../state/app.actions';
import { AppDropdownState } from '../../state/app.enums';
import { getDropdownState, getActiveDropdownOptions } from '../../state/index';

@Component({
  selector: 'ec-dropdown',
  templateUrl: './dropdown.component.html',
})
export class DropdownComponent implements OnInit {
  @Input() label?: string;
  @Input() options?: string[];
  @Input() showList!: boolean | null;
  @Input() dropdown!: AppDropdownState;
  @Input() topClass = '';
  toggleDropdown$!: Observable<string>;
  activeDropdownOptions$!: Observable<string>;

  @Output() chosenOption = new EventEmitter<string | null>();

  constructor(private store: Store<State>) {}

  ngOnInit(): void {
    this.toggleDropdown$ = this.store.select(getDropdownState);
    this.activeDropdownOptions$ = this.store
      .select(getActiveDropdownOptions)
      .pipe(
        map((list) => {
          const index = list.findIndex(
            (item) => Object.keys(item)[0] === this.dropdown
          );
          return index !== -1 ? list[index][this.dropdown] : this.label || '';
        })
      );
  }

  toggleDropdown(): void {
    this.store.dispatch(
      AppActions.toggleDropdown({
        dropdownState: this.dropdown,
      })
    );
  }

  setDropdownOption(option: string): void {
    this.store.dispatch(
      AppActions.setDropdownOption({
        dropdownOption: option,
      })
    );
    this.chosenOption.emit(option);
  }
}
