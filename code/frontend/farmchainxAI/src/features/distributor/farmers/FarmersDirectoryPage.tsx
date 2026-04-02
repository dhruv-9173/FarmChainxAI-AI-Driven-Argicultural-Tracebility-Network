import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Deprecated: This component has been replaced by DistributorBrowsePage
 * It automatically redirects to the new browse page
 */
export default function FarmersDirectoryPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/distributor/browse", { replace: true });
  }, [navigate]);

  return null;
}
