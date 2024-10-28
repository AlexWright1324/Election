export const getElectionCoverImage = (electionID: number): string => {
	return `/election/${electionID}/assets/cover.jpg?_=${Date.now()}`
}
