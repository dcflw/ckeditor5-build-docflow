import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import clickOutsideHandler from "@ckeditor/ckeditor5-ui/src/bindings/clickoutsidehandler";
import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";
import ContextualBalloon from "@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon";

import ReactView from "../../views/react-view";
import iconTagsSolid from "./theme/icons/tags-solid.svg";
import {
  CONFIG_NAMESPACE,
  CUSTOM_PROPERTY_ID,
  CUSTOM_PROPERTY_NAME,
  TYPE_PLACEHOLDER,
  TYPE_VARIABLE,
} from "./docflow-placeholder-editing";
import { COMMAND_PLACEHOLDER } from "./docflow-placeholder-command";
import { COMMAND_VARIABLE } from "./docflow-variable-command";

export default class DocflowPlaceholderUi extends Plugin {
  static get requires() {
    return [ContextualBalloon];
  }

  init() {
    const editor = this.editor;
    const config = editor.config._config;
    const formComponent =
      config[CONFIG_NAMESPACE] && config[CONFIG_NAMESPACE].formComponent;
    const formComponentProps = editor.config.get(
      `${CONFIG_NAMESPACE}.formComponentProps`,
    );

    this.balloon = editor.plugins.get(ContextualBalloon);
    this.isBalloonVisible = false;
    this.reactView = new ReactView(editor.locale, formComponent, {
      ...formComponentProps,
      onInsertPlaceholder: this.handleInsertPlaceholder.bind(this),
      onInsertVariable: this.handleInsertVariable.bind(this),
    });

    this.addToolbarButton();
    this.enableUserBalloonInteractions();
  }

  handleInsertPlaceholder(id, name) {
    this.editor.execute(COMMAND_PLACEHOLDER, { name, id });
  }

  handleInsertVariable(name) {
    this.editor.execute(COMMAND_VARIABLE, { name });
  }

  getBalloonPositionData() {
    const view = this.editor.editing.view;
    const viewDocument = view.document;
    const target = view.domConverter.viewRangeToDom(
      viewDocument.selection.getFirstRange(),
    );

    return { target };
  }

  showBalloon(element) {
    let props = {
      selectedPlaceholderId: undefined,
      selectedText: this.getSelectedText(),
      selectedVariable: undefined,
    };

    if (element) {
      const type = element.getCustomProperty("type");

      if (type === TYPE_PLACEHOLDER) {
        props.selectedPlaceholderId = element.getCustomProperty(
          CUSTOM_PROPERTY_ID,
        );
      } else if (type === TYPE_VARIABLE) {
        props.selectedVariable = element.getCustomProperty(
          CUSTOM_PROPERTY_NAME,
        );
      }
    }

    this.reactView.updateProps(props);
    this.balloon.add({
      view: this.reactView,
      position: this.getBalloonPositionData(),
    });
    this.isBalloonVisible = true;
  }

  hideBalloon() {
    if (this.isBalloonVisible) {
      this.balloon.remove(this.reactView);
      this.isBalloonVisible = false;
    }
  }

  addToolbarButton() {
    this.editor.ui.componentFactory.add("insertPlaceholder", locale => {
      const button = new ButtonView(locale);

      button.set({
        label: "Placeholder",
        icon: iconTagsSolid,
        tooltip: true,
      });

      this.listenTo(button, "execute", () => this.showBalloon());

      return button;
    });
  }

  enableUserBalloonInteractions() {
    const hideBalloonIfNotSelected = () => {
      if (this.isBalloonVisible && !this.getSelectedPlaceholderElement()) {
        this.hideBalloon();
      }
    };

    this.editor.keystrokes.set("esc", (data, cancel) => {
      if (this.isBalloonVisible) {
        this.hideBalloon();
        cancel();
      }
    });

    this.editor.keystrokes.set("arrowleft", hideBalloonIfNotSelected);
    this.editor.keystrokes.set("arrowup", hideBalloonIfNotSelected);
    this.editor.keystrokes.set("arrowright", hideBalloonIfNotSelected);
    this.editor.keystrokes.set("arrowdown", hideBalloonIfNotSelected);

    this.editor.editing.view.document.on("click", () => {
      const element = this.getSelectedPlaceholderElement();

      if (element) {
        this.showBalloon(element);
      }
    });
    this.editor.editing.view.document.selection.on(
      "change",
      hideBalloonIfNotSelected,
    );

    clickOutsideHandler({
      emitter: this.reactView,
      activator: () => this.isBalloonVisible,
      contextElements: [this.balloon.view.element],
      callback: () => this.hideBalloon(),
    });
  }

  getSelectedPlaceholderElement() {
    const view = this.editor.editing.view;
    const selection = view.document.selection;
    const selectedElement = selection.getSelectedElement();

    if (selectedElement) {
      const type = selectedElement.getCustomProperty("type");

      if (type === TYPE_PLACEHOLDER || type === TYPE_VARIABLE) {
        return selectedElement;
      }
    }

    return null;
  }

  getSelectedText() {
    const results = [];
    const view = this.editor.editing.view;
    const selection = view.document.selection;

    for (const item of selection.getFirstRange().getItems()) {
      if (item.is("textProxy")) {
        results.push(item.data);
      }
    }

    return results.join(" ");
  }
}
