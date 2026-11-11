import { useState } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import ConfirmDialog from "./ConfirmDialog";

/**
 * Mirrors real consumers (ResourceTable, ConfirmDeleteButton, MediaManager):
 * inline onCancel recreated every render, async action, error state, and the
 * trigger removed after a successful delete.
 */
function Harness({ fail = false }: { fail?: boolean }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleted, setDeleted] = useState(false);
  const [ticks, setTicks] = useState(0);

  const confirm = async () => {
    setPending(true);
    setError(null);
    await Promise.resolve();
    setPending(false);
    if (fail) {
      setError("Delete failed: permission denied.");
      return;
    }
    setOpen(false);
    setDeleted(true);
  };

  return (
    <main>
      {!deleted ? (
        <button type="button" onClick={() => setOpen(true)}>
          Delete row
        </button>
      ) : null}
      <button type="button" onClick={() => setTicks((n) => n + 1)}>
        Rerender {ticks}
      </button>
      <ConfirmDialog
        open={open}
        title="Confirm delete"
        message="Delete this item?"
        confirmLabel="Delete"
        pending={pending}
        error={error}
        onCancel={() => {
          if (!pending) setOpen(false);
        }}
        onConfirm={confirm}
      />
    </main>
  );
}

function openDialog() {
  const trigger = screen.getByRole("button", { name: "Delete row" });
  trigger.focus();
  fireEvent.click(trigger);
  return trigger;
}

const tab = (shiftKey = false) =>
  fireEvent.keyDown(document, { key: "Tab", shiftKey });

afterEach(cleanup);

describe("ConfirmDialog", () => {
  it("focuses Cancel on open and Escape closes with focus back on the trigger", () => {
    render(<Harness />);
    const trigger = openDialog();

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("wraps Tab and Shift+Tab inside the dialog", () => {
    render(<Harness />);
    openDialog();
    const cancel = screen.getByRole("button", { name: "Cancel" });
    const confirm = screen.getByRole("button", { name: "Delete" });

    confirm.focus();
    tab();
    expect(cancel).toHaveFocus();

    tab(true);
    expect(confirm).toHaveFocus();
  });

  it("does not steal focus when the parent re-renders (inline onCancel)", () => {
    render(<Harness />);
    openDialog();
    const confirm = screen.getByRole("button", { name: "Delete" });
    confirm.focus();

    // A parent re-render recreates onCancel; focus must stay put.
    fireEvent.click(screen.getByRole("button", { name: /Rerender/ }));

    expect(confirm).toHaveFocus();
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  it("shows a failed action's error inside the dialog and refocuses Cancel", async () => {
    render(<Harness fail />);
    const trigger = openDialog();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    });

    const dialog = screen.getByRole("alertdialog");
    const alert = screen.getByRole("alert");
    expect(dialog).toContainElement(alert);
    expect(alert).toHaveTextContent("Delete failed: permission denied.");
    expect(dialog.getAttribute("aria-describedby")).toContain(alert.id);
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();

    // Closing after a failure is a cancel: focus goes back to the trigger.
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(trigger).toHaveFocus();
  });

  it("moves focus to <main> after a successful confirm removes the trigger", async () => {
    render(<Harness />);
    openDialog();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    });

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete row" })).not.toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveFocus();
  });

  it("ignores Escape while the action is pending", async () => {
    render(<Harness />);
    openDialog();

    // Click confirm but inspect before the microtask resolves.
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

    await act(async () => {});
  });
});
