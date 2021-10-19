import { useState } from "react"
import Dialog from "./Dialog"
import PageAnnouncement from "./PageAnnouncement"
import { useRouter } from "next/router"
import {csrfFetch} from "../lib/csrfToken";
import { useSession } from "next-auth/client"

interface Props {
  workflowId: string
  held?: boolean
}

const Hold = ({ workflowId, held }: Props): React.ReactElement => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [status, setStatus] = useState<string | false>(false)
  const { reload } = useRouter()
  const [session] = useSession()

  const handleHold = async () => {
    try {
      const res = await csrfFetch(`/api/workflows/${workflowId}`, {
        method: "PATCH",
        body: JSON.stringify({
          heldAt: new Date(),
        }),
      })
      if (res.status !== 200) throw res.statusText
      setDialogOpen(false)
      reload()
    } catch (e) {
      setStatus(e.toString())
    }
  }

  const handleUnhold = async () => {
    try {
      const res = await csrfFetch(`/api/workflows/${workflowId}`, {
        method: "PATCH",
        body: JSON.stringify({
          heldAt: null,
        }),
      })
      if (res.status !== 200) throw res.statusText
      setDialogOpen(false)
      reload()
    } catch (e) {
      setStatus(e.toString())
    }
  }

  const userIsInPilot = session?.user?.inPilot

  if (!userIsInPilot)
    return null

  return (
    <>
      <button onClick={() => setDialogOpen(true)} className="lbh-link">
        {held ? "Remove hold" : "Put on hold"}
      </button>

      <Dialog
        onDismiss={() => setDialogOpen(false)}
        isOpen={dialogOpen}
        title={
          held
            ? "Are you sure you want to take this workflow off hold?"
            : "Are you sure you want to put this workflow on hold?"
        }
      >
        {status && (
          <PageAnnouncement
            className="lbh-page-announcement--warning"
            title="There was a problem submitting your answers"
          >
            <p>Refresh the page or try again later.</p>
            <p className="lbh-body-xs">{status}</p>
          </PageAnnouncement>
        )}
        {!held && (
          <>
            <p>
              Do this if the workflow cannot be completed right now. For
              example, if they need material from third parties.
            </p>
            <p>
              The workflow will be automatically taken off hold when next
              edited.
            </p>
          </>
        )}

        <div className="lbh-dialog__actions">
          {held ? (
            <button className="govuk-button lbh-button" onClick={handleUnhold}>
              Yes, remove hold
            </button>
          ) : (
            <button className="govuk-button lbh-button" onClick={handleHold}>
              Yes, hold
            </button>
          )}

          <button className="lbh-link" onClick={() => setDialogOpen(false)}>
            No, cancel
          </button>
        </div>
      </Dialog>
    </>
  )
}

export default Hold
