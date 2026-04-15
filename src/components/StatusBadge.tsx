import type { JobStatus } from "../../shared/contracts";
import { formatStatusLabel } from "../lib/format";

type Props = {
  status: JobStatus;
};

export function StatusBadge({ status }: Props) {
  return (
    <span className={`status-badge status-${status}`}>
      {formatStatusLabel(status)}
    </span>
  );
}
