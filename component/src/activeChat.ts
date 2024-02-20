import {CameraFilesServiceConfig, FilesServiceConfig, MicrophoneFilesServiceConfig} from './types/fileServiceConfigs';
import {MessageContent, IntroMessage, MessageStyles, UserContent, OnMessage} from './types/messages';
import {WebComponentStyleUtils} from './utils/webComponent/webComponentStyleUtils';
import {DisableSubmitButton, SubmitButtonStyles} from './types/submitButton';
import {RequestInterceptor, ResponseInterceptor} from './types/interceptors';
import {FocusUtils} from './views/chat/input/textInput/focusUtils';
import {SetupMessages} from './views/chat/messages/setupMessages';
import {InternalHTML} from './utils/webComponent/internalHTML';
import {ServiceIOFactory} from './services/serviceIOFactory';
import {ValidationHandler} from './types/validationHandler';
import {GoogleFont} from './utils/webComponent/googleFont';
import {TextToSpeechConfig} from './types/textToSpeech';
import {SpeechToTextConfig} from './types/microphone';
import {ErrorMessages, OnError} from './types/error';
import {RequestBodyLimits} from './types/chatLimits';
import {Property} from './utils/decorators/property';
import {FireEvents} from './utils/events/fireEvents';
import {ValidateInput} from './types/validateInput';
import {DropupStyles} from './types/dropupStyles';
import {HTMLClassUtilities} from './types/html';
import {ChatView} from './views/chat/chatView';
import {ServiceIO} from './services/serviceIO';
import {Legacy} from './utils/legacy/legacy';
import {TextInput} from './types/textInput';
import style from './activeChat.css?inline';
import {CustomStyle} from './types/styles';
import {Response} from './types/response';
import {Connect} from './types/connect';
import {Avatars} from './types/avatars';
import {Names} from './types/names';
import {Demo} from './types/demo';

// TO-DO - ability to export files
// TO-DO - perhaps chat bubbles should start at the bottom which would allow nice slide up animation (optional)
export class ActiveChat extends InternalHTML {
  @Property('object')
  connect?: Connect;

  @Property('object')
  requestBodyLimits?: RequestBodyLimits;

  @Property('function')
  requestInterceptor?: RequestInterceptor;

  @Property('function')
  responseInterceptor?: ResponseInterceptor;

  @Property('function')
  validateInput?: ValidateInput;

  @Property('object')
  chatStyle?: CustomStyle;

  @Property('object')
  attachmentContainerStyle?: CustomStyle;

  @Property('object')
  dropupStyles?: DropupStyles;

  @Property('object')
  inputAreaStyle?: CustomStyle;

  @Property('object')
  textInput?: TextInput;

  @Property('object')
  submitButtonStyles?: SubmitButtonStyles;

  @Property('string')
  auxiliaryStyle?: string;

  @Property('array')
  history?: MessageContent[];

  @Property('object')
  introMessage?: IntroMessage;

  @Property('object')
  avatars?: Avatars;

  @Property('object')
  names?: Names;

  @Property('boolean')
  displayLoadingBubble?: boolean;

  @Property('object')
  errorMessages?: ErrorMessages;

  @Property('object')
  messageStyles?: MessageStyles;

  @Property('object')
  textToSpeech?: boolean | TextToSpeechConfig;

  @Property('object')
  speechToText?: boolean | SpeechToTextConfig; // only activated if not used for recording audio

  @Property('object')
  images?: boolean | FilesServiceConfig;

  @Property('object')
  gifs?: boolean | FilesServiceConfig;

  @Property('object')
  camera?: boolean | CameraFilesServiceConfig;

  @Property('object')
  audio?: boolean | FilesServiceConfig;

  @Property('object')
  microphone?: boolean | MicrophoneFilesServiceConfig;

  @Property('object')
  mixedFiles?: boolean | FilesServiceConfig;

  @Property('object')
  dragAndDrop?: boolean | CustomStyle; // by default it is enabled if file attachments are allowed

  @Property('object')
  introPanelStyle?: CustomStyle;

  @Property('object')
  htmlClassUtilities?: HTMLClassUtilities;

  getMessages: () => MessageContent[] = () => [];

  submitUserMessage: (content: UserContent) => void = () =>
    console.warn('submitUserMessage failed - please wait for chat view to render before calling this property.');

  addMessage: (message: Response, isUpdate?: boolean) => void = () =>
    console.warn('addMessage failed - please wait for chat view to render before calling this property.');

  focusInput: () => void = () => FocusUtils.focusFromParentElement(this._elementRef);

  refreshMessages: () => void = () => {};

  clearMessages: (isReset?: boolean) => void = () => {};

  scrollToBottom: () => void = () => {};

  disableSubmitButton: DisableSubmitButton = () => {};

  @Property('function')
  onMessage?: OnMessage;

  @Property('function')
  onClearMessages?: () => void;

  @Property('function')
  onComponentRender?: (ref: ActiveChat) => void;

  @Property('function')
  onError?: OnError;

  @Property('object')
  demo?: Demo;

  _hasBeenRendered = false;

  _auxiliaryStyleApplied = false;

  _activeService?: ServiceIO;

  _childElement?: HTMLElement;

  _validationHandler?: ValidationHandler;

  readonly _elementRef: HTMLElement;

  readonly _getSetUpMessage = SetupMessages.getText;

  constructor() {
    super();
    GoogleFont.appendStyleSheetToHead();
    this._elementRef = document.createElement('div');
    this._elementRef.id = 'container';
    this.attachShadow({mode: 'open'}).appendChild(this._elementRef);
    WebComponentStyleUtils.apply(style, this.shadowRoot);
    setTimeout(() => {
      // if user has not set anything (to cause onRender to execute), force it
      if (!this._hasBeenRendered) this.onRender();
    }, 20); // rendering takes time, hence this is a high value to be safe
  }

  // prettier-ignore
  override onRender() {
    Legacy.processConnect(this);
    if (!this._activeService || this._activeService.demo) this._activeService = ServiceIOFactory.create(this); 
    if (this.auxiliaryStyle && !this._auxiliaryStyleApplied) {
      WebComponentStyleUtils.apply(this.auxiliaryStyle, this.shadowRoot);
      this._auxiliaryStyleApplied = true;
    }
    WebComponentStyleUtils.applyDefaultStyleToComponent(this.style, this.chatStyle);
    Legacy.checkForContainerStyles(this, this._elementRef);
    // set before container populated, not available in constructor for react,
    // assigning to variable as it is added to panel and is no longer child (test in official website)
    this._childElement ??= this.children[0] as HTMLElement | undefined;
    ChatView.render(this, this._elementRef, this._activeService, this._childElement);
    this._hasBeenRendered = true;
    FireEvents.onRender(this);
  }
}

customElements.define('active-chat', ActiveChat);

// The following type makes it easier for other projects to use this component with TypeScript
declare global {
  interface HTMLElementTagNameMap {
    'active-chat': ActiveChat;
  }
}
