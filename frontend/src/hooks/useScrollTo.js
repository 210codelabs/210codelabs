import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { scrollToId } from "@/lib/scroll";

/**
 * Returns a function that scrolls to a homepage section.
 * If the user is not on the homepage it navigates to "/#id" first.
 */
export function useScrollTo() {
  const location = useLocation();
  const navigate = useNavigate();
  return useCallback(
    (id) => {
      if (location.pathname === "/") {
        if (scrollToId(id)) {
          window.history.replaceState(null, "", id === "top" ? "/" : `/#${id}`);
          return;
        }
      }
      navigate(id === "top" ? "/" : `/#${id}`);
    },
    [location.pathname, navigate]
  );
}
