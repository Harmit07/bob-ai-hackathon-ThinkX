# Problem Statement

## Background

The global power grid is undergoing its most significant transformation in over a century. The rapid deployment of variable renewable energy — solar photovoltaic farms and wind generation — is fundamentally changing how grids must be operated. Unlike dispatchable fossil-fuel generation, solar and wind output is intermittent, weather-dependent, and difficult to predict at fine timescales. At the same time, electricity demand is growing and becoming less predictable, driven by EV charging, data center expansion, and industrial electrification.

---

## The Problem

Grid operators today manage an increasingly complex real-time balancing act:

- **Renewable curtailment:** When solar or wind output exceeds grid absorption capacity, clean energy must be wasted (curtailed). India's renewable curtailment alone exceeded 8 TWh in recent years, representing billions in stranded investment.
- **Demand spikes and frequency deviations:** Sudden increases in demand or loss of generation can push grid frequency outside safe bounds (49.8–50.2 Hz for Indian grids; 59.95–60.05 Hz in North America), risking cascading failures.
- **Transmission congestion:** High renewable output in specific regions often cannot be evacuated to load centres, forcing curtailment even when demand exists elsewhere.
- **Reserve margin erosion:** Insufficient spinning reserves leave grids vulnerable to unexpected generation or demand shocks.
- **Decision latency:** Operators currently rely on slow manual processes, disconnected dashboards, and phone calls between control room personnel — adding minutes of lag to decisions that must be made in seconds.

The core gap is the absence of a unified, real-time AI advisory layer that can ingest multi-dimensional grid telemetry, identify what is going wrong and why, and recommend concrete, explainable actions — fast enough to be operationally useful.

---

## Who is Affected

**Primary users:** Grid control room operators and energy management system (EMS) supervisors at regional transmission organisations (RTOs), state-level load dispatch centres (SLDCs), and large renewable energy operators. These professionals monitor dozens of parameters simultaneously across substations, generation assets, and transmission corridors — under constant time pressure.

**Secondary stakeholders:** Energy traders and procurement managers who need visibility into curtailment risk and dispatch costs; renewable energy developers who lose revenue when their assets underperform or are curtailed; regulators and grid planners who need data-driven operational insights.

---

## Why It Matters

- **Economic cost:** Curtailment directly destroys renewable energy revenue. A 100 MW solar farm curtailed for 4 hours at ₹3/kWh loses ₹1.2 million in a single event.
- **Carbon cost:** Curtailed renewables are replaced by fossil generation — erasing both the revenue and the carbon benefit of the clean asset.
- **Grid reliability:** Undetected anomalies escalate into outages. A frequency deviation that goes unaddressed for 60 seconds can trigger automatic load-shedding, blacking out thousands of consumers.
- **Operator cognitive load:** Control room operators currently have no AI-assisted triage — every alert requires manual investigation, slowing response when speed is most critical.

---

## Why Existing Solutions Fall Short

Current grid management tools fall into two categories:

1. **Legacy SCADA/EMS systems:** These provide real-time telemetry and alarm panels but offer no predictive analytics, no anomaly explanation, and no optimization recommendations. Operators see that something is wrong but not why, and not what to do about it.

2. **Standalone analytics tools:** Academic or commercial forecasting tools may predict demand or renewable output but are not integrated with the dispatch and advisory layer. There is no single interface connecting forecast → anomaly → optimization → action → approval.

Neither approach provides the closed-loop, explainable, AI-assisted decision support that modern grid complexity demands.
