import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { viewToModelPositionOutsideModelElement } from "@ckeditor/ckeditor5-widget/src/utils";
import DocflowCommentsInsertCommand from "./docflow-comments-insert-command";
import DocflowCommentsSetIdCommand from "./docflow-comments-setid-command";
import DocflowCommentsRemoveCommand from "./docflow-comments-remove-command";
import cuid from "cuid";

export default class DocflowCommentsEditing extends Plugin {
  init() {
    this.defineSchemes();
    this.defineConverters();

    this.editor.commands.add(
      "insertComment",
      new DocflowCommentsInsertCommand(this.editor),
    );

    this.editor.commands.add(
      "setCommentId",
      new DocflowCommentsSetIdCommand(this.editor),
    );

    this.editor.commands.add(
      "removeComment",
      new DocflowCommentsRemoveCommand(this.editor),
    );

    this.editor.editing.mapper.on(
      "viewToModelPosition",
      viewToModelPositionOutsideModelElement(this.editor.model, viewElement =>
        viewElement.hasAttribute("data-comment-id"),
      ),
    );
  }

  defineSchemes() {
    const schema = this.editor.model.schema;

    // schema.extend("$block", {
    //   allowAttributes: ["id"],
    // });

    // schema.extend("tableCell", {
    //   allowAttributes: ["id"],
    // });

    schema.extend("$text", {
      allowAttributes: ["data-comment-id", "data-comment-is-active", "data-comment-parent-id"],
    });
  }

  defineConverters() {
    const conversion = this.editor.conversion;

    // conversion.for("upcast").attributeToAttribute({
    //   view: "id",
    //   model: {
    //     key: "id",
    //     value: viewElement => viewElement.getAttribute("id"),
    //   },
    // });

    conversion
      .for("upcast")
      .elementToAttribute({
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
      })
      .elementToAttribute({
        view: {
          name: "span",
          attributes: ["data-comment-is-active"],
        },
        model: {
          key: "data-comment-is-active",
          value: viewElement => {
            return viewElement.getAttribute("data-comment-is-active");
          },
        },
      })
      .elementToAttribute({
        view: {
          name: "span",
          attributes: ["data-comment-parent-id"],
        },
        model: {
          key: "data-comment-parent-id",
          value: viewElement => {
            return viewElement.getAttribute("data-comment-parent-id");
          },
        },
      });

    // conversion.for("downcast").attributeToElement({
    //   model: "id",
    //   view: (data, conversionApi) => {
    //     const { writer, mapper } = conversionApi;
    //     const item = data.item;
    //     const parent = item.parent;
    //     const prevSibling = item.previousSibling;
    //     const viewElement = mapper.toViewElement(item);

    //     console.log("item", item);
    //   },
    // });

    // conversion.for("downcast").add(dispatcher => {
    //   dispatcher.on("insert:tableRow", (evt, data, conversionApi) => {
    //     const tableRow = data.item;
    //     this.insertIdAttributeToTableCell(
    //       tableRow,
    //       conversionApi.writer,
    //       conversionApi.mapper,
    //     );
    //   });

    //   dispatcher.on("insert:table", (evt, data, conversionApi) => {
    //     const table = data.item;
    //     const tableRows = Array.from(table.getChildren());
    //     tableRows.forEach(tableRow => {
    //       this.insertIdAttributeToTableCell(
    //         tableRow,
    //         conversionApi.writer,
    //         conversionApi.mapper,
    //       );
    //     });
    //   });
    //   dispatcher.on("insert:paragraph", this.insertIdAttribute);
    //   dispatcher.on("insert:listItem", this.insertIdAttribute);
    //   dispatcher.on("insert:imageInline", this.insertIdAttribute);
    // });

    // conversion.for("downcast").add(dispatcher => {
    //   dispatcher.on("insert:paragraph", (evt, data, { writer }) => {
    //     if (data.item.is("model:element")) {
    //       const item =
    //         data?.item?.parent?.name === "tableCell"
    //           ? data.item.parent
    //           : data.item;

    //       const id = item.getAttribute("id");
    //       const prevSibling = item.previousSibling;
    //       const nextSibling = item.nextSibling;

    //       if (
    //         !id ||
    //         prevSibling?.getAttribute("id") === id ||
    //         nextSibling?.getAttribute("id") === id
    //       ) {
    //         console.log("SET ATTRIBUTE");
    //         writer.setAttribute(
    //           "id",
    //           DocflowCommentsEditing.generateUniqueId(),
    //           item,
    //         );
    //       }
    //     }
    //   });
    // });

    // conversion.for("downcast").attributeToAttribute({
    //   model: {
    //     key: "id",
    //   },
    //   view: modelAttributeValue => {
    //     return {
    //       key: "id",
    //       value: modelAttributeValue,
    //     };
    //   },
    // });

    conversion
      .for("downcast")
      .attributeToElement({
        model: {
          key: "data-comment-id",
          name: "$text",
        },
        view: (modelAttributeValue, conversionApi) => {
          const viewWriter = conversionApi.writer;
          return viewWriter.createAttributeElement("span", {
            "data-comment-id": modelAttributeValue,
          });
        },
      })
      .attributeToElement({
        model: {
          key: "data-comment-is-active",
          name: "$text",
        },
        view: (modelAttributeValue, conversionApi) => {
          const viewWriter = conversionApi.writer;
          return viewWriter.createAttributeElement("span", {
            "data-comment-is-active": modelAttributeValue,
          });
        },
      })
      .attributeToElement({
        model: {
          key: "data-comment-parent-id",
          name: "$text",
        },
        view: (modelAttributeValue, conversionApi) => {
          const viewWriter = conversionApi.writer;
          return viewWriter.createAttributeElement("span", {
            "data-comment-parent-id": modelAttributeValue,
          });
        },
      });
  }

  static generateUniqueId() {
    return cuid.slug();
  }
}
