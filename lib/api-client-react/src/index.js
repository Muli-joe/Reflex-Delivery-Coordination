import { useMutation, useQuery } from "@tanstack/react-query";

let baseUrl = "";
let authTokenGetter = null;

export function setBaseUrl(url) {
  baseUrl = url ? url.replace(/\/+$/, "") : "";
}

export function setAuthTokenGetter(getter) {
  authTokenGetter = getter;
}

export class ApiError extends Error {
  constructor(response, data) {
    super(data?.error?.message || `HTTP ${response.status} ${response.statusText}`);
    this.name = "ApiError";
    this.status = response.status;
    this.data = data;
    this.response = response;
  }
}

async function customFetch(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  if (authTokenGetter && !headers.has("authorization")) {
    const token = await authTokenGetter();
    if (token) headers.set("authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${baseUrl}${path}`, { ...options, headers });
  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!response.ok) throw new ApiError(response, data);
  return data;
}

function queryParams(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params || {})) {
    if (value !== undefined && value !== null) search.set(key, String(value));
  }
  const result = search.toString();
  return result ? `?${result}` : "";
}

function withQueryKey(result, queryKey) {
  return Object.assign(result, { queryKey });
}

function queryOptions(queryKey, queryFn, options) {
  const queryConfig = options?.query || {};
  return { queryKey: queryConfig.queryKey || queryKey, queryFn, ...queryConfig };
}

function mutationOptions(mutationKey, mutationFn, options) {
  return {
    mutationKey: [mutationKey],
    mutationFn,
    ...(options?.mutation || {}),
  };
}

export const getHealthCheckUrl = () => "/api/healthz";
export const healthCheck = (options) => customFetch(getHealthCheckUrl(), { ...options, method: "GET" });
export const getHealthCheckQueryKey = () => [getHealthCheckUrl()];
export const getHealthCheckQueryOptions = (options) => queryOptions(
  getHealthCheckQueryKey(),
  ({ signal }) => healthCheck({ ...options?.request, signal }),
  options,
);
export function useHealthCheck(options) {
  const config = getHealthCheckQueryOptions(options);
  return withQueryKey(useQuery(config), config.queryKey);
}

export const getGetCurrentUserUrl = () => "/api/v1/me";
export const getCurrentUser = (options) => customFetch(getGetCurrentUserUrl(), { ...options, method: "GET" });
export const getGetCurrentUserQueryKey = () => [getGetCurrentUserUrl()];
export const getGetCurrentUserQueryOptions = (options) => queryOptions(
  getGetCurrentUserQueryKey(),
  ({ signal }) => getCurrentUser({ ...options?.request, signal }),
  options,
);
export function useGetCurrentUser(options) {
  const config = getGetCurrentUserQueryOptions(options);
  return withQueryKey(useQuery(config), config.queryKey);
}

export const getGetDashboardSummaryUrl = () => "/api/v1/dashboard/summary";
export const getDashboardSummary = (options) => customFetch(getGetDashboardSummaryUrl(), { ...options, method: "GET" });
export const getGetDashboardSummaryQueryKey = () => [getGetDashboardSummaryUrl()];
export const getGetDashboardSummaryQueryOptions = (options) => queryOptions(
  getGetDashboardSummaryQueryKey(),
  ({ signal }) => getDashboardSummary({ ...options?.request, signal }),
  options,
);
export function useGetDashboardSummary(options) {
  const config = getGetDashboardSummaryQueryOptions(options);
  return withQueryKey(useQuery(config), config.queryKey);
}

export const getListActivityUrl = (params) => `/api/v1/activity${queryParams(params)}`;
export const listActivity = (params, options) => customFetch(getListActivityUrl(params), { ...options, method: "GET" });
export const getListActivityQueryKey = (params) => ["/api/v1/activity", ...(params ? [params] : [])];
export const getListActivityQueryOptions = (params, options) => queryOptions(
  getListActivityQueryKey(params),
  ({ signal }) => listActivity(params, { ...options?.request, signal }),
  options,
);
export function useListActivity(params, options) {
  const config = getListActivityQueryOptions(params, options);
  return withQueryKey(useQuery(config), config.queryKey);
}

export const getListDeliveryRequestsUrl = (params) => `/api/v1/delivery-requests${queryParams(params)}`;
export const listDeliveryRequests = (params, options) => customFetch(getListDeliveryRequestsUrl(params), { ...options, method: "GET" });
export const getListDeliveryRequestsQueryKey = (params) => ["/api/v1/delivery-requests", ...(params ? [params] : [])];
export const getListDeliveryRequestsQueryOptions = (params, options) => queryOptions(
  getListDeliveryRequestsQueryKey(params),
  ({ signal }) => listDeliveryRequests(params, { ...options?.request, signal }),
  options,
);
export function useListDeliveryRequests(params, options) {
  const config = getListDeliveryRequestsQueryOptions(params, options);
  return withQueryKey(useQuery(config), config.queryKey);
}

export const getCreateDeliveryRequestUrl = () => "/api/v1/delivery-requests";
export const createDeliveryRequest = (data, options) => customFetch(getCreateDeliveryRequestUrl(), {
  ...options,
  method: "POST",
  headers: { "Content-Type": "application/json", ...options?.headers },
  body: JSON.stringify(data),
});
export const getCreateDeliveryRequestMutationOptions = (options) => mutationOptions(
  "createDeliveryRequest",
  ({ data }) => createDeliveryRequest(data, options?.request),
  options,
);
export const useCreateDeliveryRequest = (options) => useMutation(getCreateDeliveryRequestMutationOptions(options));

export const getGetDeliveryRequestUrl = (id) => `/api/v1/delivery-requests/${id}`;
export const getDeliveryRequest = (id, options) => customFetch(getGetDeliveryRequestUrl(id), { ...options, method: "GET" });
export const getGetDeliveryRequestQueryKey = (id) => [getGetDeliveryRequestUrl(id)];
export const getGetDeliveryRequestQueryOptions = (id, options) => ({
  ...queryOptions(
    getGetDeliveryRequestQueryKey(id),
    ({ signal }) => getDeliveryRequest(id, { ...options?.request, signal }),
    options,
  ),
  enabled: id !== null && id !== undefined,
});
export function useGetDeliveryRequest(id, options) {
  const config = getGetDeliveryRequestQueryOptions(id, options);
  return withQueryKey(useQuery(config), config.queryKey);
}

export const getAssignDeliveryRequestUrl = (id) => `/api/v1/delivery-requests/${id}/assign`;
export const assignDeliveryRequest = (id, data, options) => customFetch(getAssignDeliveryRequestUrl(id), {
  ...options,
  method: "POST",
  headers: { "Content-Type": "application/json", ...options?.headers },
  body: JSON.stringify(data),
});
export const getAssignDeliveryRequestMutationOptions = (options) => mutationOptions(
  "assignDeliveryRequest",
  ({ id, data }) => assignDeliveryRequest(id, data, options?.request),
  options,
);
export const useAssignDeliveryRequest = (options) => useMutation(getAssignDeliveryRequestMutationOptions(options));

export const getCancelDeliveryRequestUrl = (id) => `/api/v1/delivery-requests/${id}/cancel`;
export const cancelDeliveryRequest = (id, options) => customFetch(getCancelDeliveryRequestUrl(id), { ...options, method: "POST" });
export const getCancelDeliveryRequestMutationOptions = (options) => mutationOptions(
  "cancelDeliveryRequest",
  ({ id }) => cancelDeliveryRequest(id, options?.request),
  options,
);
export const useCancelDeliveryRequest = (options) => useMutation(getCancelDeliveryRequestMutationOptions(options));

export const getUpdateDeliveryStatusUrl = (id) => `/api/v1/delivery-requests/${id}/status`;
export const updateDeliveryStatus = (id, data, options) => customFetch(getUpdateDeliveryStatusUrl(id), {
  ...options,
  method: "POST",
  headers: { "Content-Type": "application/json", ...options?.headers },
  body: JSON.stringify(data),
});
export const getUpdateDeliveryStatusMutationOptions = (options) => mutationOptions(
  "updateDeliveryStatus",
  ({ id, data }) => updateDeliveryStatus(id, data, options?.request),
  options,
);
export const useUpdateDeliveryStatus = (options) => useMutation(getUpdateDeliveryStatusMutationOptions(options));

export const getSubmitProofOfDeliveryUrl = (id) => `/api/v1/delivery-requests/${id}/pod`;
export const submitProofOfDelivery = (id, data, options) => customFetch(getSubmitProofOfDeliveryUrl(id), {
  ...options,
  method: "POST",
  headers: { "Content-Type": "application/json", ...options?.headers },
  body: JSON.stringify(data),
});
export const getSubmitProofOfDeliveryMutationOptions = (options) => mutationOptions(
  "submitProofOfDelivery",
  ({ id, data }) => submitProofOfDelivery(id, data, options?.request),
  options,
);
export const useSubmitProofOfDelivery = (options) => useMutation(getSubmitProofOfDeliveryMutationOptions(options));

export const getListRidersUrl = () => "/api/v1/riders";
export const listRiders = (options) => customFetch(getListRidersUrl(), { ...options, method: "GET" });
export const getListRidersQueryKey = () => [getListRidersUrl()];
export const getListRidersQueryOptions = (options) => queryOptions(
  getListRidersQueryKey(),
  ({ signal }) => listRiders({ ...options?.request, signal }),
  options,
);
export function useListRiders(options) {
  const config = getListRidersQueryOptions(options);
  return withQueryKey(useQuery(config), config.queryKey);
}

export const getListMyDeliveriesUrl = () => "/api/v1/riders/me/deliveries";
export const listMyDeliveries = (options) => customFetch(getListMyDeliveriesUrl(), { ...options, method: "GET" });
export const getListMyDeliveriesQueryKey = () => [getListMyDeliveriesUrl()];
export const getListMyDeliveriesQueryOptions = (options) => queryOptions(
  getListMyDeliveriesQueryKey(),
  ({ signal }) => listMyDeliveries({ ...options?.request, signal }),
  options,
);
export function useListMyDeliveries(options) {
  const config = getListMyDeliveriesQueryOptions(options);
  return withQueryKey(useQuery(config), config.queryKey);
}

export const getSyncOfflineEventsUrl = () => "/api/v1/sync";
export const syncOfflineEvents = (data, options) => customFetch(getSyncOfflineEventsUrl(), {
  ...options,
  method: "POST",
  headers: { "Content-Type": "application/json", ...options?.headers },
  body: JSON.stringify(data),
});
export const getSyncOfflineEventsMutationOptions = (options) => mutationOptions(
  "syncOfflineEvents",
  ({ data }) => syncOfflineEvents(data, options?.request),
  options,
);
export const useSyncOfflineEvents = (options) => useMutation(getSyncOfflineEventsMutationOptions(options));