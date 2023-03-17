import { MARKER_NAME } from './constants';

export const getDataFromMarkerName = markerName => {
	const [
		name,
		commentId,
		leafId,
		parentId,
		selected = '',
		solved = ''
	] = markerName.split( ':' );

	if ( name !== MARKER_NAME ) {
		return {};
	}

	return {
		commentId,
		leafId,
		parentId,
		selected: selected.toLowerCase() === 'true',
		solved: solved.toLowerCase() === 'true'
	};
};

export const getMarkerName = ( commentId, leafId, parentId = 'none', selected = false, solved = false ) => {
	return `${ MARKER_NAME }:${ commentId }:${ leafId }:${ parentId }:${ selected
		.toString()
		.toLowerCase() }:${ solved.toString().toLowerCase() }`;
};
