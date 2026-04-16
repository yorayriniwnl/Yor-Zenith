export type LumenInput = {
  solar_A: number;
  demand_A: number;
  demand_B: number;
  demand_C: number;
  battery_B: number;
  grid_price: number;
  p2p_price: number;
};

export type LumenOutput = {
  A_to_B: number;
  A_to_C: number;
  B_to_C: number;
  grid_to_A: number;
  grid_to_B: number;
  grid_to_C: number;
  total_cost: number;
  baseline_cost: number;
  savings: number;
  efficiency_gain_percent: number;
};
