import { MARKER_NAME } from './constants';

export const getDataFromMarkerName = markerName => {
	const [
		name,
		commentId,
		leafId,
		selected = '',
		solved = ''
	] = markerName.split( ':' );

	if ( name !== MARKER_NAME ) {
		return {};
	}

	return {
		commentId,
		leafId,
		selected: selected.toLowerCase() === 'true',
		solved: solved.toLowerCase() === 'true'
	};
};

export const getMarkerName = ( commentId, leafId, selected = false, solved = false ) => {
	return `${ MARKER_NAME }:${ commentId }:${ leafId }:${ selected
		.toString()
		.toLowerCase() }:${ solved.toString().toLowerCase() }`;
};
