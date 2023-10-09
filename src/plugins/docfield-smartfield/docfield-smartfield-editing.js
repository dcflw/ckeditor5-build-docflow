import { Plugin } from "@ckeditor/ckeditor5-core";
import {
  toWidget,
  viewToModelPositionOutsideModelElement,
  Widget,
} from "@ckeditor/ckeditor5-widget";
import inlineAutoformatEditing from "@ckeditor/ckeditor5-autoformat/src/inlineautoformatediting";
import DocfieldInsertSmartfieldCommand from "./docfield-insert-smartfield-command";
import DocfieldDeleteSmartfieldCommand from "./docfield-delete-smartfield-command";

export const TYPE_SMARTFIELD = "smartfield";
export const ATTRIBUTE_NAME = "name";
export const ATTRIBUTE_TYPE = "type";
export const COMMAND_INSERT_SMARTFIELD = "insertSmartfield";
export const COMMAND_DELETE_SMARTFIELD = "deleteSmartfield";
export const SMARTFIELD_REGEX = /({{ *[a-z][a-z0-9_ ]*}})/i;

/** @typedef {import("@ckeditor/ckeditor5-engine").Element} ModelElement */
/** @typedef {import("@ckeditor/ckeditor5-engine").DowncastWriter} DowncastWriter */
/** @typedef {import("@ckeditor/ckeditor5-engine").ViewElement} ViewElement */
/** @typedef {import("@ckeditor/ckeditor5-engine").ViewText} ViewText */
/** @typedef {import("@ckeditor/ckeditor5-engine").UpcastConversionData<ViewText>} UpcastConversionData_ViewText */
/** @typedef {import("@ckeditor/ckeditor5-engine").UpcastConversionApi} UpcastConversionApi */

export default class DocfieldSmartfieldEditing extends Plugin {
  static get requires() {
    return [Widget];
  }

  init() {
    const config = this.editor.config.get("docfieldSmartfield");

    if (!config || config.enabled === false || !config.renderSmartfield) {
      return;
    }

    this._defineSchema();
    this._defineConverters();
    this._addAutoFormat();

    this.editor.commands.add(
      COMMAND_INSERT_SMARTFIELD,
      new DocfieldInsertSmartfieldCommand(this.editor),
    );

    this.editor.commands.add(
      COMMAND_DELETE_SMARTFIELD,
      new DocfieldDeleteSmartfieldCommand(this.editor),
    );

    this.editor.editing.mapper.on(
      "viewToModelPosition",
      viewToModelPositionOutsideModelElement(this.editor.model, (viewElement) =>
        viewElement.hasClass("smartfield"),
      ),
    );
  }

  _defineSchema() {
    const schema = this.editor.model.schema;

    schema.register(TYPE_SMARTFIELD, {
      allowIn: "tableCell",
      allowWhere: "$text",
      isInline: true,
      isObject: true,
      allowAttributesOf: "$text",
      allowAttributes: [ATTRIBUTE_NAME, ATTRIBUTE_TYPE],
    });
  }

  _defineConverters() {
    const conversion = this.editor.conversion;
    const editor = this.editor;

    conversion
      .for("upcast")
      .add((dispatcher) => {
        dispatcher.on(
          "text",
          /**
           * @param {any} _evt
           * @param {UpcastConversionData_ViewText} data
           * @param {UpcastConversionApi} conversionApi
           */
          (_evt, data, { consumable, writer }) => {
            const position = data.modelCursor;

            // When node is already converted then do nothing.
            if (!consumable.test(data.viewItem)) {
              return;
            }

            consumable.consume(data.viewItem);

            // The following code is the difference from the original text upcast converter.
            let modelCursor = position;

            const isSmartfield = data.viewItem
              .getAncestors()
              .some(
                (a) =>
                  a.is("element") && a.hasClass("smartfield__react-wrapper"),
              );

            for (const part of data.viewItem.data.split(SMARTFIELD_REGEX)) {
              const node =
                SMARTFIELD_REGEX.test(part) || isSmartfield
                  ? writer.createElement(TYPE_SMARTFIELD, {
                      name: part.slice(2, -2),
                    })
                  : writer.createText(part);

              writer.insert(node, modelCursor);

              if (node.offsetSize !== undefined) {
                modelCursor = modelCursor.getShiftedBy(node.offsetSize);
              }
            }

            data.modelRange = writer.createRange(position, modelCursor);
            data.modelCursor = data.modelRange.end;
          },
        );
      })
      .elementToElement({
        view: {
          name: "span",
          classes: ["smartfield"],
        },
        model: TYPE_SMARTFIELD,
      });

    conversion.for("editingDowncast").elementToElement({
      model: TYPE_SMARTFIELD,
      view: (modelItem, { writer: viewWriter }) => {
        const widgetElement = createSmartfieldView(modelItem, viewWriter);

        // Enable widget handling on a placeholder element inside the editing view.
        // adding `hasSelectionHandle: true` fixes issues in Firefox
        return toWidget(widgetElement, viewWriter, {
          hasSelectionHandle: true,
        });
      },
    });

    conversion.for("dataDowncast").elementToElement({
      model: TYPE_SMARTFIELD,
      view: (element, { writer }) =>
        writer.createUIElement("span", null, (domDocument) => {
          const name = element.getAttribute("name");
          return domDocument.createTextNode(`{{${name}}}`);
        }),
    });

    conversion.for("upcast").dataToMarker({
      view: "smartfield",
      model: (name) => `smartfield:${name}`,
      converterPriority: "high",
    });

    /**
     * @param {ModelElement} modelItem
     * @param {DowncastWriter} viewWriter
     * @returns {ViewElement | null}
     */
    function createSmartfieldView(modelItem, viewWriter) {
      const name = modelItem.getAttribute("name");
      const type = modelItem.getAttribute("type");
      const config = editor.config.get("docfieldSmartfield");

      const smartfieldView = viewWriter.createContainerElement("span", {
        class: "smartfield",
      });

      const reactWrapper = viewWriter.createRawElement(
        "span",
        {
          class: "smartfield__react-wrapper",
        },
        function (domElement) {
          // This the place where React renders the actual smartfield hosted
          // by a UIElement in the view. You are using a function (renderer) passed as
          // editor.config.docfieldSmartfield#renderSmartfield.
          config.renderSmartfield(
            {
              name,
              type,
              changeSmartfieldName: (name, type) => {
                editor.execute(COMMAND_INSERT_SMARTFIELD, { name, type });
              },
              removeSmartfield: () => {
                editor.execute(COMMAND_DELETE_SMARTFIELD, { modelItem });
              },
            },
            domElement,
          );
        },
      );

      viewWriter.insert(
        viewWriter.createPositionAt(smartfieldView, 0),
        reactWrapper,
      );

      return smartfieldView;
    }
  }

  _addAutoFormat() {
    const config = this.editor.config.get("docfieldSmartfield");

    inlineAutoformatEditing(
      this.editor,
      this,
      /(?:^|\s)({{)([^*]+)(}})$/g,
      (writer, rangesToFormat) => {
        for (const range of rangesToFormat) {
          const name = this._getTextFromRange(range);
          if (!SMARTFIELD_REGEX.test(`{{${name}}}`)) {
            if (config.onInvalidSmartfieldName) {
              config.onInvalidSmartfieldName(name);
            }
            return false;
          }

          // The following code requires reading the source code of `inlineAutoformatEditing` to understand. Sorry.

          // `range` only covers the smart field name, expand it to include {{}}
          const fullSmartfieldRange = writer.createRange(
            range.start.getShiftedBy(-2),
            range.end.getShiftedBy(2),
          );
          writer.setSelection(fullSmartfieldRange);
          const smartfield = writer.createElement(TYPE_SMARTFIELD, {
            name: name.trim().replace(/ /g, "_"),
          });
          writer.model.insertObject(smartfield);
          writer.setSelection(smartfield, "after");

          // This piece of code is the only bit of logic that we want to opt into
          //   (see comment below), so it's copy-pasted here from the source of `inlineAutoformatEditing`.
          this.editor.model.enqueueChange(() => {
            const deletePlugin = this.editor.plugins.get("Delete");

            deletePlugin.requestUndoOnBackspace();
          });

          // Even though this range was processed, we return `false` to opt out
          //   of `inlineAutoformatEditing`'s own processing, which includes removing the `{{}}`,
          //   because we've already done this ourselves.
          return false;
        }
      },
    );
  }

  _getTextFromRange(range) {
    const results = [];

    for (const item of range.getItems()) {
      if (item.is("textProxy")) {
        results.push(item.data);
      }
    }

    return results.join(" ").trim();
  }
}
