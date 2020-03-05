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

    if (editor.config.get(`${CONFIG_NAMESPACE}.enabled`)) {
      const config = editor.config._config;
      const formComponent =
        config[CONFIG_NAMESPACE] && config[CONFIG_NAMESPACE].formComponent;
      const formComponentProps = editor.config.get(
        `${CONFIG_NAMESPACE}.formComponentProps`,
      );

      this.balloon = editor.plugins.get(ContextualBalloon);
      this.reactView = new ReactView(editor.locale, formComponent, {
        ...formComponentProps,
        onSelectPlaceholder: this.handleInsertPlaceholder.bind(this),
        onSelectVariable: this.handleInsertVariable.bind(this),
      });

      this.addToolbarButton();
      this.enableUserBalloonInteractions();
    }
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

    if (this.balloon.hasView(this.reactView)) {
      this.balloon.remove(this.reactView);
    }

    this.balloon.add({
      singleViewModel: true,
      view: this.reactView,
      position: this.getBalloonPositionData(),
    })

    this.removeClassCkResetAll();
    this.balloon.updatePosition();
  }

  hideBalloon() {
    if (this.isBalloonVisible()) {
      this.balloon.remove(this.reactView);
      this.addClassCkResetAll();
    }
  }

  isBalloonVisible() {
    return this.balloon.visibleView === this.reactView;
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
      if (this.isBalloonVisible() && !this.getSelectedPlaceholderElement()) {
        this.hideBalloon();
      }
    };

    this.editor.keystrokes.set("esc", (data, cancel) => {
      if (this.isBalloonVisible()) {
        this.hideBalloon();
        cancel();
      }
    });

    this.editor.editing.view.document.on("click", () => {
      const element = this.getSelectedPlaceholderElement();

      if (element) {
        this.showBalloon(element);
      }
    });

    this.editor.editing.view.document.selection.on("change", () =>
      setTimeout(hideBalloonIfNotSelected),
    );

    clickOutsideHandler({
      emitter: this.reactView,
      activator: () => this.isBalloonVisible(),
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

    return results.join(" ").trim();
  }

  addClassCkResetAll() {
    const bodyContainer = this.editor.ui.view.body._parentElement;

    if (bodyContainer && !bodyContainer.classList.contains("ck-reset_all")) {
      bodyContainer.classList.add("ck-reset_all");
    }
  }

  removeClassCkResetAll() {
    const bodyContainer = this.editor.ui.view.body._parentElement;

    if (bodyContainer && bodyContainer.classList.contains("ck-reset_all")) {
      bodyContainer.classList.remove("ck-reset_all");
    }
  }
}
