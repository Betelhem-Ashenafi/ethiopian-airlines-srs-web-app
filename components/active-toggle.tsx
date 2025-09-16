import React, { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  id: string;
  active: boolean;
  resource: string; // "department" or "location"
  onChange?: (newActive: boolean) => void;
};

export default function ActiveToggle({ id, active: initialActive, resource, onChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(Boolean(initialActive));

  const toggle = async () => {
    setLoading(true);
    const newActive = !active;
    try {
      // Adjust endpoint if your backend expects a different route (activate/deactivate)
      const res = await fetch(`/api/${resource}/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: newActive }),
        credentials: "include",
      });
      if (!res.ok) throw new Error((await res.text().catch(() => res.statusText)) || res.statusText);
      setActive(newActive);
      onChange?.(newActive);
    } catch (err) {
      console.error("[ActiveToggle] toggle failed", resource, id, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant={active ? "secondary" : "ghost"}
      onClick={toggle}
      disabled={loading}
      aria-pressed={active}
      aria-label={`${active ? "Deactivate" : "Activate"} ${resource}`}
    >
      {loading ? "..." : active ? "Active" : "Inactive"}
    </Button>
  );
}

/*
  Replace existing delete button:
  <Button ... onClick={() => handleDelete(dept.id)}>Delete</Button>
*/
// Example usage: ensure 'dept' is defined in your parent component and passed as a prop
// Remove or move this usage to a file/component where 'dept' is defined

/*
<ActiveToggle
  id={String(dept.id)}
  active={Boolean(dept.active ?? dept.isActive ?? false)}
  resource="department"
  onChange={(newState) => {
    // update local UI / parent callback
    onUpdate?.({ ...dept, active: newState })
  }}
/>
*/