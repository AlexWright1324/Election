export const coverImageName = "cover.jpg"

export const getElectionCoverImage = (electionID: string): string => {
  return `/assets/election/${electionID}/${coverImageName}`
}

export const getCandidateCoverImage = (electionID: string, candidateID: string): string => {
  return `/assets/election/${electionID}/candidate/${candidateID}/${coverImageName}`
}
