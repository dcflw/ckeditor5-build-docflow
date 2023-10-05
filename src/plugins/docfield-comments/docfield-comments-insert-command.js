import { AlwaysEnabledCommand } from "../AlwaysEnabledCommand";
import { ID_ATTRIBUTE } from "./constants";
import cuid from "cuid";
import { getMarkerName } from "./helper";

export default class DocfieldCommentsInsertCommand extends AlwaysEnabledCommand {
  execute({ id, parentId }) {
    const model = this.editor.model;
    const selection = model.document.selection;

    model.change((writer) => {
      if (!selection.isCollapsed) {
        const ranges = model.schema.getValidRanges(
          selection.getRanges(),
          ID_ATTRIBUTE,
        );

        for (let range of ranges) {
          const startNodeAfter = range.start && range.start.nodeAfter;
          const startNodeBofore = range.start && range.start.nodeBefore;
          const endNodeBefore = range.end && range.end.nodeBefore;
          const endNodeAfter = range.end && range.end.nodeAfter;

          // Hack for smartfields. If we have a smartfield in the beginning or in the end, we need to adjust the range.
          if (startNodeAfter && startNodeAfter.name === "smartfield") {
            range = writer.createRange(
              model.createPositionFromPath(range.root, [
                range.start.path[0],
                range.start.path[1] + 2,
              ]),
              model.createPositionFromPath(range.root, range.end.path),
            );
          } else if (startNodeBofore && startNodeBofore.name === "smartfield") {
            range = writer.createRange(
              model.createPositionFromPath(range.root, [
                range.start.path[0],
                range.start.path[1] + 1,
              ]),
              model.createPositionFromPath(range.root, range.end.path),
            );
          } else if (endNodeBefore && endNodeBefore.name === "smartfield") {
            range = writer.createRange(
              model.createPositionFromPath(range.root, range.start.path),
              model.createPositionFromPath(range.root, [
                range.end.path[0],
                range.end.path[1] - 2,
              ]),
            );
          } else if (endNodeAfter && endNodeAfter.name === "smartfield") {
            range = writer.createRange(
              model.createPositionFromPath(range.root, range.start.path),
              model.createPositionFromPath(range.root, [
                range.end.path[0],
                range.end.path[1] - 1,
              ]),
            );
          }

          const markerName = getMarkerName(id, cuid(), parentId, false);
          const currentMarkers = Array.from(model.markers) || [];

          if (currentMarkers.every((marker) => marker.name !== markerName)) {
            writer.addMarker(markerName, {
              range,
              usingOperation: false,
              affectsData: true,
            });
          }
        }
      }
    });
  }
}
