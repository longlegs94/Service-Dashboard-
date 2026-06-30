import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner, FullPageSpinner } from "@/components/ui/spinner";
import { ContactActions } from "@/components/ContactActions";
import { StatusBadge } from "@/features/jobs/components/StatusBadge";
import { useOrg } from "@/features/org/useOrg";
import {
  useClient,
  useClientAddresses,
  useCreateClientAddress,
  useDeleteClient,
  useDeleteClientAddress,
} from "@/features/clients/hooks";
import { useClientJobs } from "@/features/clients/clientJobs";
import type { ClientAddressRow } from "@/services/clients";

export function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: client, isLoading, isError } = useClient(id);
  const deleteClient = useDeleteClient();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isLoading) return <FullPageSpinner />;
  if (isError || !client) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <BackLink />
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            This client couldn't be found.
          </CardContent>
        </Card>
      </div>
    );
  }

  async function handleDelete() {
    await deleteClient.mutateAsync(client!.id);
    navigate("/app/clients", { replace: true });
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <BackLink />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">{client.display_name}</h1>
          {client.company_name && (
            <p className="mt-1 inline-flex items-center gap-1.5 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              {client.company_name}
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/app/clients/${client.id}/edit`}>
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        </Button>
      </div>

      {/* Contact */}
      <Card>
        <CardContent className="space-y-2 pt-6">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Contact
          </h2>
          {client.phone ? (
            <a
              href={`tel:${client.phone}`}
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <Phone className="h-4 w-4" />
              {client.phone}
            </a>
          ) : null}
          {client.email ? (
            <a
              href={`mailto:${client.email}`}
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <Mail className="h-4 w-4" />
              {client.email}
            </a>
          ) : null}
          {!client.phone && !client.email && (
            <p className="text-sm text-muted-foreground">
              No contact details on file.
            </p>
          )}
          {client.phone && (
            <ContactActions phone={client.phone} className="flex flex-wrap gap-2 pt-1" />
          )}
        </CardContent>
      </Card>

      {client.notes && (
        <Card>
          <CardContent className="space-y-2 pt-6">
            <h2 className="text-sm font-semibold text-muted-foreground">
              Notes
            </h2>
            <p className="whitespace-pre-wrap text-sm">{client.notes}</p>
          </CardContent>
        </Card>
      )}

      <AddressesCard clientId={client.id} />

      <JobHistoryCard clientId={client.id} />

      {/* Danger zone */}
      <div className="pt-2">
        {confirmDelete ? (
          <div className="flex items-center gap-3">
            <span className="text-sm">Delete this client?</span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleteClient.isPending}
            >
              Yes, delete
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete client
          </Button>
        )}
      </div>
    </div>
  );
}

function AddressesCard({ clientId }: { clientId: string }) {
  const { data: org } = useOrg();
  const { data: addresses, isLoading } = useClientAddresses(clientId);
  const createAddress = useCreateClientAddress(clientId);
  const deleteAddress = useDeleteClientAddress(clientId);

  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postal, setPostal] = useState("");
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setLabel("");
    setLine1("");
    setLine2("");
    setCity("");
    setProvince("");
    setPostal("");
    setError(null);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (!org) throw new Error("Still loading your workspace — try again.");
      await createAddress.mutateAsync({
        orgId: org.orgId,
        input: {
          label,
          address_line_1: line1,
          address_line_2: line2,
          city,
          province,
          postal_code: postal,
        },
      });
      resetForm();
      setShowForm(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't add the address.",
      );
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Addresses</CardTitle>
        {!showForm && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(true)}
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <Spinner className="h-5 w-5" />
        ) : addresses && addresses.length > 0 ? (
          <ul className="space-y-2">
            {addresses.map((a) => (
              <li
                key={a.id}
                className="flex items-start justify-between gap-3 rounded-md border p-3"
              >
                <div className="min-w-0 text-sm">
                  {a.label && <p className="font-medium">{a.label}</p>}
                  <p className="inline-flex items-start gap-1.5 text-muted-foreground">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{formatAddress(a)}</span>
                  </p>
                  {formatAddress(a) && (
                    <ContactActions
                      address={formatAddress(a)}
                      className="flex gap-2 pt-2"
                    />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => deleteAddress.mutate(a.id)}
                  disabled={deleteAddress.isPending}
                  aria-label="Delete address"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          !showForm && (
            <p className="text-sm text-muted-foreground">
              No addresses yet.
            </p>
          )
        )}

        {showForm && (
          <form onSubmit={handleAdd} className="space-y-3 rounded-md border p-3">
            <div className="space-y-1.5">
              <Label htmlFor="addr-label">Label (optional)</Label>
              <Input
                id="addr-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Home, Shop"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="addr-line1">Address line 1</Label>
              <Input
                id="addr-line1"
                value={line1}
                onChange={(e) => setLine1(e.target.value)}
                placeholder="123 Oak Street"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="addr-line2">Address line 2 (optional)</Label>
              <Input
                id="addr-line2"
                value={line2}
                onChange={(e) => setLine2(e.target.value)}
                placeholder="Unit 4"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="addr-city">City</Label>
                <Input
                  id="addr-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="addr-province">Province</Label>
                <Input
                  id="addr-province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="addr-postal">Postal code</Label>
              <Input
                id="addr-postal"
                value={postal}
                onChange={(e) => setPostal(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-3">
              <Button
                type="submit"
                size="sm"
                disabled={createAddress.isPending}
                className="flex-1"
              >
                {createAddress.isPending && <Spinner className="h-4 w-4" />}
                Save address
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function formatAddress(a: ClientAddressRow): string {
  return [
    a.address_line_1,
    a.address_line_2,
    a.city,
    a.province,
    a.postal_code,
  ]
    .filter(Boolean)
    .join(", ");
}

function JobHistoryCard({ clientId }: { clientId: string }) {
  const { data: jobs, isLoading } = useClientJobs(clientId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Job History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <Spinner className="h-5 w-5" />
        ) : jobs && jobs.length > 0 ? (
          jobs.map((job) => (
            <Link
              key={job.id}
              to={`/app/jobs/${job.id}`}
              className="flex items-center justify-between gap-3 rounded-md border p-3 transition-colors hover:bg-accent"
            >
              <span className="min-w-0 truncate text-sm font-medium">
                {job.title}
              </span>
              <StatusBadge status={job.status} />
            </Link>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No jobs yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

function BackLink() {
  return (
    <Link
      to="/app/clients"
      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" /> All clients
    </Link>
  );
}
