import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { State } from 'src/app/state/app.state';
import * as AppActions from '../../../../state/app.actions';
import { AppModalStates } from '../../../../state/app.enums';
import { IAmount } from '../../../../state/app.model';
import {
  getPriceItems, getSaleItems,

  getUID,
  getUsername
} from '../../../../state/index';
@Component({
  selector: 'ec-new-transaction-summary-modal',
  templateUrl: './new-transaction-summary-modal.component.html',
})
export class NewTransactionSummaryModalComponent {
  saleItems$!: Observable<IAmount>;
  priceItems$!: Observable<IAmount>;
  uid$!: Observable<string | undefined>;
  username$!: Observable<string | null | undefined>;

  constructor(private store: Store<State>, public authService: AuthService) {}

  ngOnInit(): void {
    this.saleItems$ = this.store.select(getSaleItems);
    this.priceItems$ = this.store.select(getPriceItems);
    this.uid$ = this.store.select(getUID);
    this.username$ = this.store.select(getUsername);
  }

  closeModal() {
    this.store.dispatch(
      AppActions.showModal({ modalState: AppModalStates.Closed })
    );
  }
}
