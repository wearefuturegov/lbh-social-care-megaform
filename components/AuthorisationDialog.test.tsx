import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { useRouter } from "next/router"
import { mockWorkflow } from "../fixtures/workflows"
import AuthorisationDialog from "./AuthorisationDialog"

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  push: jest.fn(),
})

global.fetch = jest.fn()

const onDismiss = jest.fn();

describe("AuthorisationDialog", () => {
  it("displays if open is true", () => {
    render(
      <AuthorisationDialog
        workflow={mockWorkflow}
        isOpen={true}
        onDismiss={onDismiss}
      />
    )

    expect(screen.getByText("Panel authorisation")).toBeInTheDocument()
  })

  it("doesn't display if open is false", () => {
    render(
      <AuthorisationDialog
        workflow={mockWorkflow}
        isOpen={false}
        onDismiss={onDismiss}
      />
    )

    expect(screen.queryByText("Panel authorisation")).not.toBeInTheDocument()
  })

  it('calls the onDismiss if close is clicked', () => {
    render(
      <AuthorisationDialog
        workflow={mockWorkflow}
        isOpen={true}
        onDismiss={onDismiss}
      />
    );

    fireEvent.click(screen.getByText('Close'));

    expect(onDismiss).toBeCalled();
  });

  it("allows approval of a workflow", async () => {
    render(
      <AuthorisationDialog
        workflow={mockWorkflow}
        isOpen={true}
        onDismiss={onDismiss}
      />
    );

    fireEvent.click(screen.getByText("Yes, the panel has authorised this"))
    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(fetch).toBeCalledWith("/api/workflows/123abc/approval", {
        method: "POST",
        body: JSON.stringify({
          action: "approve",
          reason: "",
        }),
      })
    })
  })

  it("allows workflow to be returned for edits", async () => {
    render(
      <AuthorisationDialog
        workflow={mockWorkflow}
        isOpen={true}
        onDismiss={onDismiss}
      />
    );

    fireEvent.click(screen.getByLabelText("No, return for edits"))
    fireEvent.change(
      screen.getByLabelText("What needs to be changed?", { exact: false }),
      {
        target: { value: "Example reason here" },
      }
    )
    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(fetch).toBeCalledWith("/api/workflows/123abc/approval", {
        method: "DELETE",
        body: JSON.stringify({
          action: "return",
          reason: "Example reason here",
        }),
      })
    })
  })
})
