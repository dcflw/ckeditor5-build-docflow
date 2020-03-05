import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import {
  toWidget,
  viewToModelPositionOutsideModelElement,
} from "@ckeditor/ckeditor5-widget/src/utils";
import Widget from "@ckeditor/ckeditor5-widget/src/widget";

import DocflowPlaceholderCommand, {
  COMMAND_PLACEHOLDER,
} from "./docflow-placeholder-command";
import DocflowVariableCommand, {
  COMMAND_VARIABLE,
} from "./docflow-variable-command";
import "./theme/docflow-placeholder.css";

export const ATTRIBUTE_ID = "id";
export const ATTRIBUTE_NAME = "name";
export const CONFIG_NAMESPACE = "docflowPlaceholder";
export const CUSTOM_PROPERTY_ID = "id";
export const CUSTOM_PROPERTY_NAME = "name";
export const CUSTOM_PROPERTY_TYPE = "type";
export const TYPE_PLACEHOLDER = "placeholder";
export const TYPE_VARIABLE = "variable";

export default class DocflowPlaceholderEditing extends Plugin {
  static get requires() {
    return [Widget];
  }

  init() {
    this.defineSchema();
    this.defineConverters();

    this.editor.commands.add(
      COMMAND_PLACEHOLDER,
      new DocflowPlaceholderCommand(this.editor),
    );
    this.editor.commands.add(
      COMMAND_VARIABLE,
      new DocflowVariableCommand(this.editor),
    );

    this.editor.editing.mapper.on(
      "viewToModelPosition",
      viewToModelPositionOutsideModelElement(this.editor.model, viewElement =>
        viewElement.hasClass(TYPE_PLACEHOLDER),
      ),
    );
    this.editor.config.define(CONFIG_NAMESPACE, {
      formComponent: undefined,
      formComponentProps: {},
      variableLabels: {},
    });
  }

  defineSchema() {
    const schema = this.editor.model.schema;

    schema.register(TYPE_PLACEHOLDER, {
      allowIn: "tableCell",
      allowWhere: "$text",
      isInline: true,
      isObject: true,
      allowAttributes: [ATTRIBUTE_ID, ATTRIBUTE_NAME],
    });
    schema.register(TYPE_VARIABLE, {
      allowIn: "tableCell",
      allowWhere: "$text",
      isInline: true,
      isObject: true,
      allowAttributes: [ATTRIBUTE_NAME],
    });
  }

  defineConverters() {
    const conversion = this.editor.conversion;

    // view-to-model converter
    conversion
      .for("upcast")
      .elementToElement({
        view: {
          name: "span",
          attributes: {
            "data-redactor-type": TYPE_PLACEHOLDER,
          },
        },
        model: (viewElement, modelWriter) => {
          const name = viewElement.getChild(0).data;
          const id = viewElement.getAttribute("data-uuid");

          console.log("view-to-model converter", name);

          return modelWriter.createElement(TYPE_PLACEHOLDER, { name, id });
        },
      })
      .elementToElement({
        view: {
          name: "span",
          attributes: {
            "data-redactor-type": TYPE_VARIABLE,
          },
        },
        model: (viewElement, modelWriter) => {
          const name = viewElement.getChild(0).data;

          return modelWriter.createElement(TYPE_VARIABLE, { name });
        },
      });

    // model-to-view converter (editor)
    conversion
      .for("editingDowncast")
      .elementToElement({
        model: TYPE_PLACEHOLDER,
        view: (modelItem, viewWriter) => {
          const widgetElement = this.createViewPlaceholder(
            modelItem,
            viewWriter,
            true,
          );

          return toWidget(widgetElement, viewWriter);
        },
      })
      .elementToElement({
        model: TYPE_VARIABLE,
        view: (modelItem, viewWriter) => {
          const widgetElement = this.createViewVariable(
            modelItem,
            viewWriter,
            true,
          );

          return toWidget(widgetElement, viewWriter);
        },
      });

    // model-to-view converter (data)
    conversion
      .for("dataDowncast")
      .elementToElement({
        model: TYPE_PLACEHOLDER,
        view: this.createViewPlaceholder,
      })
      .elementToElement({
        model: TYPE_VARIABLE,
        view: this.createViewVariable,
      });
  }

  createViewPlaceholder(modelItem, viewWriter, editorView = false) {
    const name = modelItem.getAttribute("name");
    const id = modelItem.getAttribute("id");
    const attributes = {
      "data-redactor-type": TYPE_PLACEHOLDER,
      "data-uuid": id,
    };

    if (editorView) {
      attributes["class"] = "placeholder";
    }

    console.log("createViewPlaceholder", name);

    const view = viewWriter.createContainerElement("span", attributes);
    const innerText = viewWriter.createText(name);

    viewWriter.insert(viewWriter.createPositionAt(view, 0), innerText);
    viewWriter.setCustomProperty(CUSTOM_PROPERTY_TYPE, TYPE_PLACEHOLDER, view);
    viewWriter.setCustomProperty(CUSTOM_PROPERTY_NAME, name, view);
    viewWriter.setCustomProperty(CUSTOM_PROPERTY_ID, id, view);

    return view;
  }

  createViewVariable(modelItem, viewWriter, editorView = false) {
    const name = modelItem.getAttribute("name");
    const attributes = {
      "data-redactor-type": TYPE_VARIABLE,
    };
    let variableLabel = name;

    if (editorView) {
      const variableLabels = this.editor.config.get(
        `${CONFIG_NAMESPACE}.variableLabels`,
      );

      if (variableLabels[name]) {
        variableLabel = variableLabels[name];
      }

      attributes["class"] = "placeholder";
    }

    const view = viewWriter.createContainerElement("span", attributes);
    const innerText = viewWriter.createText(variableLabel);

    viewWriter.insert(viewWriter.createPositionAt(view, 0), innerText);
    viewWriter.setCustomProperty(CUSTOM_PROPERTY_TYPE, TYPE_VARIABLE, view);
    viewWriter.setCustomProperty(CUSTOM_PROPERTY_NAME, name, view);

    return view;
  }
}
