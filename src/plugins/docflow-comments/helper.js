import { MARKER_NAME } from './constants';

export const getDataFromMarkerName = markerName => {
	const [
		name,
		commentId,
		leafId,
		resolved
	] = markerName.split( ':' );

	if ( name !== MARKER_NAME ) {
		return {};
	}

	return {
		commentId,
		leafId,
		resolved
	};
};

export const getMarkerName = ( commentId, leafId, resolved = false ) => {
	return `${ MARKER_NAME }:${ commentId }:${ leafId }:${ resolved }`;
};
