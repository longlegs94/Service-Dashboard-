import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createClient,
  createClientAddress,
  deleteClient,
  deleteClientAddress,
  getClient,
  listClientAddresses,
  listClients,
  updateClient,
  type AddressInput,
  type ClientInput,
} from "@/services/clients";

const CLIENTS_KEY = ["clients"] as const;

export function useClients() {
  return useQuery({ queryKey: CLIENTS_KEY, queryFn: listClients });
}

export function useClient(id: string | undefined) {
  return useQuery({
    queryKey: ["client", id],
    queryFn: () => getClient(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      orgId: string;
      createdBy: string;
      input: ClientInput;
    }) => createClient(params),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLIENTS_KEY }),
  });
}

export function useUpdateClient(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ClientInput) => updateClient(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CLIENTS_KEY });
      qc.invalidateQueries({ queryKey: ["client", id] });
    },
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteClient(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLIENTS_KEY }),
  });
}

export function useClientAddresses(clientId: string | undefined) {
  return useQuery({
    queryKey: ["client-addresses", clientId],
    queryFn: () => listClientAddresses(clientId as string),
    enabled: Boolean(clientId),
  });
}

export function useCreateClientAddress(clientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { orgId: string; input: AddressInput }) =>
      createClientAddress({
        orgId: params.orgId,
        clientId,
        input: params.input,
      }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["client-addresses", clientId] }),
  });
}

export function useDeleteClientAddress(clientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteClientAddress(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["client-addresses", clientId] }),
  });
}
