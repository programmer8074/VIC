import { useState, useEffect, useCallback } from "react";
import requestsAPI from "../api/Requests.js";

const useRequests = (filters = {}) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestsAPI.list(filters);
      setRequests(res.data);
    } catch (err) {
      setError(err.message || "Failed to load requests.");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const createRequest = async (data) => {
    const newRequest = await requestsAPI.create(data);
    setRequests((prev) => [newRequest, ...prev]);
    return newRequest;
  };

  const updateStatus = async (id, status, note) => {
    const updated = await requestsAPI.updateStatus(id, { status, note });
    setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
    return updated;
  };

  const cancelRequest = async (id) => {
    await requestsAPI.cancel(id);
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  return {
    requests,
    loading,
    error,
    refetch: fetchRequests,
    createRequest,
    updateStatus,
    cancelRequest,
  };
};

export default useRequests;
