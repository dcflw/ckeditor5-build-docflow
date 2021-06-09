import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import clickOutsideHandler from "@ckeditor/ckeditor5-ui/src/bindings/clickoutsidehandler";
import Model from '@ckeditor/ckeditor5-ui/src/model';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import { addListToDropdown, createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import ContextualBalloon from "@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon";

import ReactView from "../../views/react-view";

import linkIcon from "./theme/icons/link-icon.svg";

import { CONFIG_NAMESPACE, CUSTOM_PROPERTY_ID, CUSTOM_PROPERTY_REFERENCE, TYPE_INTERNAL_LINK } from "./docflow-link-editing"
import { COMMAND_INTERNAL_LINK } from "./docflow-link-command";

export default class DocflowLinkUI extends Plugin {
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
        onInsertInternalLink: this.handleInsertInternalLink.bind(this),
      });

      this.addToolbarButton();
      this.enableUserBalloonInteractions();
    }

  }

  addToolbarButton() {
    this.editor.ui.componentFactory.add("docflowLink", locale => {
      const dropdownView = createDropdown(locale);

      dropdownView.buttonView.set({
        label: "Link",
        icon: linkIcon,
        tooltip: true,
      });

      const labels = this.editor.config.get(
        `${CONFIG_NAMESPACE}.labels`,
      );

      const items = new Collection();

      items.add({
        type: 'button',
        model: new Model({
          id: 'internal-link',
          withText: true,
          label: labels['internal_link']
        })
      });
      items.add({
        type: 'button',
        model: new Model({
          id: 'external-link',
          withText: true,
          label: labels['external_link']
        })
      });

      addListToDropdown(dropdownView, items);

      this.listenTo(dropdownView, 'execute', evt => {
        const { id } = evt.source;
        if (id === 'internal-link') {
          this.showBalloon();
        } else if (id === 'external-link') {
          const externalLinkPlugin = this.editor.plugins.get("LinkUI");
          externalLinkPlugin._showUI(true);
        }
      });

      return dropdownView;
    });
  }

  enableUserBalloonInteractions() {
    const hideBalloonIfNotSelected = () => {
      if (this.isBalloonVisible() && !this.getSelectedInternalLinkElement()) {
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
      const element = this.getSelectedInternalLinkElement();

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

  handleInsertInternalLink(id, reference, name) {
    this.editor.execute(COMMAND_INTERNAL_LINK, { id, reference, name });
  }

  showBalloon(element) {
    let props = {
      selectedId: undefined,
      selectedReference: undefined,
    };

    if (element) {
      const type = element.getCustomProperty("type");

      if (type === TYPE_INTERNAL_LINK) {
        props.selectedId = element.getCustomProperty(
          CUSTOM_PROPERTY_ID,
        );
        props.selectedReference = element.getCustomProperty(
          CUSTOM_PROPERTY_REFERENCE,
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

  getSelectedInternalLinkElement() {
    const view = this.editor.editing.view;
    const selection = view.document.selection;
    const selectedElement = selection.getSelectedElement();

    if (selectedElement) {
      const type = selectedElement.getCustomProperty("type");

      if (type === TYPE_INTERNAL_LINK) {
        return selectedElement;
      }
    }

    return null;
  }

  getBalloonPositionData() {
    const view = this.editor.editing.view;
    const viewDocument = view.document;
    const target = view.domConverter.viewRangeToDom(
      viewDocument.selection.getFirstRange(),
    );

    return { target };
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