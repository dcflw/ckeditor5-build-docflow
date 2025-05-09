import { MARKER_NAME } from "./constants";

export const getDataFromMarkerName = (markerName) => {
  const [name, commentId, leafId, parentId, resolved, type] =
    markerName.split(":");

  if (name !== MARKER_NAME) {
    return {};
  }

  return {
    commentId,
    leafId,
    resolved,
    parentId,
    type,
  };
};

export const getMarkerName = (
  commentId,
  leafId,
  parentId,
  resolved = false,
  type,
) => {
  return `${MARKER_NAME}:${commentId}:${leafId}:${parentId}:${resolved}:${type}`;
};
