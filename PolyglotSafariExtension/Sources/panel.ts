import Mustache from "mustache";
import { getSelectionBoundingRect, isDescendant } from "./dom";

const PANEL_ID = "polyglot__panel";
const INDICATOR = `
<div class="polyglot__inner">
  <div class="polyglot__loader-contrainer">
  <div class="polyglot__loader">Loading</div>
  </div>
</div>
`;
const CONFIRM_BUTTON = `
<div class="polyglot__inner">
<button class="polyglot__confirm-button">
  <img alt="Translate" src="${safari.extension.baseURI}icon.png" />
</button>
</div>
`;

let isPanelOpen = false;

export function isElementPanelChildren(dom: HTMLElement) {
  const panel = document.getElementById(PANEL_ID);
  if (!panel) return false;

  return isDescendant(panel, dom);
}

export function showIndicator() {
  showPanel(INDICATOR);
}

export function showConfirmButton(
  onClick: ((ev: MouseEvent) => any) | null,
  cursorX: number
) {
  showPanel(CONFIRM_BUTTON, {
    onClick,
    style: { left: cursorX + "px" },
  });
}

export function showError(message: string) {
  const args = {
    message,
  };
  const result = Mustache.render(
    `
  <div class="polyglot__inner">
  <div class="polyglot__section">
    {{{message}}}
  </div>
  </div>`,
    args
  );
  showPanel(result);
}

interface TranslationParams {
  sourceLanguage: string | null;
  translation: string;
  transliteration: string;
  sourceTransliteration: string;
  synonyms: { pos: string; entries: string[] }[] | null;
}
export function showTranslation(args: TranslationParams) {
  const result = Mustache.render(
    `
  <div class="polyglot__inner">
    <div class="polyglot__section">
      <div class="polyglot__translation">
      {{{translation}}}
      </div>
    </div>

    {{#sourceTransliteration}}
    <div class="polyglot__section">
      <div class="polyglot__section--title">Transliteration</div>
      <div class="polyglot__section--content">
      {{{sourceTransliteration}}}
      </div>
    </div>
    {{/sourceTransliteration}}

    {{#synonyms}}
    <div class="polyglot__section">
      <div class="polyglot__section--title">{{pos}}</div>
      <div class="polyglot__section--content">
        <div class="polyglot__synonyms">
          {{#entries}}
          <div class="polyglot__synonyms--entry">{{.}}</div>
          {{/entries}}
        </div>
      </div>
    </div>
    {{/synonyms}}
  </div>`,
    args
  );

  showPanel(result);
}


let _version = '4';
export function removePanel() {
  console.log('REMOVE_PANEL' + _version);
  isPanelOpen = false;
  const panel = document.getElementById(PANEL_ID);
  if (panel) {
    panel.remove();
  }
}

// Show panel with given text
export function showPanel(
  content: string,
  {
    style = {},
    onClick = null,
  }: {
    style?: Partial<CSSStyleDeclaration>;
    onClick?: ((ev: MouseEvent) => any) | null;
  } = {}
): void {
  if (isPanelOpen) removePanel();
  console.log('SHOW_PANEL' + _version);
  const bounds = getSelectionBoundingRect();
  if (bounds === undefined) return;

  const el = document.createElement("div");
  el.innerHTML = content;
  el.id = PANEL_ID;
  el.style.left = bounds.left + "px";
  el.style.top = bounds.bottom + "px";

  if (onClick) el.addEventListener("click", onClick, false);

  for (const key in style) {
    el.style[key] = style[key]!;
  }

  // document.body.insertBefore(el, document.body.firstChild);
  // document.body.insertBefore(el, null);
  document.body.appendChild(el);
  isPanelOpen = true;
}
