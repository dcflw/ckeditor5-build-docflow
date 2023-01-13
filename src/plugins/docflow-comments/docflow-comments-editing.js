import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { viewToModelPositionOutsideModelElement } from "@ckeditor/ckeditor5-widget/src/utils";
import DocflowCommentsInsertCommand from "./docflow-comments-insert-command";
import DocflowCommentsSetIdCommand from "./docflow-comments-setid-command";
import DocflowCommentsRemoveCommand from "./docflow-comments-remove-command";
import DocflowCommentsSelectCommand from "./docflow-comments-select-command";
import DocflowCommentsUnselectCommand from "./docflow-comments-unselect-command";
import { ATTRIBUTE_NAME } from "./constants";

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

    this.editor.commands.add(
      "selectComment",
      new DocflowCommentsSelectCommand(this.editor),
    )

    this.editor.commands.add(
      "unselectComment",
      new DocflowCommentsUnselectCommand(this.editor),
    )

    this.editor.editing.mapper.on(
      "viewToModelPosition",
      viewToModelPositionOutsideModelElement(this.editor.model, viewElement =>
        viewElement.hasAttribute(ATTRIBUTE_NAME),
      ),
    );
  }

  defineSchemes() {
    const schema = this.editor.model.schema;

    schema.extend("$text", {
      allowAttributes: [ATTRIBUTE_NAME, "data-selected"],
    });
  }

  defineConverters() {
    const conversion = this.editor.conversion;

    conversion.for("upcast").dataToMarker({
      view: "comment",
      model: (name, conversionApi) => "comment:" + name,
      converterPriority: "high",
    });

    conversion.for("editingDowncast").markerToHighlight({
      model: "comment",
      view: data => {
        const [, commentId, leafId, selected] = data.markerName.split(":");

        const attributes = { [ATTRIBUTE_NAME]: commentId };

        if (selected === "selected") {
          attributes["data-selected"] = "selected";
        }

        return {
          attributes,
        };
      },
      converterPriority: "high",
    });

    conversion.for("dataDowncast").markerToData({
      model: "comment",
      view: markerName => {
        return {
          group: "comment",
          name: markerName.substr(8), // Removes 'comment:' part.
        };
      },
      converterPriority: "high",
    });

    this.editor.editing.view.document.on( 'click', (info, data) => {
      const { target } = data;
      const attributeKeys = Array.from(target.getAttributeKeys());

      if (attributeKeys.includes("data-comment-id")) {
        const commentId = target.getAttribute("data-comment-id")?.split(":")[0];
        
        const customEvent = new CustomEvent('commentClick', {
          detail: commentId
        });

        document.dispatchEvent(customEvent);
      };
    });
  }
}
