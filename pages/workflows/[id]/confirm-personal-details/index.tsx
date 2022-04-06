import WarningPanel from "../../../../components/WarningPanel"
import Layout from "../../../../components/_Layout"
import s from "../../../../components/WarningPanel.module.scss"
import ResidentDetailsList from "../../../../components/ResidentDetailsList"
import { Resident, Status } from "../../../../types"
import Link from "next/link"
import { getResidentById } from "../../../../lib/residents"
import { GetServerSideProps } from "next"
import { prettyResidentName } from "../../../../lib/formatters"
import prisma from "../../../../lib/prisma"
import { Workflow } from ".prisma/client"
import { getStatus } from "../../../../lib/status"
import { protectRoute } from "../../../../lib/protectRoute"
import { pilotGroup } from "../../../../config/allowedGroups"
import useForms from "../../../../hooks/useForms"
import useResident from "../../../../hooks/useResident"

interface Props {
  resident: Resident
  workflow: Workflow
}

export const ConfirmPersonalDetails = ({
  workflow, resident
}: Props): React.ReactElement => {
  const workflowType = workflow.type

  const status = getStatus(workflow, useForms(workflow.formId))

  // const { data: resident } = useResident(workflow.socialCareId)

  const isReassessment =
    [Status.NoAction, Status.ReviewSoon, Status.Overdue].includes(status) ||
    workflowType === "Reassessment"
  const isReview = workflowType === "Review"

  const breadcrumbs = [
    {
      href: `${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}/residents/${resident?.mosaicId}`,
      text: prettyResidentName(resident),
    },
  ]

  return (
    <Layout
      title="Are the personal details correct?"
      breadcrumbs={[...breadcrumbs, { current: true, text: "Check details" }]}
    >
      <WarningPanel>
        <h1 className="lbh-heading-h2">
          Are their personal details still correct?
        </h1>
        <p>
          You need to confirm these before{" "}
          {isReassessment ? "reassessing" : isReview ? "reviewing" : "starting"}{" "}
          a workflow.
        </p>

        <ResidentDetailsList socialCareId={resident.mosaicId} />

        <div className={s.twoActions}>
          <Link href={`/workflows/${workflow.id}/steps`}>
            <a className="govuk-button lbh-button">Yes, they are correct</a>
          </Link>

          <a
            href={`${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}/residents/${resident?.mosaicId}/edit?redirectUrl=${window.location.origin}/workflows/${workflow.id}/confirm-personal-details`}
            className="lbh-link lbh-link--no-visited-state"
            target="_blank"
            rel="noreferrer"
          >
            No, amend
          </a>
        </div>

        <p>You need to come back here after making amendments.</p>
      </WarningPanel>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = protectRoute(
  async ({ query }) => {
    const { id } = query

    const workflow = await prisma.workflow.findUnique({
      where: {
        id: id as string,
      },
    })

    const resident = await getResidentById(workflow.socialCareId)
    // redirect if workflow doesn't exist
    if (!workflow || !resident)
      return {
        props: {},
        redirect: {
          destination: "/404",
        },
      }

    return {
      props: {
        workflow: JSON.parse(JSON.stringify(workflow)),
        resident: JSON.parse(JSON.stringify(resident)),
      },
    }
  },
  [pilotGroup]
)

export default ConfirmPersonalDetails
