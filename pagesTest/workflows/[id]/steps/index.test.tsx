import { GetServerSidePropsContext } from "next"
import { mockResident } from "../../../../fixtures/residents"
import {
  mockWorkflow,
  mockSubmittedWorkflowWithExtras,
  mockManagerApprovedWorkflowWithExtras,
} from "../../../../fixtures/workflows"
import { ParsedUrlQuery } from "querystring"
import { getResidentById } from "../../../../lib/residents"
import { mockForm } from "../../../../fixtures/form"
import { getServerSideProps } from "../../../../pages/workflows/[id]/steps"
import cookie from "cookie"
import jwt from "jsonwebtoken"
import { pilotGroup } from "../../../../config/allowedGroups"
import { getSession } from "next-auth/client"
import {
  mockApprover,
  mockPanelApprover,
  mockUser,
} from "../../../../fixtures/users"
import prisma from "../../../../lib/prisma"

process.env.GSSO_TOKEN_NAME = "foo"
process.env.HACKNEY_JWT_SECRET = "secret"

jest.mock("../../../../lib/prisma", () => ({
  workflow: {
    findUnique: jest.fn(),
  },
}))

jest.mock("../../../../lib/residents")
;(getResidentById as jest.Mock).mockResolvedValue(mockResident)

jest.mock("next-auth/client")
;(getSession as jest.Mock).mockResolvedValue({ user: mockUser })

describe("getServerSideProps", () => {
  it("returns the workflow and form as props", async () => {
    ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow)
    const response = await getServerSideProps({
      query: {
        id: mockWorkflow.id,
      } as ParsedUrlQuery,
      req: {
        headers: {
          referer: "http://example.com",
          cookie: cookie.serialize(
            process.env.GSSO_TOKEN_NAME,
            jwt.sign(
              {
                groups: [pilotGroup],
              },
              process.env.HACKNEY_JWT_SECRET
            )
          ),
        },
      },
    } as GetServerSidePropsContext)

    expect(response).toHaveProperty(
      "props",
      expect.objectContaining({
        id: mockWorkflow.id,
        form: mockForm,
      })
    )
  })

  it("redirects back if user is not in pilot group", async () => {
    ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow)
    const response = await getServerSideProps({
      query: {
        id: mockWorkflow.id,
      } as ParsedUrlQuery,
      req: {
        headers: {
          referer: "http://example.com",
          cookie: cookie.serialize(
            process.env.GSSO_TOKEN_NAME,
            jwt.sign(
              {
                groups: ["some-non-pilot-group"],
              },
              process.env.HACKNEY_JWT_SECRET
            )
          ),
        },
      },
    } as GetServerSidePropsContext)

    expect(response).toHaveProperty("redirect", {
      destination: "http://example.com",
    })
  })

  it("redirects back if user is not in pilot group and no referer", async () => {
    ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow)
    const response = await getServerSideProps({
      query: {
        id: mockWorkflow.id,
      } as ParsedUrlQuery,
      req: {
        headers: {
          cookie: cookie.serialize(
            process.env.GSSO_TOKEN_NAME,
            jwt.sign(
              {
                groups: ["some-non-pilot-group"],
              },
              process.env.HACKNEY_JWT_SECRET
            )
          ),
        },
      },
    } as GetServerSidePropsContext)

    expect(response).toHaveProperty("redirect", {
      destination: "/",
    })
  })

  describe("when a workflow is in-progress", () => {
    beforeAll(() => {
      ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow)
    })

    it("doesn't redirect", async () => {
      ;(getSession as jest.Mock).mockResolvedValue({ user: mockUser })

      const response = await getServerSideProps({
        query: {
          id: mockWorkflow.id,
        } as ParsedUrlQuery,
        req: {
          headers: {
            cookie: cookie.serialize(
              process.env.GSSO_TOKEN_NAME,
              jwt.sign(
                {
                  groups: [pilotGroup],
                },
                process.env.HACKNEY_JWT_SECRET
              )
            ),
          },
        },
      } as GetServerSidePropsContext)

      expect(response).toHaveProperty("props")
    })
  })

  describe("when a workflow is submitted", () => {
    beforeAll(() => {
      ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(
        mockSubmittedWorkflowWithExtras
      )
    })

    it("redirects back the overview page if user is not an approver", async () => {
      ;(getSession as jest.Mock).mockResolvedValue({ user: mockUser })

      const response = await getServerSideProps({
        query: {
          id: mockSubmittedWorkflowWithExtras.id,
        } as ParsedUrlQuery,
        req: {
          headers: {
            cookie: cookie.serialize(
              process.env.GSSO_TOKEN_NAME,
              jwt.sign(
                {
                  groups: [pilotGroup],
                },
                process.env.HACKNEY_JWT_SECRET
              )
            ),
          },
        },
      } as GetServerSidePropsContext)

      expect(response).toHaveProperty("redirect", {
        destination: `/workflows/${mockSubmittedWorkflowWithExtras.id}`,
      })
    })

    it("doesn't redirect if user is an approver", async () => {
      ;(getSession as jest.Mock).mockResolvedValue({ user: mockApprover })

      const response = await getServerSideProps({
        query: {
          id: mockSubmittedWorkflowWithExtras.id,
        } as ParsedUrlQuery,
        req: {
          headers: {
            cookie: cookie.serialize(
              process.env.GSSO_TOKEN_NAME,
              jwt.sign(
                {
                  groups: [pilotGroup],
                },
                process.env.HACKNEY_JWT_SECRET
              )
            ),
          },
        },
      } as GetServerSidePropsContext)

      expect(response).toHaveProperty(
        "props",
        expect.objectContaining({
          id: mockSubmittedWorkflowWithExtras.id,
        })
      )
    })
  })

  describe("when a workflow is manager approved", () => {
    beforeAll(() => {
      ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(
        mockManagerApprovedWorkflowWithExtras
      )
    })

    it("redirects back the overview page if user is not a panel approver", async () => {
      ;(getSession as jest.Mock).mockResolvedValue({ user: mockUser })

      const response = await getServerSideProps({
        query: {
          id: mockManagerApprovedWorkflowWithExtras.id,
        } as ParsedUrlQuery,
        req: {
          headers: {
            cookie: cookie.serialize(
              process.env.GSSO_TOKEN_NAME,
              jwt.sign(
                {
                  groups: [pilotGroup],
                },
                process.env.HACKNEY_JWT_SECRET
              )
            ),
          },
        },
      } as GetServerSidePropsContext)

      expect(response).toHaveProperty("redirect", {
        destination: `/workflows/${mockManagerApprovedWorkflowWithExtras.id}`,
      })
    })

    it("doesn't redirect if user is a panel approver", async () => {
      ;(getSession as jest.Mock).mockResolvedValue({ user: mockPanelApprover })

      const response = await getServerSideProps({
        query: {
          id: mockManagerApprovedWorkflowWithExtras.id,
        } as ParsedUrlQuery,
        req: {
          headers: {
            cookie: cookie.serialize(
              process.env.GSSO_TOKEN_NAME,
              jwt.sign(
                {
                  groups: [pilotGroup],
                },
                process.env.HACKNEY_JWT_SECRET
              )
            ),
          },
        },
      } as GetServerSidePropsContext)

      expect(response).toHaveProperty(
        "props",
        expect.objectContaining({
          id: mockManagerApprovedWorkflowWithExtras.id,
        })
      )
    })
  })
})
