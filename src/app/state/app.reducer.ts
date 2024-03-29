import { createReducer, on } from '@ngrx/store';
import {
  INTERNAL_NETWORK_ADDRESSES,
  NETWORK_FEES_PC,
} from 'functions/src/utils/constants.utils';
import {
  AppTransactionCurrencies,
  AppTransactionItemTypes,
  Networks,
  NetworkSymbols,
} from 'functions/src/utils/enums.utils';
import {
  IUser,
  ITransaction,
  IAmount,
} from 'functions/src/utils/interfaces.utils';
import { UtilService } from '../services/util.service';
import * as AppActions from './app.actions';
import { AppModalStates, AppDropdownState, AppAuthMessages } from './app.enums';

export interface AppState {
  user: IUser | undefined;
  registrationErrorMessage: string;
  loginErrorMessage: string;
  transactionModalErrorMessage: string;
  modalState: AppModalStates;
  isNavbarVisible: boolean;
  emailConsent: boolean;
  rememberMe: boolean;
  dropdownState: AppDropdownState;
  activeDropdownOptions: { [AppDropdownState: string]: string }[];
  transactions: ITransaction[];
  creatorItems: IAmount;
  purchasorItems: IAmount;
  activeTransaction: string;
}

const initialState: AppState = {
  activeTransaction: '',
  registrationErrorMessage: '',
  transactionModalErrorMessage: '',
  loginErrorMessage: '',
  user: undefined,
  modalState: AppModalStates.Closed,
  isNavbarVisible: false,
  emailConsent: false,
  rememberMe: false,
  dropdownState: AppDropdownState.Hidden,
  activeDropdownOptions: [
    {
      [AppDropdownState.AddNewTransactionItemType]:
        AppTransactionItemTypes.Currency,
    },
  ],
  transactions: [],
  creatorItems: {
    sendingCurrency: AppTransactionCurrencies.GEMS,
    sendingUnits: 1000,
    receivingWallet: {
      network: Networks.BTC,
      networkSymbol: NetworkSymbols.BTC,
      walletAddress: '',
      veveUsername: '',
    },
    sendingWallet: {
      network: Networks.VEVE,
      networkSymbol: NetworkSymbols.VEVE,
      walletAddress: '',
      veveUsername: '',
    },
    platformReceivingWallet: {
      walletAddress: INTERNAL_NETWORK_ADDRESSES[NetworkSymbols.VEVE],
    },
    receivingFees: {
      networkFees: NETWORK_FEES_PC[AppTransactionCurrencies.BTC][0].fee,
      platformFees: 0.125 * 0.05,
      totalPostFees:
        0.0125 * 0.95 - NETWORK_FEES_PC[AppTransactionCurrencies.BTC][0].fee,
    },
  },
  purchasorItems: {
    username: '',
    useruid: '',
    sendingCurrency: AppTransactionCurrencies.BTC,
    sendingUnits: 0.0125,
    receivingWallet: {
      network: Networks.VEVE,
      networkSymbol: NetworkSymbols.VEVE,
      walletAddress: '',
      veveUsername: '',
    },
    sendingWallet: {
      network: Networks.BTC,
      networkSymbol: NetworkSymbols.BTC,
      walletAddress: '',
      veveUsername: '',
    },
    platformReceivingWallet: {
      walletAddress: INTERNAL_NETWORK_ADDRESSES[NetworkSymbols.BTC],
    },
    receivingFees: {
      networkFees: NETWORK_FEES_PC[AppTransactionCurrencies.GEMS][0].fee,
      platformFees: 1000 * 0.05,
      totalPostFees:
        1000 * 0.95 - NETWORK_FEES_PC[AppTransactionCurrencies.GEMS][0].fee,
    },
  },
};

export const appReducer = createReducer<AppState>(
  initialState,
  on(AppActions.credentialsRegistrationFailure, (state, props): AppState => {
    return { ...state, registrationErrorMessage: props.error.message };
  }),

  on(AppActions.credentialsLoginFailure, (state, props): AppState => {
    return { ...state, loginErrorMessage: props.error.message };
  }),

  on(AppActions.resetSignupError, (state): AppState => {
    return { ...state, registrationErrorMessage: '' };
  }),

  on(AppActions.resetLoginError, (state): AppState => {
    return { ...state, loginErrorMessage: '' };
  }),

  on(AppActions.showModal, (state, props): AppState => {
    return {
      ...state,
      modalState: props.modalState,
      dropdownState: AppDropdownState.Hidden,
      loginErrorMessage: '',
      registrationErrorMessage: '',
      transactionModalErrorMessage: '',
    };
  }),

  on(AppActions.toggleDropdown, (state, props): AppState => {
    return {
      ...state,
      dropdownState:
        props.dropdownState === state.dropdownState
          ? AppDropdownState.Hidden
          : props.dropdownState,
    };
  }),

  on(AppActions.setDropdownOption, (state, props): AppState => {
    const array = Object.assign([], state.activeDropdownOptions) as {
      [AppDropdownState: string]: string;
    }[];
    const newItem = { [state.dropdownState]: props.dropdownOption };
    const index = array.findIndex(
      (o) => Object.keys(o)[0] === state.dropdownState
    );
    if (index === -1) {
      array.push(newItem);
    } else {
      array[index] = newItem;
    }
    return {
      ...state,
      activeDropdownOptions: array,
      dropdownState: AppDropdownState.Hidden,
    };
  }),

  on(AppActions.toggleNavbar, (state): AppState => {
    return { ...state, isNavbarVisible: !state.isNavbarVisible };
  }),

  on(AppActions.toggleEmailConsent, (state): AppState => {
    return { ...state, emailConsent: !state.emailConsent };
  }),

  on(AppActions.toggleRememberMe, (state): AppState => {
    return { ...state, rememberMe: !state.rememberMe };
  }),

  on(AppActions.credentialsLoginSuccess, (state, props): AppState => {
    return {
      ...state,
      user: props.user,
      loginErrorMessage: '',
      modalState: AppModalStates.Closed,
    };
  }),

  on(AppActions.setUserSecret, (state, props): AppState => {
    const user = {
      uid: state.user?.uid,
      email: state.user?.email,
      photoURL: state.user?.photoURL,
      username: state.user?.username,
      secret: props.secret,
    };
    state.rememberMe
      ? localStorage.setItem('ec-user', JSON.stringify(user))
      : sessionStorage.setItem('ec-user', JSON.stringify(user));
    return {
      ...state,
      user: user,
    };
  }),

  on(AppActions.isLoggedIn, (state): AppState => {
    const localUser = UtilService.checkUser(localStorage.getItem('ec-user'));
    const sessionUser = UtilService.checkUser(
      sessionStorage.getItem('ec-user')
    );
    return {
      ...state,
      user: state.user
        ? state.user
        : localUser
        ? localUser
        : sessionUser || undefined,
    };
  }),

  on(AppActions.clearUser, (state): AppState => {
    if (localStorage.getItem('ec-user')) {
      localStorage.removeItem('ec-user');
    }
    if (sessionStorage.getItem('ec-user')) {
      sessionStorage.removeItem('ec-user');
    }
    return {
      ...state,
      user: undefined,
    };
  }),

  on(AppActions.setTransactions, (state, props): AppState => {
    return { ...state, transactions: props.txs };
  }),

  //SET CREATOR DETAILS
  on(AppActions.setCreatorUserDetails, (state): AppState => {
    return {
      ...state,
      creatorItems: {
        ...state.creatorItems,
        useruid: state.user?.uid || state.creatorItems.useruid,
        username: state.user?.username || state.creatorItems.username,
      },
    };
  }),
  on(
    AppActions.setPlatformReceivingCreatorWalletAddress,
    (state, props): AppState => {
      return {
        ...state,
        creatorItems: {
          ...state.creatorItems,
          platformReceivingWallet: {
            walletAddress: props.walletAddress,
          },
        },
      };
    }
  ),
  on(
    AppActions.setCreatorSendingNetworkWalletAddress,
    (state, props): AppState => {
      return {
        ...state,
        creatorItems: {
          ...state.creatorItems,
          sendingWallet: {
            ...state.creatorItems.sendingWallet,
            walletAddress: props.walletAddress,
          },
        },
      };
    }
  ),
  on(
    AppActions.setCreatorSendingNetworkVeveUsername,
    (state, props): AppState => {
      return {
        ...state,
        creatorItems: {
          ...state.creatorItems,
          sendingWallet: {
            ...state.creatorItems.sendingWallet,
            veveUsername: props.veveUsername,
          },
        },
      };
    }
  ),
  on(AppActions.setCreatorSendingAmountUnits, (state, props): AppState => {
    return {
      ...state,
      creatorItems: {
        ...state.creatorItems,
        sendingUnits: props?.sendingUnits || state.creatorItems.sendingUnits!,
      },
    };
  }),
  on(AppActions.setCreatorSendingAmountCurrency, (state, props): AppState => {
    return {
      ...state,
      creatorItems: {
        ...state.creatorItems,
        sendingCurrency:
          props?.sendingCurrency || state.creatorItems.sendingCurrency!,
      },
    };
  }),
  on(AppActions.setCreatorSendingNetworkSymbol, (state, props): AppState => {
    return {
      ...state,
      creatorItems: {
        ...state.creatorItems,
        sendingWallet: {
          ...state.creatorItems.sendingWallet,
          networkSymbol:
            props.symbol || state.creatorItems.sendingWallet?.networkSymbol,
          network:
            Networks[
              props?.symbol || state.creatorItems.sendingWallet?.networkSymbol
            ],
        },
      },
    };
  }),
  on(AppActions.setCreatorReceivingNetworkSymbol, (state, props): AppState => {
    return {
      ...state,
      creatorItems: {
        ...state.creatorItems,
        receivingWallet: {
          ...state.creatorItems.receivingWallet,
          networkSymbol:
            props.symbol || state.creatorItems.receivingWallet?.networkSymbol,
          network:
            Networks[
              props?.symbol || state.creatorItems.receivingWallet?.networkSymbol
            ],
        },
      },
    };
  }),
  on(
    AppActions.setCreatorReceivingNetworkWalletAddress,
    (state, props): AppState => {
      return {
        ...state,
        creatorItems: {
          ...state.creatorItems,
          receivingWallet: {
            ...state.creatorItems.receivingWallet,
            walletAddress: props.walletAddress,
          },
        },
      };
    }
  ),
  on(AppActions.setCreatorReceivingFees, (state): AppState => {
    const units = state.purchasorItems.sendingUnits!;
    const currency = state.purchasorItems.sendingCurrency;
    const networkSymbol = state.creatorItems.receivingWallet?.networkSymbol!;

    const networkDetails = NETWORK_FEES_PC[currency!].find(
      (network) => network.symbol === networkSymbol
    );
    const networkFees = networkDetails?.fee!;
    const platformFees = networkSymbol
      ? Math.max(0.05 * units, networkDetails!.minimum! * 0.05)
      : 999;

    return {
      ...state,
      creatorItems: {
        ...state.creatorItems,
        receivingFees: {
          networkFees: networkFees,
          platformFees: platformFees,
          totalPostFees: units - platformFees - networkFees,
        },
      },
    };
  }),

  // SET PURCHASOR DETAILS
  on(AppActions.setPurchasorUserDetails, (state): AppState => {
    return {
      ...state,
      purchasorItems: {
        ...state.purchasorItems,
        useruid: state.user?.uid || state.purchasorItems.useruid,
        username: state.user?.username || state.purchasorItems.username,
      },
    };
  }),
  on(
    AppActions.setPlatformReceivingPurchasorWalletAddress,
    (state, props): AppState => {
      return {
        ...state,
        purchasorItems: {
          ...state.purchasorItems,
          platformReceivingWallet: {
            walletAddress: props.walletAddress,
          },
        },
      };
    }
  ),
  on(
    AppActions.setPurchasorSendingNetworkWalletAddress,
    (state, props): AppState => {
      return {
        ...state,
        purchasorItems: {
          ...state.purchasorItems,
          sendingWallet: {
            ...state.purchasorItems.sendingWallet,
            walletAddress: props.walletAddress,
          },
        },
      };
    }
  ),
  on(
    AppActions.setPurchasorSendingNetworkVeveUsername,
    (state, props): AppState => {
      return {
        ...state,
        purchasorItems: {
          ...state.purchasorItems,
          sendingWallet: {
            ...state.purchasorItems.sendingWallet,
            veveUsername: props.veveUsername,
          },
        },
      };
    }
  ),
  on(AppActions.setPurchasorSendingAmountUnits, (state, props): AppState => {
    return {
      ...state,
      purchasorItems: {
        ...state.purchasorItems,
        sendingUnits: props?.sendingUnits || state.purchasorItems.sendingUnits!,
      },
    };
  }),
  on(AppActions.setPurchasorSendingAmountCurrency, (state, props): AppState => {
    return {
      ...state,
      purchasorItems: {
        ...state.purchasorItems,
        sendingCurrency:
          props.sendingCurrency || state.purchasorItems.sendingCurrency!,
      },
    };
  }),
  on(AppActions.setPurchasorSendingNetworkSymbol, (state, props): AppState => {
    return {
      ...state,
      purchasorItems: {
        ...state.purchasorItems,
        sendingWallet: {
          ...state.purchasorItems.sendingWallet,
          networkSymbol:
            props.symbol || state.purchasorItems.sendingWallet?.networkSymbol,
          network:
            Networks[
              props?.symbol || state.purchasorItems.sendingWallet?.networkSymbol
            ],
        },
      },
    };
  }),
  on(
    AppActions.setPurchasorReceivingNetworkSymbol,
    (state, props): AppState => {
      return {
        ...state,
        purchasorItems: {
          ...state.purchasorItems,
          receivingWallet: {
            ...state.purchasorItems.receivingWallet,
            networkSymbol:
              props.symbol ||
              state.purchasorItems.receivingWallet?.networkSymbol,
            network:
              Networks[
                props?.symbol ||
                  state.purchasorItems.receivingWallet?.networkSymbol
              ],
          },
        },
      };
    }
  ),
  on(AppActions.setPurchasorReceivingFees, (state): AppState => {
    const units = state.creatorItems.sendingUnits!;
    const currency = state.creatorItems.sendingCurrency;
    const networkSymbol = state.purchasorItems.receivingWallet?.networkSymbol!;

    const networkDetails = NETWORK_FEES_PC[currency!].find(
      (network) => network.symbol === networkSymbol
    );
    const networkFees = networkDetails?.fee!;
    const platformFees = networkSymbol
      ? Math.max(0.05 * units, networkDetails!.minimum! * 0.05)
      : 999;

    return {
      ...state,
      purchasorItems: {
        ...state.purchasorItems,
        receivingFees: {
          networkFees: networkFees,
          platformFees: platformFees,
          totalPostFees: units - platformFees - networkFees,
        },
      },
    };
  }),
  on(
    AppActions.setPurchasorReceivingNetworkWalletAddress,
    (state, props): AppState => {
      return {
        ...state,
        purchasorItems: {
          ...state.purchasorItems,
          receivingWallet: {
            ...state.purchasorItems.receivingWallet,
            walletAddress: props.walletAddress,
          },
        },
      };
    }
  ),
  on(
    AppActions.setPurchasorReceivingNetworkVeveUsername,
    (state, props): AppState => {
      return {
        ...state,
        purchasorItems: {
          ...state.purchasorItems,
          receivingWallet: {
            ...state.purchasorItems.receivingWallet,
            veveUsername: props.veveUsername,
          },
        },
      };
    }
  ),
  on(AppActions.setEmailVerificationFailMessage, (state): AppState => {
    return { ...state, loginErrorMessage: AppAuthMessages.EmailUnverified };
  }),

  on(AppActions.setActiveTransaction, (state, props): AppState => {
    return {
      ...state,
      purchasorItems: props.txn!.purchasor!,
      creatorItems: props.txn!.creator!,
      activeTransaction: props.txn?.id!,
    };
  }),

  on(AppActions.resetTransaction, (state): AppState => {
    return {
      ...state,
      activeTransaction: initialState.activeTransaction,
      creatorItems: initialState.creatorItems,
      purchasorItems: initialState.purchasorItems,
    };
  }),

  on(AppActions.setTransactionModalErrorMessage, (state, props): AppState => {
    return {
      ...state,
      transactionModalErrorMessage: props.error,
    };
  })
);
