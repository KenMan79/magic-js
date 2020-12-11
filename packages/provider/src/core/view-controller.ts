import {
  MagicIncomingWindowMessage,
  MagicMessageRequest,
  MagicPayloadMethod,
  MagicUserMetadata,
} from '@magic-sdk/types';
import { PayloadTransport } from './payload-transport';
import { createJsonRpcRequestPayload } from './json-rpc';
import { BaseModule } from '../modules/base-module';
import { logoSrc, closeIconSrc } from './static-assets';
import {
  displayNoneStyle,
  displayFlexStyle,
  displayBlockStyle,
  bottomRightStyle,
  bottomLeftStyle,
  topLeftStyle,
  topRightStyle,
  magicUiOverlayStyle,
  magicLogoImgStyle,
  magicBannerLogoImgStyle,
  contactCardStyle,
  magicInputStyle,
  magicAccountInfoStyle,
  magicCloseBtnStyle,
  magicLoginBtnStyle,
  magicLogoutBtnStyle,
} from './css-styles';

function applyOverlayStyles(elem: HTMLElement, styles: any) {
  for (const [cssProperty, value] of Object.entries(styles)) {
    /* eslint-disable-next-line no-param-reassign */
    (elem.style as any)[cssProperty as any] = value;
  }
}

const showContactCard = async (
  magicContactCardDiv: any,
  magicUiModule: any,
  magicLogoutBtn: any,
  magicInput: any,
  magicLoginBtn: any,
  magicLogoDiv: any,
  magicAccountInfo: any,
  magicBannerLogoDiv: any,
) => {
  await renderContactCardState(
    magicUiModule,
    magicLogoutBtn,
    magicInput,
    magicLoginBtn,
    magicAccountInfo,
    magicBannerLogoDiv,
  );
  applyOverlayStyles(magicLogoDiv, displayNoneStyle);
  applyOverlayStyles(magicContactCardDiv, displayFlexStyle);
};

const hideContactCard = (magicLogoDiv: any, magicContactCardDiv: any) => {
  applyOverlayStyles(magicLogoDiv, displayBlockStyle);
  applyOverlayStyles(magicContactCardDiv, displayNoneStyle);
};

const renderContactCardState = async (
  magicUiModule: any,
  magicLogoutBtn: any,
  magicInput: any,
  magicLoginBtn: any,
  magicAccountInfo: any,
  magicBannerLogoDiv: any,
) => {
  const isLoggedIn = await magicUiModule.isLoggedIn();
  console.log('isLoggedIn', isLoggedIn);
  if (isLoggedIn) {
    applyOverlayStyles(magicLogoutBtn, displayBlockStyle);
    applyOverlayStyles(magicInput, displayNoneStyle);
    applyOverlayStyles(magicLoginBtn, displayNoneStyle);
    applyOverlayStyles(magicAccountInfo, displayBlockStyle);
    applyOverlayStyles(magicBannerLogoDiv, displayNoneStyle);
    const metadata = await magicUiModule.getMetadata();
    /* eslint-disable-next-line no-param-reassign */
    magicAccountInfo.innerHTML = `
    <div style="text-align: center; margin-bottom: 25px; font-size: 20px">
      <b>Logged in as</b>
    </div>
    <div>
      <b>Email:</b>
      ${metadata.email}
    </div>
    <br />
    <div>
      <b>Public Address:</b>
      <div style="font-family: monospace; word-break: break-all; font-size: 19px">
        ${metadata.publicAddress}
      </div>
    </div>`;
  } else {
    applyOverlayStyles(magicLogoutBtn, displayNoneStyle);
    applyOverlayStyles(magicInput, displayBlockStyle);
    applyOverlayStyles(magicLoginBtn, displayBlockStyle);
    applyOverlayStyles(magicAccountInfo, displayNoneStyle);
    applyOverlayStyles(magicBannerLogoDiv, displayBlockStyle);
  }
};

const applyPositionalStyles = (magicUiDiv: any, magicContactCardDiv: any, magicUIPosition: any) => {
  if (magicUIPosition === 'bottomRight') {
    applyOverlayStyles(magicUiDiv, bottomRightStyle);
    applyOverlayStyles(magicContactCardDiv, bottomRightStyle);
  } else if (magicUIPosition === 'bottomLeft') {
    applyOverlayStyles(magicUiDiv, bottomLeftStyle);
    applyOverlayStyles(magicContactCardDiv, bottomLeftStyle);
  } else if (magicUIPosition === 'topLeft') {
    applyOverlayStyles(magicUiDiv, topLeftStyle);
    applyOverlayStyles(magicContactCardDiv, topLeftStyle);
  } else if (magicUIPosition === 'topRight') {
    applyOverlayStyles(magicUiDiv, topRightStyle);
    applyOverlayStyles(magicContactCardDiv, topRightStyle);
  }
};

export abstract class ViewController<Transport extends PayloadTransport = PayloadTransport> {
  public ready: Promise<void>;
  protected readonly endpoint: string;
  protected readonly parameters: string;

  initMagicUiElements = async () => {
    const magicUiDiv = document.createElement('div');
    const magicLogoDiv = document.createElement('img');
    const magicBannerLogoDiv = document.createElement('img');
    const magicContactCardDiv = document.createElement('div');
    const magicInput = document.createElement('input');
    const magicAccountInfo = document.createElement('div');
    const magicCloseBtn = document.createElement('img');
    const magicLoginBtn = document.createElement('div');
    const magicLogoutBtn = document.createElement('div');

    applyOverlayStyles(magicUiDiv, magicUiOverlayStyle);
    applyOverlayStyles(magicLogoDiv, magicLogoImgStyle);
    applyOverlayStyles(magicBannerLogoDiv, magicBannerLogoImgStyle);
    applyOverlayStyles(magicContactCardDiv, contactCardStyle);
    applyOverlayStyles(magicInput, magicInputStyle);
    applyOverlayStyles(magicAccountInfo, magicAccountInfoStyle);
    applyOverlayStyles(magicCloseBtn, magicCloseBtnStyle);

    applyPositionalStyles(magicUiDiv, magicContactCardDiv, this.sdk.magicUIPosition);

    magicInput.placeholder = 'your@email.com';
    magicCloseBtn.src = closeIconSrc;
    magicCloseBtn.onclick = () => hideContactCard(magicLogoDiv, magicContactCardDiv);

    magicLoginBtn.textContent = 'Login with Magic';
    magicLoginBtn.onclick = async () => {
      await this.magicUiModule.loginWithMagicLink('david.he@magic.link');
      renderContactCardState(
        this.magicUiModule,
        magicLogoutBtn,
        magicInput,
        magicLoginBtn,
        magicAccountInfo,
        magicBannerLogoDiv,
      );
    };
    applyOverlayStyles(magicLoginBtn, magicLoginBtnStyle);

    /* Log out btn */
    magicLogoutBtn.textContent = 'Logout';
    magicLogoutBtn.onclick = async () => {
      await this.magicUiModule.logout();
      renderContactCardState(
        this.magicUiModule,
        magicLogoutBtn,
        magicInput,
        magicLoginBtn,
        magicAccountInfo,
        magicBannerLogoDiv,
      );
    };
    applyOverlayStyles(magicLogoutBtn, magicLogoutBtnStyle);

    /* Logo */
    magicLogoDiv.src = logoSrc;
    magicLogoDiv.addEventListener('focus', function () {
      magicLogoDiv.style.transform = 'scale(0.8)';
    });
    magicLogoDiv.onclick = () => {
      showContactCard(
        magicContactCardDiv,
        this.magicUiModule,
        magicLogoutBtn,
        magicInput,
        magicLoginBtn,
        magicLogoDiv,
        magicAccountInfo,
        magicBannerLogoDiv,
      );
    };

    magicBannerLogoDiv.src = logoSrc;
    magicContactCardDiv.appendChild(magicCloseBtn);
    magicContactCardDiv.appendChild(magicBannerLogoDiv);
    magicContactCardDiv.appendChild(magicAccountInfo);
    magicContactCardDiv.appendChild(magicLogoutBtn);
    magicContactCardDiv.appendChild(magicInput);
    magicContactCardDiv.appendChild(magicLoginBtn);

    magicUiDiv.appendChild(magicContactCardDiv);
    magicUiDiv.appendChild(magicLogoDiv);
    document.body.appendChild(magicUiDiv);
  };

  constructor(protected readonly transport: Transport, protected readonly sdk: any) {
    // Get the `endpoint` and `parameters` value
    // from the underlying `transport` instance.
    this.endpoint = (transport as any).endpoint;
    this.parameters = (transport as any).parameters;
    this.magicUiModule = new MagicUiModule(sdk);

    // Create a promise that resolves when
    // the view is ready for messages.
    this.ready = this.waitForReady();
    if (this.sdk.showMagicUI)
      this.ready.then(() => {
        this.initMagicUiElements();
      });

    if (this.init) this.init();

    this.listen();
  }
  private magicUiModule: any;
  protected abstract init(): void;
  public abstract postMessage(data: MagicMessageRequest): Promise<void>;
  protected abstract hideOverlay(): void;
  protected abstract showOverlay(): void;

  private waitForReady() {
    return new Promise<void>((resolve) => {
      this.transport.on(MagicIncomingWindowMessage.MAGIC_OVERLAY_READY, () => resolve());
    });
  }

  /**
   * Listen for messages sent from the underlying Magic `<WebView>`.
   */
  private listen() {
    this.transport.on(MagicIncomingWindowMessage.MAGIC_HIDE_OVERLAY, () => {
      this.hideOverlay();
    });

    this.transport.on(MagicIncomingWindowMessage.MAGIC_SHOW_OVERLAY, () => {
      this.showOverlay();
    });
  }
}

class MagicUiModule extends BaseModule {
  public sdk: any;
  constructor(sdk: any) {
    super(sdk);
    this.sdk = sdk;
  }
  public loginWithMagicLink = (email: string) => {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.LoginWithMagicLink, [
      { email, showUI: true, redirectURI: '' },
    ]);
    return this.request<string | null, any>(requestPayload);
  };
  public getMetadata = () => {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.GetMetadata);
    return this.request<MagicUserMetadata>(requestPayload);
  };
  public isLoggedIn = () => {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.IsLoggedIn);
    return this.request<boolean>(requestPayload);
  };
  public logout = () => {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.Logout);
    return this.request<boolean>(requestPayload);
  };
}
