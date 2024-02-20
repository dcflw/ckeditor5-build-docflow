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
export const ATTRIBUTE_SELECTED_TEXT = "selectedText";
export const COMMAND_INSERT_SMARTFIELD = "insertSmartfield";
export const COMMAND_DELETE_SMARTFIELD = "deleteSmartfield";
export const SMARTFIELD_REGEX = /({{ *[a-z][a-z0-9_ ]*}})/i;

/** @typedef {import("@ckeditor/ckeditor5-engine").Element} ModelElement */

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
      allowAttributes: [
        ATTRIBUTE_NAME,
        ATTRIBUTE_TYPE,
        ATTRIBUTE_SELECTED_TEXT,
      ],
    });
  }

  _defineConverters() {
    const conversion = this.editor.conversion;
    const editor = this.editor;

    // testing liquid vars
    conversion
      .for("upcast")
      .add((dispatcher) => {
        dispatcher.on("text", (evt, data, { schema, consumable, writer }) => {
          let position = data.modelCursor;

          // When node is already converted then do nothing.
          if (!consumable.test(data.viewItem)) {
            return;
          }

          if (!schema.checkChild(position, "$text")) {
            if (!isParagraphable(position, "$text", schema)) {
              return;
            }

            position = wrapInParagraph(position, writer);
          }

          consumable.consume(data.viewItem);

          // The following code is the difference from the original text upcast converter.
          let modelCursor = position;

          const isSmartfield = data.viewItem
            .getAncestors()
            .some(
              (a) => a.is("element") && a.hasClass("smartfield__react-wrapper"),
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
        });
      })
      .elementToElement({
        view: {
          name: "span",
          classes: ["smartfield"],
        },
        model: TYPE_SMARTFIELD,
      });

    function isParagraphable(position, nodeOrType, schema) {
      const context = schema.createContext(position);

      // When paragraph is allowed in this context...
      if (!schema.checkChild(context, "paragraph")) {
        return false;
      }

      // And a node would be allowed in this paragraph...
      if (!schema.checkChild(context.push("paragraph"), nodeOrType)) {
        return false;
      }

      return true;
    }

    function wrapInParagraph(position, writer) {
      const paragraph = writer.createElement("paragraph");

      writer.insert(paragraph, position);

      return writer.createPositionAt(paragraph, 0);
    }
    // ----

    conversion
      .for("editingDowncast")
      .elementToElement({
        model: TYPE_SMARTFIELD,
        view: (modelItem, { writer: viewWriter }) => {
          const widgetElement = createSmartfieldView(modelItem, viewWriter);

          // Enable widget handling on a placeholder element inside the editing view.
          // adding `hasSelectionHandle: true` fixes issues in Firefox
          return toWidget(widgetElement, viewWriter, {
            hasSelectionHandle: true,
          });
        },
      })
      .add((dispatcher) =>
        dispatcher.on("attribute:smartfield", convertTextToSmartfield),
      );

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
     */
    function createSmartfieldView(modelItem, viewWriter) {
      const name = modelItem.getAttribute(ATTRIBUTE_NAME);
      const type = modelItem.getAttribute(ATTRIBUTE_TYPE);
      const selectedText = modelItem.getAttribute(ATTRIBUTE_SELECTED_TEXT);
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
              selectedText,
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

    function convertTextToSmartfield(evt, data, conversionApi) {
      if (data.item && data.item.is("$textProxy")) {
        const modelElement = data.item;
        conversionApi.consumable.consume(modelElement, "attribute");

        // Mark element as consumed by conversion.
        conversionApi.consumable.consume(modelElement, evt.name);

        editor.model.enqueueChange((writer) => {
          const name = modelElement.data
            .trim()
            .replace(/ /g, "_")
            .toLowerCase();
          const node = writer.createElement(TYPE_SMARTFIELD, { name });
          writer.model.insertObject(node);
          writer.setSelectionFocus(node, "after");

          writer.remove(modelElement);
        });
      }
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

          writer.setAttribute("smartfield", true, range);

          // After applying attribute to the text, remove given attribute from the selection.
          // This way user is able to type a text without attribute used by auto formatter.
          writer.removeSelectionAttribute("smartfield");
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
