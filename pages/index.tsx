import Layout from "../components/_Layout"
import WorkflowList from "../components/WorkflowList"
import { Resident, WorkflowWithExtras } from "../types"
import { getWorkflows } from "../lib/serverQueries"
import { GetServerSideProps } from "next"
import { getResidentById } from "../lib/residents"
import { prettyResidentName } from "../lib/formatters"
import Filters from "../components/Filters"

interface Props {
  workflows: WorkflowWithExtras[]
  resident?: Resident
}

const IndexPage = ({ workflows, resident }: Props): React.ReactElement => {
  return (
    <Layout
      title={
        resident ? `Workflows | ${prettyResidentName(resident)}` : "Workflows"
      }
      breadcrumbs={[
        { href: "#", text: "Dashboard" },
        { text: "Workflows", current: true },
      ]}
    >
      <h1>Workflows</h1>
      <Filters />
      <WorkflowList workflows={workflows} />
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async req => {
  const { social_care_id } = req.query

  const workflows = await getWorkflows(social_care_id as string)

  let resident = null
  if (social_care_id) {
    resident = await getResidentById(social_care_id as string)
  }

  return {
    props: {
      workflows: JSON.parse(JSON.stringify(workflows)),
      resident,
    },
  }
}

export default IndexPage
