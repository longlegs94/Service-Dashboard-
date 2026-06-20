import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type {
  DateSelectArg,
  EventClickArg,
  EventDropArg,
} from "@fullcalendar/core";
import type { EventResizeDoneArg } from "@fullcalendar/interaction";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FullPageSpinner, Spinner } from "@/components/ui/spinner";
import { useOrg } from "@/features/org/useOrg";
import {
  useCreateVisit,
  useSchedulableJobs,
  useUpdateVisit,
  useVisits,
} from "@/features/calendar/hooks";

/** Convert an ISO string to a value usable by <input type="datetime-local"> (local time, no tz). */
function isoToLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

/** Convert a datetime-local input value (local time) back to an ISO string. */
function localInputToIso(value: string): string {
  return new Date(value).toISOString();
}

/** Add minutes to an ISO string and return a new ISO string. */
function addMinutesIso(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

interface ScheduleModalState {
  jobId: string;
  startsAt: string;
  endsAt: string;
  notes: string;
}

export function CalendarPage() {
  const navigate = useNavigate();
  const orgQuery = useOrg();
  const visitsQuery = useVisits();
  const schedulableQuery = useSchedulableJobs();
  const createVisit = useCreateVisit();
  const updateVisit = useUpdateVisit();

  const [modal, setModal] = useState<ScheduleModalState | null>(null);

  const visits = visitsQuery.data ?? [];
  const schedulable = schedulableQuery.data ?? [];

  /** Open jobs that don't yet have any visit scheduled. */
  const unscheduledJobs = useMemo(() => {
    const scheduledJobIds = new Set(
      visits.map((v) => v.job_id).filter(Boolean),
    );
    return schedulable.filter((j) => !scheduledJobIds.has(j.id));
  }, [visits, schedulable]);

  const events = useMemo(
    () =>
      visits.map((v) => {
        const client = v.job?.client?.display_name;
        const title = `${v.job?.title ?? "Visit"}${
          client ? " · " + client : ""
        }`;
        return {
          id: v.id,
          title,
          start: v.starts_at,
          end: v.ends_at,
          extendedProps: { jobId: v.job_id },
        };
      }),
    [visits],
  );

  function openModal(startIso: string, endIso: string, jobId = "") {
    setModal({
      jobId,
      startsAt: isoToLocalInput(startIso),
      endsAt: isoToLocalInput(endIso),
      notes: "",
    });
  }

  function openModalForJob(jobId: string) {
    const start = new Date();
    start.setMinutes(0, 0, 0);
    const startIso = start.toISOString();
    openModal(startIso, addMinutesIso(startIso, 60), jobId);
  }

  function handleSelect(arg: DateSelectArg) {
    openModal(arg.start.toISOString(), arg.end.toISOString());
  }

  function handleEventClick(arg: EventClickArg) {
    const jobId = arg.event.extendedProps.jobId as string | null;
    if (jobId) navigate(`/app/jobs/${jobId}`);
  }

  function handleEventDrop(arg: EventDropArg) {
    const { event } = arg;
    if (!event.start) return;
    const endIso = event.end
      ? event.end.toISOString()
      : addMinutesIso(event.start.toISOString(), 60);
    updateVisit.mutate(
      {
        id: event.id,
        patch: { starts_at: event.start.toISOString(), ends_at: endIso },
      },
      { onError: () => arg.revert() },
    );
  }

  function handleEventResize(arg: EventResizeDoneArg) {
    const { event } = arg;
    if (!event.start || !event.end) return;
    updateVisit.mutate(
      {
        id: event.id,
        patch: {
          starts_at: event.start.toISOString(),
          ends_at: event.end.toISOString(),
        },
      },
      { onError: () => arg.revert() },
    );
  }

  function handleCreate() {
    const orgId = orgQuery.data?.orgId;
    if (!modal || !orgId || !modal.jobId || !modal.startsAt || !modal.endsAt) {
      return;
    }
    createVisit.mutate(
      {
        orgId,
        jobId: modal.jobId,
        startsAt: localInputToIso(modal.startsAt),
        endsAt: localInputToIso(modal.endsAt),
        notes: modal.notes || null,
      },
      { onSuccess: () => setModal(null) },
    );
  }

  if (visitsQuery.isLoading || orgQuery.isLoading) {
    return <FullPageSpinner />;
  }

  return (
    <div className="flex flex-col gap-4 p-4 lg:flex-row">
      {/* Unscheduled jobs — stacks above the calendar on phones, sidebar on desktop. */}
      <aside className="w-full lg:w-72 lg:flex-shrink-0">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-base">Unscheduled jobs</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const start = new Date();
                start.setMinutes(0, 0, 0);
                openModal(
                  start.toISOString(),
                  addMinutesIso(start.toISOString(), 60),
                );
              }}
            >
              <Plus className="h-4 w-4" /> New
            </Button>
          </CardHeader>
          <CardContent>
            {schedulableQuery.isLoading ? (
              <Spinner />
            ) : unscheduledJobs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Every open job is scheduled.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {unscheduledJobs.map((job) => (
                  <li key={job.id}>
                    <button
                      type="button"
                      onClick={() => openModalForJob(job.id)}
                      className="w-full rounded-md border border-input p-3 text-left text-sm hover:bg-accent"
                    >
                      <span className="block font-medium">{job.title}</span>
                      {job.client && (
                        <span className="block text-xs text-muted-foreground">
                          {job.client.display_name}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </aside>

      {/* Calendar — scrolls on small screens. */}
      <div className="min-w-0 flex-1 overflow-x-auto">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          height="auto"
          editable
          selectable
          events={events}
          select={handleSelect}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
        />
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-base">Schedule a visit</CardTitle>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setModal(null)}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="visit-job">Job</Label>
                <Select
                  id="visit-job"
                  value={modal.jobId}
                  onChange={(e) =>
                    setModal({ ...modal, jobId: e.target.value })
                  }
                >
                  <option value="">Select a job…</option>
                  {schedulable.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title}
                      {job.client ? ` · ${job.client.display_name}` : ""}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="visit-start">Starts</Label>
                <Input
                  id="visit-start"
                  type="datetime-local"
                  value={modal.startsAt}
                  onChange={(e) => {
                    const startsAt = e.target.value;
                    // Keep end after start: shift end to preserve a sane duration.
                    setModal((m) =>
                      m
                        ? {
                            ...m,
                            startsAt,
                            endsAt:
                              startsAt && m.endsAt && m.endsAt <= startsAt
                                ? isoToLocalInput(
                                    addMinutesIso(localInputToIso(startsAt), 60),
                                  )
                                : m.endsAt,
                          }
                        : m,
                    );
                  }}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="visit-end">Ends</Label>
                <Input
                  id="visit-end"
                  type="datetime-local"
                  value={modal.endsAt}
                  min={modal.startsAt}
                  onChange={(e) =>
                    setModal({ ...modal, endsAt: e.target.value })
                  }
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="visit-notes">Notes (optional)</Label>
                <Textarea
                  id="visit-notes"
                  value={modal.notes}
                  onChange={(e) =>
                    setModal({ ...modal, notes: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setModal(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={
                    createVisit.isPending ||
                    !modal.jobId ||
                    !modal.startsAt ||
                    !modal.endsAt
                  }
                >
                  {createVisit.isPending ? <Spinner /> : "Schedule"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
