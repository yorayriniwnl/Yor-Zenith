import type { LumenOutput } from "@/lib/lumen/types";

type AlertVariant = "yellow" | "green" | "red";

type Alert = {
  message: string;
  variant: AlertVariant;
};

const variantStyles: Record<AlertVariant, string> = {
  yellow:
    "bg-yellow-400/10 text-yellow-300 border border-yellow-400/30 ring-1 ring-yellow-400/20",
  green:
    "bg-emerald-400/10 text-emerald-300 border border-emerald-400/30 ring-1 ring-emerald-400/20",
  red: "bg-red-400/10 text-red-300 border border-red-400/30 ring-1 ring-red-400/20",
};

const variantDotStyles: Record<AlertVariant, string> = {
  yellow: "bg-yellow-400",
  green: "bg-emerald-400",
  red: "bg-red-400",
};

function getAlerts(output: LumenOutput): Alert[] {
  const alerts: Alert[] = [];

  const totalGrid = output.grid_to_A + output.grid_to_B + output.grid_to_C;
  if (totalGrid > 5) {
    alerts.push({
      message: "High grid dependency detected",
      variant: "yellow",
    });
  }

  const totalP2P = output.A_to_B + output.A_to_C + output.B_to_C;
  if (totalP2P > 3) {
    alerts.push({
      message: "P2P trading is reducing cost",
      variant: "green",
    });
  }

  if (output.savings < 1) {
    alerts.push({
      message: "Minimal savings — review inputs",
      variant: "red",
    });
  }

  if (output.efficiency_gain_percent > 20) {
    alerts.push({
      message: "Optimal flow achieved",
      variant: "green",
    });
  }

  return alerts;
}

type StatusAlertsProps = LumenOutput;

export default function StatusAlerts(props: StatusAlertsProps) {
  const alerts = getAlerts(props);

  if (alerts.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {alerts.map((alert, index) => (
        <span
          key={index}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tracking-wide ${variantStyles[alert.variant]}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${variantDotStyles[alert.variant]}`}
            aria-hidden="true"
          />
          {alert.message}
        </span>
      ))}
    </div>
  );
}
