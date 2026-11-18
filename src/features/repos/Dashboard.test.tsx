import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../../api/client";
import type { TrackedRepoView } from "../../domain/status";
import { t } from "../../i18n/es";
import { Dashboard } from "./Dashboard";

vi.mock("../../api/client", () => ({
  api: { list: vi.fn(), track: vi.fn(), check: vi.fn(), remove: vi.fn() },
}));
const mocked = vi.mocked(api);

const failing: TrackedRepoView = {
  id: "1",
  full_name: "octo/web",
  url: "https://github.com/octo/web",
  last_check: {
    outcome: "failure",
    message: "Último despliegue 'deploy' failure.",
    workflow_name: "deploy",
    run_url: "https://github.com/octo/web/actions/runs/1",
    checked_at: new Date().toISOString(),
    needs_attention: true,
    provider: "github-actions",
  },
};
const unchecked: TrackedRepoView = {
  id: "2",
  full_name: "octo/api",
  url: "https://github.com/octo/api",
  last_check: null,
};

beforeEach(() => {
  vi.resetAllMocks();
  mocked.list.mockResolvedValue([failing, unchecked]);
});
afterEach(cleanup);

describe("Dashboard", () => {
  it("muestra los repos y cuenta las alertas", async () => {
    render(<Dashboard />);

    expect(await screen.findByText("octo/web")).toBeTruthy();
    expect(screen.getByText("octo/api")).toBeTruthy();
    expect(screen.getByText(t.notice.attention(1))).toBeTruthy();
    expect(screen.getByText(t.status.failure)).toBeTruthy();
    expect(screen.getAllByText(t.card.notChecked).length).toBeGreaterThan(0);
  });

  it("muestra el estado vacío", async () => {
    mocked.list.mockResolvedValue([]);

    render(<Dashboard />);

    expect(await screen.findByText(t.states.empty)).toBeTruthy();
  });

  it("permite reintentar si la carga falla", async () => {
    mocked.list.mockRejectedValueOnce(new Error("HTTP 500"));

    render(<Dashboard />);
    fireEvent.click(await screen.findByText(t.states.retry));

    expect(await screen.findByText("octo/web")).toBeTruthy();
    expect(mocked.list).toHaveBeenCalledTimes(2);
  });

  it("rastrea un repo nuevo y recarga la lista", async () => {
    mocked.track.mockResolvedValue(unchecked);
    render(<Dashboard />);
    await screen.findByText("octo/web");

    fireEvent.change(screen.getByLabelText(t.form.label), {
      target: { value: " octo/nuevo " },
    });
    fireEvent.click(screen.getByText(t.form.add));

    await waitFor(() => expect(mocked.track).toHaveBeenCalledWith("octo/nuevo"));
    await waitFor(() => expect(mocked.list).toHaveBeenCalledTimes(2));
  });

  it("no envía el formulario vacío", async () => {
    render(<Dashboard />);
    await screen.findByText("octo/web");

    fireEvent.click(screen.getByText(t.form.add));

    expect(mocked.track).not.toHaveBeenCalled();
  });

  it("avisa si comprobar un repo falla", async () => {
    mocked.check.mockRejectedValue(new Error("HTTP 502"));
    render(<Dashboard />);
    await screen.findByText("octo/web");

    fireEvent.click(screen.getAllByText(t.card.checkNow)[0]);

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toBe(t.states.actionError);
  });

  it("comprueba un repo y recarga", async () => {
    mocked.check.mockResolvedValue({ last_check: failing.last_check });
    render(<Dashboard />);
    await screen.findByText("octo/web");

    fireEvent.click(screen.getAllByText(t.card.checkNow)[1]);

    await waitFor(() => expect(mocked.check).toHaveBeenCalledWith("2"));
    await waitFor(() => expect(mocked.list).toHaveBeenCalledTimes(2));
  });

  it.each([
    [true, 1],
    [false, 0],
  ])("eliminar con confirmación=%s llama a la API %i veces", async (ok, calls) => {
    vi.spyOn(window, "confirm").mockReturnValue(ok);
    mocked.remove.mockResolvedValue(undefined);
    render(<Dashboard />);
    await screen.findByText("octo/web");

    fireEvent.click(screen.getAllByText(t.card.remove)[0]);

    await waitFor(() => expect(mocked.remove).toHaveBeenCalledTimes(calls));
  });
});
