import { Plugin } from "@ckeditor/ckeditor5-core";
import { viewToModelPositionOutsideModelElement } from "@ckeditor/ckeditor5-widget";
import DocfieldCommentsInsertCommand from "./docfield-comments-insert-command";
import DocfieldCommentsInsertExistingCommand from "./docfield-comments-insert-existing-command";
import DocfieldCommentsSetIdCommand from "./docfield-comments-setid-command";
import DocfieldCommentsRemoveCommand from "./docfield-comments-remove-command";
import DocfieldCommentsSelectCommand from "./docfield-comments-select-comment";
import {
  ID_ATTRIBUTE,
  RESOLVED_ATTRIBUTE,
  PARENT_ATTRIBUTE,
  VIEW_NAME,
  MARKER_NAME,
  MODEL_NAME,
  GROUP_NAME,
  TYPE_ATTRIBUTE,
} from "./constants";
import { getDataFromMarkerName } from "./helper";

export default class DocfieldCommentsEditing extends Plugin {
  init() {
    this.defineSchemes();
    this.defineConverters();

    this.editor.commands.add(
      "insertComment",
      new DocfieldCommentsInsertCommand(this.editor),
    );

    this.editor.commands.add(
      "insertExistingComment",
      new DocfieldCommentsInsertExistingCommand(this.editor),
    );

    this.editor.commands.add(
      "setCommentId",
      new DocfieldCommentsSetIdCommand(this.editor),
    );

    this.editor.commands.add(
      "removeComment",
      new DocfieldCommentsRemoveCommand(this.editor),
    );

    this.editor.commands.add(
      "selectComment",
      new DocfieldCommentsSelectCommand(this.editor),
    );

    this.editor.editing.mapper.on(
      "viewToModelPosition",
      viewToModelPositionOutsideModelElement(
        this.editor.model,
        (viewElement) => {
          return viewElement.hasAttribute(ID_ATTRIBUTE);
        },
      ),
    );
  }

  defineSchemes() {
    const schema = this.editor.model.schema;

    schema.extend("$text", {
      allowAttributes: [ID_ATTRIBUTE],
    });
  }

  defineConverters() {
    const editor = this.editor;
    const conversion = editor.conversion;

    conversion.for("upcast").dataToMarker({
      view: VIEW_NAME,
      model: (name) => {
        return `${MARKER_NAME}:${name}`;
      },
      converterPriority: "high",
    });

    let classNamesCache = [];

    conversion.for("editingDowncast").markerToHighlight({
      model: MODEL_NAME,
      converterPriority: "high",
      view: (data) => {
        if (data && data.item && data.item.name === "smartfield") {
          return;
        }

        const { commentId, resolved, parentId, type } = getDataFromMarkerName(
          data.markerName,
        );
        const elements = Array.from(
          editor.editing.mapper.markerNameToElements(data.markerName) || [],
        );

        // Find current comment in the list of comments
        // Take the class names from the comment
        // Filter out the comment class name
        // Filter out duplicates
        // Add the comment class name to cache. The reason is that when user pres a button this function triggers couple of times
        // And we need to keep the class names from the previous state

        const classNames =
          elements && elements.length
            ? elements
                .flatMap((element) => {
                  const classAttribute = element.getAttribute("class") || "";
                  return classAttribute.split(" ");
                })
                .filter(Boolean)
                .filter((name) => name !== "comment")
                .reduce((acc, item) => {
                  // remove duplicates
                  const prevItems = acc.filter((prevItem) => prevItem !== item);

                  return [...prevItems, item];
                }, [])
            : classNamesCache;

        classNamesCache = classNames;

        return {
          attributes: {
            [ID_ATTRIBUTE]: commentId,
            [RESOLVED_ATTRIBUTE]: resolved,
            [PARENT_ATTRIBUTE]: parentId,
            [TYPE_ATTRIBUTE]: type,
          },
          classes: ["comment", ...classNames],
        };
      },
    });

    conversion.for("dataDowncast").markerToData({
      model: MODEL_NAME,
      view: (markerName) => {
        return {
          group: GROUP_NAME,
          name: markerName.substr(8),
        };
      },
      converterPriority: "high",
    });
  }
}
