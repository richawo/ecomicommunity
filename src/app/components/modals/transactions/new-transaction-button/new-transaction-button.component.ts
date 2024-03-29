import { Component, Input, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { IUser } from 'functions/src/utils/interfaces.utils';
import { AppModalStates } from 'src/app/state/app.enums';
import { State } from 'src/app/state/app.state';
import * as AppActions from '../../../../state/app.actions';

@Component({
  selector: 'ec-new-transaction-button',
  templateUrl: './new-transaction-button.component.html',
})
export class NewTransactionButtonComponent {
  @Input() user!: IUser | null | undefined;

  constructor(private store: Store<State>) {}

  showNewTransactionModal(): void {
    if (this.user) {
      this.store.dispatch(AppActions.resetTransaction());
      this.store.dispatch(
        AppActions.showModal({ modalState: AppModalStates.CreatorItem })
      );
    } else {
      this.store.dispatch(
        AppActions.showModal({ modalState: AppModalStates.Registration })
      );
    }
  }
}
