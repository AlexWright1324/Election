const getImage = () => {
	return `/cover.jpg?_=${Date.now()}`
}

export const getElectionCoverImage = (electionID: number): string => {
	return `/election/${electionID}/assets${getImage()}`
}

export const getCandidateCoverImage = (electionID: number, candidateID: number): string => {
	return `/election/${electionID}/assets/candidate/${candidateID}${getImage()}`
}