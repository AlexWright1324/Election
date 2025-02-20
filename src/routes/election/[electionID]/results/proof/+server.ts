import { route } from "$lib/ROUTES"
import { requireElectionAdmin } from "$lib/server/auth"

import {
  AlignmentType,
  Document,
  ExternalHyperlink,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
  UnderlineType,
} from "docx"

const BaseURL = "https://election.uwcs.co.uk"

/** @file https://github.com/bscotch/node-util/blob/main/src/lib/strings.ts **/

/**
 * Concatenate the string fragments and interpolated values
 * to get a single string.
 */
function populateTemplate(strings: TemplateStringsArray, ...interps: string[]) {
  let string = ""
  for (let i = 0; i < strings.length; i++) {
    string += `${strings[i] || ""}${interps[i] || ""}`
  }
  return string
}

/**
 * Remove linebreaks and extra spacing in a template string.
 */
function oneline(strings: TemplateStringsArray, ...interps: string[]) {
  return populateTemplate(strings, ...interps)
    .replace(/^\s+/, "")
    .replace(/\s+$/, "")
    .replace(/\s+/g, " ")
}

function prettyDate(date: Date) {
  const nthNumber = (n: number) => {
    if (n > 3 && n < 21) return "th"
    switch (n % 10) {
      case 1:
        return "st"
      case 2:
        return "nd"
      case 3:
        return "rd"
      default:
        return "th"
    }
  }

  const day = date.getDate().toString()
  const nth = nthNumber(date.getDate())
  const month = date.toLocaleString("default", { month: "long" })
  const year = date.getFullYear().toString()

  return [
    new TextRun({ text: day }),
    new TextRun({ text: nth, superScript: true }),
    new TextRun({ text: ` ${month} ${year}` }),
  ]
}

export const GET = requireElectionAdmin(
  {
    id: true,
    name: true,
    nominationsStart: true,
    nominationsEnd: true,
    start: true,
    end: true,
  },
  async ({ election }) => {
    if (!election.start || !election.end || !election.nominationsStart || !election.nominationsEnd) {
      return new Response("Election missing dates", { status: 400 })
    }
    const URL = `${BaseURL}${route("/election/[electionID]", { electionID: election.id })}`
    const underline = { type: UnderlineType.SINGLE }
    const spacing = { after: 200 }
    const Space = () => new TextRun({ text: " " })
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: `Proof of Elections - ${election.name}`, bold: true, underline })],
              heading: HeadingLevel.HEADING_1,
              spacing,
            }),
            new Paragraph({
              children: [new TextRun({ text: "Format / Process", bold: true, underline })],
              spacing,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Voting was conducted online at" }),
                Space(),
                new ExternalHyperlink({
                  children: [
                    new TextRun({
                      text: `${BaseURL}${route("/election/[electionID]", { electionID: election.id })}`,
                      style: "Hyperlink",
                    }),
                  ],
                  link: URL,
                }),
                Space(),
                new TextRun({ text: "on" }),
                Space(),
                ...prettyDate(election.start),
                Space(),
                new TextRun({
                  text: oneline`Candidates for each position were invited to nominate themselves
                  by signing up on the website for each position they wished to run for. This process was outlined in the
                  election announcement email sent to all members on`,
                }),
                Space(),
                new TextRun({ text: "< INSERT DATE HERE >", bold: true, underline }),
                new TextRun({
                  text: ". ",
                }),
                new TextRun({
                  text: oneline`Society membership was verified by the website using the Warwick SU API once authorised by Warwick University SSO. See announcement email copied in below:`,
                }),
              ],
              spacing,
            }),
            new Paragraph({
              children: [new TextRun({ text: "< INSERT ANNOUCEMENT EMAIL HERE >", bold: true, underline })],
              spacing,
            }),
            new Paragraph({
              children: [new TextRun({ text: "Timeline", bold: true, underline })],
              spacing,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Elections announced to members: " }),
                new TextRun({ text: "<DATE>", bold: true, underline }),
              ],
              spacing,
            }),
            new Paragraph({
              children: [new TextRun({ text: "Nominations open: " }), ...prettyDate(election.nominationsStart)],
              spacing,
            }),
            new Paragraph({
              children: [new TextRun({ text: "Nominations close: " }), ...prettyDate(election.nominationsEnd)],
              spacing,
            }),
            new Paragraph({
              children: [new TextRun({ text: "Voting opened: " }), ...prettyDate(election.start)],
              spacing,
            }),
            new Paragraph({
              children: [new TextRun({ text: "Voting closed: " }), ...prettyDate(election.end)],
              spacing,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Results announced: <DATE>" }),
                new TextRun({ text: "<DATE>", bold: true, underline }),
              ],
              spacing,
            }),
            new Paragraph({
              children: [new TextRun({ text: "Positions and Sucessful Candidates", bold: true, underline })],
              spacing,
            }),
            // TODO: Add positions and candidates
            new Paragraph({
              children: [new TextRun({ text: "Minutes of the Meeting", bold: true, underline })],
              spacing,
            }),
            new Paragraph({
              children: [new TextRun({ text: "Attendees: _ of _ members in attendance" })],
              spacing,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Returning Officer: " }),
                new TextRun({ text: "< RETURNING OFFICER NAME>", bold: true, underline }),
              ],
              spacing,
            }),
            new Paragraph({
              children: [new TextRun({ text: "Welcome and Running Order", bold: true })],
              spacing,
            }),
          ],
        },
      ],
    })
    const buffer = await Packer.toBuffer(doc)
    return new Response(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": "attachment; filename=proof.docx",
      },
    })
  },
)
