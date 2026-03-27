import { useState } from "react";
import { matchAPI } from "../api/Volunteers.js";

const useVolunteerMatch = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState(null);

  const findMatches = async ({ requestId, maxRadiusKm = 5 }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await matchAPI.find({ requestId, maxRadiusKm });
      setMatches(res.data);
      return res.data;
    } catch (err) {
      setError(err.message || "Could not find volunteers nearby.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const acceptMatch = async (requestId) => {
    setAccepting(true);
    setError(null);
    try {
      const result = await matchAPI.accept({ requestId });
      return result;
    } catch (err) {
      setError(err.message || "Could not accept this request.");
      throw err;
    } finally {
      setAccepting(false);
    }
  };

  return { matches, loading, accepting, error, findMatches, acceptMatch };
};

export default useVolunteerMatch;
