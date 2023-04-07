import { MARKER_NAME } from './constants';

export const getDataFromMarkerName = markerName => {
	const [
		name,
		commentId,
		leafId,
		parentId,
		resolved
	] = markerName.split( ':' );

	if ( name !== MARKER_NAME ) {
		return {};
	}

	return {
		commentId,
		leafId,
		resolved,
		parentId
	};
};

export const getMarkerName = ( commentId, leafId, parentId, resolved = false ) => {
	return `${ MARKER_NAME }:${ commentId }:${ leafId }:${ parentId }:${ resolved }`;
};
