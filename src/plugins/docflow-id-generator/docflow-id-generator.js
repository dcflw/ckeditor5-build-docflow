import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { viewToModelPositionOutsideModelElement } from "@ckeditor/ckeditor5-widget/src/utils";
import cuid from "cuid";

export default class DocflowIdGenerator extends Plugin {
  static get pluginName() {
    return "DocflowIdGenerator";
  }

  init() {
    this.defineSchemes();
    this.defineConverters();

    this.editor.editing.mapper.on(
      "viewToModelPosition",
      viewToModelPositionOutsideModelElement(this.editor.model, viewElement =>
        viewElement.hasAttribute("data-comment-id"),
      ),
    );
  }

  defineSchemes() {
    const schema = this.editor.model.schema;
    schema.extend("$block", {
      allowAttributes: ["id"],
    });
    schema.extend("tableCell", {
      allowAttributes: ["id"],
    });

    schema.extend("$text", {
      allowAttributes: [
        "comment",
        "data-comment-id",
        "data-comment-node-index",
        "data-leaf-id",
      ],
    });
  }

  defineConverters() {
    const conversion = this.editor.conversion;

    conversion.for("upcast").attributeToAttribute({
      view: "id",
      model: {
        key: "id",
        value: viewElement => viewElement.getAttribute("id"),
      },
    });

    conversion.for("upcast").elementToAttribute({
      view: {
        name: "span",
        attributes: ["data-comment-id"],
      },
      model: {
        key: "data-comment-id",
        value: viewElement => {
          return viewElement.getAttribute("data-comment-id");
        },
      },
    });

    conversion.for("downcast").add(dispatcher => {
      dispatcher.on("insert:tableRow", (evt, data, { writer, mapper }) => {
        const tableRow = data.item;
        const tableCells = Array.from(tableRow.getChildren());

        tableCells.forEach(tableCell => {
          writer.setAttribute(
            "id",
            DocflowIdGenerator.generateUniqueId(),
            tableCell,
          );
          writer.setAttribute(
            "id",
            DocflowIdGenerator.generateUniqueId(),
            mapper.toViewElement(tableCell),
          );
        });
      });

      dispatcher.on("insert:paragraph", this.insertIdAttribute);
      dispatcher.on("insert:listItem", this.insertIdAttribute);
      dispatcher.on("insert:imageInline", this.insertIdAttribute);
    });

    conversion.for("dataDowncast").attributeToAttribute({
      model: {
        name: "tableCell",
        key: "id",
      },
      view: modelAttributeValue => {
        return {
          key: "id",
          value: modelAttributeValue,
        };
      },
    });

    conversion.for("downcast").attributeToElement({
      model: {
        key: "data-comment-id",
        name: "$text",
      },
      view: (modelAttributeValue, { writer }) => {
        const viewWriter = conversionApi.writer;
        return viewWriter.createAttributeElement("span", {
          "data-comment-id": modelAttributeValue,
        });
      },
    });
  }

  insertIdAttribute(_, data, { writer, mapper }) {
    const item = data.item;
    const parent = item.parent;
    const prevSibling = item.previousSibling;
    const viewElement = mapper.toViewElement(item);

    let id = item.getAttribute("id");

    if (parent && parent.name === "tableCell") {
      return;
    }

    if ((prevSibling && prevSibling.getAttribute("id") === id) || !id) {
      id = DocflowIdGenerator.generateUniqueId();
      writer.setAttribute("id", id, item);
    }

    writer.setAttribute("id", id, viewElement);
  }

  static generateUniqueId() {
    return cuid.slug();
  }
}
