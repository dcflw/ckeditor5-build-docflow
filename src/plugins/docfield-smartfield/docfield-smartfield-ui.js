import { Plugin } from "@ckeditor/ckeditor5-core";
import {
  ButtonView,
  ContextualBalloon,
  Model,
  addListToDropdown,
  createDropdown,
} from "@ckeditor/ckeditor5-ui";
import { Collection } from "@ckeditor/ckeditor5-utils";
import {
  COMMAND_INSERT_SMARTFIELD,
  SMARTFIELD_REGEX,
} from "./docfield-smartfield-editing";
import smartFieldRegular from "./theme/icons/smartFieldRegular.svg";
import linkIcon from "./theme/icons/link-icon.svg";

const TYPE = {
  InternalLink: "SmartField::InternalLink",
  String: "SmartField::String",
};

export default class DocfieldSmartfieldUI extends Plugin {
  static get requires() {
    return [ContextualBalloon];
  }

  init() {
    const editor = this.editor;

    const config = editor.config.get("docfieldSmartfield");

    if (config && config.enabled) {
      this.addSmartfieldToolbarButton();
      this.addLinkToolbarButton();
    }
  }

  addSmartfieldToolbarButton() {
    this.editor.ui.componentFactory.add("insertSmartfield", (locale) => {
      const button = new ButtonView(locale);

      button.set({
        label: "Smart field",
        icon: smartFieldRegular,
        tooltip: true,
      });

      this.listenTo(button, "execute", () => this.insertNewSmartfield());

      return button;
    });
  }

  addLinkToolbarButton() {
    this.editor.ui.componentFactory.add("insertSmartfieldLink", (locale) => {
      const dropdownView = createDropdown(locale);

      dropdownView.buttonView.set({
        label: "Link",
        icon: linkIcon,
        tooltip: true,
      });

      const items = new Collection();

      items.add({
        type: "button",
        model: new Model({
          id: "internal-link",
          withText: true,
          label: "Internal Link",
        }),
      });
      items.add({
        type: "button",
        model: new Model({
          id: "external-link",
          withText: true,
          label: "External Link",
        }),
      });

      addListToDropdown(dropdownView, items);

      this.listenTo(dropdownView, "execute", (evt) => {
        const { id } = evt.source;
        if (id === "internal-link") {
          this.insertNewSmartfield(TYPE.InternalLink);
        } else if (id === "external-link") {
          const externalLinkPlugin = this.editor.plugins.get("LinkUI");
          externalLinkPlugin._showUI(true);
        }
      });

      return dropdownView;
    });
  }

  insertNewSmartfield(type) {
    const config = this.editor.config.get("docfieldSmartfield");
    const selectedText = this.getSelectedText().trim();
    const isValidSmartfieldName = SMARTFIELD_REGEX.test(`{{${selectedText}}}`);

    if (selectedText && !isValidSmartfieldName) {
      if (config.onInvalidSmartfieldName) {
        config.onInvalidSmartfieldName(selectedText);
      }
      return;
    }

    const name = selectedText.trim().replace(/ /g, "_");

    this.editor.execute(COMMAND_INSERT_SMARTFIELD, { name, type });
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
}
