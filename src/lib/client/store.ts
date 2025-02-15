export const coverImageName = "cover.jpg"

export const getElectionCoverImage = (electionID: string, imageVersion: number = 0): string => {
  return `/assets/election/${electionID}/${coverImageName}?_v=${imageVersion}`
}

export const getCandidateCoverImage = (electionID: string, candidateID: string, imageVersion: number = 0): string => {
  return `/assets/election/${electionID}/candidate/${candidateID}/${coverImageName}?_v=${imageVersion}`
}
