import Command from "@ckeditor/ckeditor5-core/src/command";
import { ATTRIBUTE_NAME, COMMENT_MARKER_NAME } from "./constants";
import cuid from "cuid";

export default class DocflowCommentsInsertCommand extends Command {
  execute({ id }) {
    const model = this.editor.model;
    const selection = model.document.selection;

    model.change(writer => {
      if (!selection.isCollapsed) {
        const ranges = model.schema.getValidRanges(
          selection.getRanges(),
          ATTRIBUTE_NAME,
        );

        for (const range of ranges) {
          writer.addMarker(`${COMMENT_MARKER_NAME}:${id}:${cuid()}`, {
            range,
            usingOperation: false,
          });
        }
      }
    });
  }
}
