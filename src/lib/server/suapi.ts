import { parse, XMLStream } from "@dbushell/xml-streamify"

interface Member {
  userID: string
  name: string
}

export const getMembers = async (apiKey: string) => {
  const url = `http://www.warwicksu.com/membershipapi/listmembers/${apiKey}/`

  const response = await fetch(url)

  if (!response.ok || !response.body) {
    throw new Error("Failed to fetch members, is the API key correct?")
  }

  const members: Member[] = []
  const stream = response.body.pipeThrough(new TextDecoderStream()).pipeThrough(new XMLStream())
  let element: string | null = null
  let member: Partial<Member> = {}

  // @ts-ignore
  for await (const [type, value] of stream) {
    switch (type) {
      case "element": {
        element = value
        switch (element) {
          case "<Member>": {
            member = {}
            break
          }
          case "</Member>": {
            members.push(member as Member)
            break
          }
        }
        break
      }
      case "text":
        {
          switch (element) {
            case "<FirstName>":
              member.name = value
              break
            case "<LastName>":
              member.name += ` ${value}`
              break
            case "<UniqueID>":
              member.userID = value
              break
          }
        }
        break
    }
  }

  return members
}
