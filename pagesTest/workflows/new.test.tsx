import { GetServerSidePropsContext } from "next"
import { mockForm } from "../../fixtures/form"
import { mockResident } from "../../fixtures/residents"
import { mockWorkflowWithExtras } from "../../fixtures/workflows"
import { ParsedUrlQuery } from "querystring"
import { getResidentById } from "../../lib/residents"
import { getServerSideProps } from "../../pages/workflows/new"

jest.mock("../../lib/prisma", () => ({
  workflow: {
    findUnique: jest.fn().mockResolvedValue(mockWorkflowWithExtras),
    update: jest.fn(),
  },
}))

jest.mock("../../lib/residents")
;(getResidentById as jest.Mock).mockResolvedValue(mockResident)

describe("getServerSideProps", () => {
  it("returns the resident and forms as props", async () => {
    const response = await getServerSideProps({
      query: {
        social_care_id: mockResident.mosaicId,
      } as ParsedUrlQuery,
    } as GetServerSidePropsContext)

    expect(response).toHaveProperty(
      "props",
      expect.objectContaining({
        resident: mockResident,
        forms: [mockForm],
      })
    )
  })
})