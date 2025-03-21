import { Plugin } from "@ckeditor/ckeditor5-core";
import {
  ButtonView,
  ContextualBalloon,
  ViewModel,
  addListToDropdown,
  createDropdown,
} from "@ckeditor/ckeditor5-ui";
import { Collection } from "@ckeditor/ckeditor5-utils";
import { customAlphabet } from "nanoid";

import {
  COMMAND_INSERT_SMARTFIELD,
  SMARTFIELD_REGEX,
} from "./docfield-smartfield-editing";
import boltMedium from "./theme/icons/boltMedium.svg";
import linkIcon from "./theme/icons/link-icon.svg";

const TYPE = {
  InternalLink: "SmartField::InternalLink",
  String: "SmartField::String",
};
export const slug = customAlphabet("1234567890abcdef", 10);

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
        icon: boltMedium,
        tooltip: true,
      });

      this.listenTo(button, "execute", () => this.insertNewSmartfield());

      return button;
    });
  }

  addLinkToolbarButton() {
    this.editor.ui.componentFactory.add("insertSmartfieldLink", (locale) => {
      if (this.editor.plugins.has("Link")) {
        const dropdownView = createDropdown(locale);

        dropdownView.buttonView.set({
          label: "Link",
          icon: linkIcon,
          tooltip: true,
        });

        const items = new Collection();

        items.add({
          type: "button",
          model: new ViewModel({
            id: "internal-link",
            withText: true,
            label: "Internal Link",
          }),
        });
        items.add({
          type: "button",
          model: new ViewModel({
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
      } else {
        const button = new ButtonView(locale);

        button.set({
          label: "Internal Link",
          icon: linkIcon,
          tooltip: true,
        });

        this.listenTo(button, "execute", () =>
          this.insertNewSmartfield(TYPE.InternalLink),
        );

        return button;
      }
    });
  }

  insertNewSmartfield(type) {
    const config = this.editor.config.get("docfieldSmartfield");
    const selectedText = this.getSelectedText().trim();
    const isValidSmartfieldName = SMARTFIELD_REGEX.test(`{{${selectedText}}}`);

    if (type !== TYPE.InternalLink && selectedText && !isValidSmartfieldName) {
      if (config.onInvalidSmartfieldName) {
        config.onInvalidSmartfieldName(selectedText);
      }
      return;
    }

    const name =
      type !== TYPE.InternalLink
        ? selectedText.trim().replace(/ /g, "_").toLowerCase()
        : `il_${slug()}`;

    this.editor.execute(COMMAND_INSERT_SMARTFIELD, {
      name,
      type,
      selectedText,
    });
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
