export const coverImageName = "cover.jpg"

export const getElectionCoverImage = (electionID: number): string => {
	return `/assets/election/${electionID}/${coverImageName}`
}

export const getCandidateCoverImage = (electionID: number, candidateID: number): string => {
	return `/assets/election/${electionID}/candidate/${candidateID}/${coverImageName}`
}