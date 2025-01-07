export const coverImageName = "cover.jpg"

const getImage = () => {
	return `${coverImageName}?_=${Date.now()}`
}

export const getElectionCoverImage = (electionID: number): string => {
	return `/assets/election/${electionID}/${getImage()}`
}

export const getCandidateCoverImage = (electionID: number, candidateID: number): string => {
	return `/assets/election/${electionID}/candidate/${candidateID}/${getImage()}`
}