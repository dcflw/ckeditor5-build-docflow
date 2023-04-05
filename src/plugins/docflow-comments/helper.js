import { MARKER_NAME } from './constants';

export const getDataFromMarkerName = markerName => {
	const [
		name,
		commentId,
		leafId
	] = markerName.split( ':' );

	if ( name !== MARKER_NAME ) {
		return {};
	}

	return {
		commentId,
		leafId
	};
};

export const getMarkerName = ( commentId, leafId ) => {
	return `${ MARKER_NAME }:${ commentId }:${ leafId }`;
};
