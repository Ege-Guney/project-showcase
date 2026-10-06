"use client";

import { useEffect, useMemo, useState } from "react";
import { ClaudeHolo } from "./ClaudeHolo";
import {
  artifactFor,
  scenarios,
  variants,
  type ArtifactProjection,
  type LabScenario,
  type ScenarioKey,
  type Variant,
} from "./model";
import styles from "./brain-os-lab.module.css";

type TrialEvent = {
  eventId: string;
  trialId: string | null;
  occurredAt: string;
  elapsedMs: number | null;
  variant: Variant;
  scenario: ScenarioKey;
  eventType: string;
  objectId?: string;
  detail?: string;
  success?: boolean;
  missingRequirements?: string[];
};

const STORAGE_KEY = "diana-public-preview-events-v1";
const MAX_STORED_EVENTS = 1000;

type RecordOptions = {
  detail?: string;
  objectId?: string;
  variant?: Variant;
  scenario?: ScenarioKey;
  trialId?: string | null;
  elapsedMs?: number | null;
  success?: boolean;
  missingRequirements?: string[];
};

function isStoredEvent(value: unknown): value is TrialEvent {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<TrialEvent>;
  return (
    typeof candidate.eventId === "string" &&
    typeof candidate.occurredAt === "string" &&
    (candidate.variant === "a" || candidate.variant === "b" || candidate.variant === "c") &&
    typeof candidate.scenario === "string" &&
    typeof candidate.eventType === "string"
  );
}

function readStoredEvents() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]") as unknown;
    return Array.isArray(parsed) ? parsed.filter(isStoredEvent).slice(-MAX_STORED_EVENTS) : [];
  } catch {
    return [];
  }
}

function truthLabel(artifact: ArtifactProjection) {
  if (artifact.authority === "simulated") return "Sample source · cannot authorize effects";
  if (artifact.freshness === "historical") return "Historical sample · retained for context";
  if (artifact.anchorState === "ambiguous" || artifact.anchorState === "orphaned") {
    return "Anchor unresolved — action disabled";
  }
  return artifact.authority === "canonical" ? "Current decision source · synthetic" : "Sample evidence projection";
}

function ArtifactFocus({
  artifact,
  onInspect,
}: {
  artifact: ArtifactProjection;
  onInspect: (eventType: string) => void;
}) {
  return (
    <article className={styles.artifactFocus} aria-label={`Artifact Focus: ${artifact.name}`}>
      <header className={styles.sourceRibbon}>
        <div>
          <span>Outcome → Decision → Artifact</span>
          <strong>{artifact.name}</strong>
        </div>
        <dl>
          <div><dt>Role</dt><dd>{artifact.role.replaceAll("_", " ")}</dd></div>
          <div><dt>Version</dt><dd>{artifact.version}</dd></div>
          <div><dt>Anchor</dt><dd>{artifact.anchor} · {artifact.anchorState}</dd></div>
        </dl>
      </header>
      <div className={styles.artifactBody}>
        <div className={styles.fileIdentity}>
          <code>{artifact.path}</code>
          <span>{artifact.contentLabel}</span>
        </div>
        <pre tabIndex={0} aria-label={`${artifact.name} source content`}><code>{artifact.content}</code></pre>
      </div>
      <footer className={styles.artifactActions}>
        <button type="button" onClick={() => onInspect("show_raw_source")}>Show raw source</button>
        <button type="button" onClick={() => onInspect("inspect_version")}>Inspect version</button>
        <button type="button" onClick={() => onInspect("peel_evidence")}>Peel selected evidence</button>
      </footer>
    </article>
  );
}

function TruthRail({
  artifact,
  scenario,
  onInspect,
}: {
  artifact: ArtifactProjection;
  scenario: LabScenario;
  onInspect: (eventType: string) => void;
}) {
  const actionDisabled = (
    artifact.anchorState === "ambiguous" ||
    artifact.anchorState === "orphaned" ||
    (scenario.key === "approve" && artifact.freshness !== "current")
  );
  return (
    <aside className={styles.truthRail} aria-label="Truth rail">
      <div className={styles.railHeading}>
        <span>Truth rail</span>
        <strong>{truthLabel(artifact)}</strong>
      </div>
      <dl className={styles.truthFacts}>
        <div><dt>Source</dt><dd>{artifact.path}</dd></div>
        <div><dt>Object</dt><dd>{artifact.objectId}</dd></div>
        <div><dt>Version</dt><dd>{artifact.sourceSha256.slice(0, 18)}…</dd></div>
        <div><dt>Freshness</dt><dd>{artifact.freshness}</dd></div>
        <div><dt>Authority</dt><dd>{artifact.authority}</dd></div>
        <div><dt>Project</dt><dd>Meridian · fictional launch</dd></div>
        <div><dt>Intent</dt><dd>generation 04</dd></div>
      </dl>
      <div className={styles.railQuestion}>
        <span>Why included?</span>
        <p>{scenario.recommendation}</p>
      </div>
      <div className={styles.railQuestion}>
        <span>Material uncertainty</span>
        <p>{scenario.uncertainty}</p>
      </div>
      <div className={styles.railActions}>
        <button type="button" onClick={() => onInspect("inspect_provenance")}>Provenance X-ray</button>
        <button type="button" onClick={() => onInspect("inspect_exclusions")}>What was excluded?</button>
        <button type="button" disabled={actionDisabled} onClick={() => onInspect("prepare_action")}>
          {scenario.key === "recover" ? "Run independent readback" : "Prepare exact action"}
        </button>
      </div>
    </aside>
  );
}

function TimeSpine({ scenario }: { scenario: LabScenario }) {
  return (
    <ol className={styles.timeSpine} aria-label="Project time spine">
      <li><small>Checkpoint</small><span>{scenario.checkpoint}</span></li>
      <li><small>Changed</small><span>{scenario.changed}</span></li>
      <li><small>Now</small><span>{scenario.expectedAction}</span></li>
    </ol>
  );
}

function NowStrip({ scenario }: { scenario: LabScenario }) {
  return (
    <section className={styles.nowStrip} aria-label="Ranked Now">
      {scenario.now.map((item) => (
        <div key={`${item.kind}-${item.text}`} data-kind={item.kind.toLowerCase()}>
          <span>{item.kind}</span>
          <strong>{item.text}</strong>
          <small>Ranked because it changes the next safe action</small>
        </div>
      ))}
    </section>
  );
}

function WorkingSet({
  artifacts,
  selectedPath,
  onSelect,
}: {
  artifacts: ArtifactProjection[];
  selectedPath: string;
  onSelect: (artifact: ArtifactProjection) => void;
}) {
  return (
    <nav className={styles.workingSet} aria-label="Bounded working set">
      <span>Working set · {artifacts.length}/7</span>
      {artifacts.map((artifact) => (
        <button
          type="button"
          key={artifact.objectId}
          aria-pressed={artifact.path === selectedPath}
          onClick={() => onSelect(artifact)}
        >
          <strong>{artifact.name}</strong>
          <small>{artifact.role.replaceAll("_", " ")} · {artifact.freshness}</small>
        </button>
      ))}
    </nav>
  );
}

function CausalField({
  scenario,
  artifact,
  onHolo,
  onRelation,
}: {
  scenario: LabScenario;
  artifact: ArtifactProjection;
  onHolo: () => void;
  onRelation: (label: string) => void;
}) {
  return (
    <section className={styles.causalField} aria-label="Bounded causal field">
      <div className={styles.fieldIntent}>
        <span>Outcome</span>
        <strong>{scenario.intent}</strong>
      </div>
      <div className={styles.fieldHolo}>
        <ClaudeHolo state={scenario.holoState} onActivate={onHolo} />
      </div>
      <div className={styles.relationOrbit}>
        {scenario.relationLabels.map((label, index) => (
          <button
            type="button"
            key={label}
            data-position={index}
            onClick={() => onRelation(label)}
          >
            <span>{index === 0 ? "Source" : index === 1 ? "Claim" : index === 2 ? "Constraint" : "Decision"}</span>
            <strong>{label}</strong>
          </button>
        ))}
      </div>
      <div className={styles.fieldArtifact}>
        <span>Selected source</span>
        <strong>{artifact.name}</strong>
        <small>{artifact.anchor} · {artifact.anchorState}</small>
      </div>
    </section>
  );
}

function ResponseFrame({ scenario }: { scenario: LabScenario }) {
  return (
    <section className={styles.responseFrame} aria-label="Recommendation">
      <span>Recommendation</span>
      <p>{scenario.recommendation}</p>
      <footer>
        <small>Next decision</small>
        <strong>{scenario.expectedAction}</strong>
      </footer>
    </section>
  );
}

function ActionMembrane({ scenario, artifact }: { scenario: LabScenario; artifact: ArtifactProjection }) {
  if (scenario.key !== "approve" && scenario.key !== "recover") return null;
  const recovery = scenario.key === "recover";
  return (
    <section className={styles.actionMembrane} aria-label={recovery ? "Recovery reserve shell" : "Ghost Action preview"}>
      <header>
        <span>{recovery ? "RESERVE MODE" : "GHOST ACTION"}</span>
        <strong>{recovery ? "Unknown effect — reconciliation only" : "Projected state — no effect has occurred"}</strong>
      </header>
      <dl>
        <div><dt>Target</dt><dd>{artifact.objectId}</dd></div>
        <div><dt>Expected version</dt><dd>{artifact.version}</dd></div>
        <div><dt>Effect</dt><dd>{recovery ? "Target may already contain the approved bytes" : "One staged file patch"}</dd></div>
        <div><dt>Verifier</dt><dd>Independent filesystem readback</dd></div>
        <div><dt>Rollback</dt><dd>Exact inverse patch</dd></div>
        <div><dt>Execution</dt><dd>{recovery ? "Blind retry forbidden" : "Disabled in experiment fixture"}</dd></div>
      </dl>
    </section>
  );
}

function BaselineSurface({
  scenario,
  artifact,
  onHolo,
}: {
  scenario: LabScenario;
  artifact: ArtifactProjection;
  onHolo: () => void;
}) {
  return (
    <section className={styles.baseline} aria-label="Condition A current dashboard baseline">
      <p className={styles.baselineNotice}>
        <strong>Comparison-only reconstruction.</strong> Compare a category-based view with the focused and relationship views of the same fictional work.
      </p>
      <nav aria-label="Dashboard categories">
        {['Today', 'Talk', 'Commitments', 'Fleet', 'Memory', 'Lab'].map((label) => (
          <button type="button" key={label}>{label}</button>
        ))}
      </nav>
      <div className={styles.baselineGrid}>
        <section>
          <span>Your attention</span>
          {scenario.now.map((item) => (
            <article key={item.text}>
              <small>{item.kind}</small>
              <strong>{item.text}</strong>
              <p>Open another category to inspect source, authority, and history.</p>
            </article>
          ))}
        </section>
        <div className={styles.baselineHolo}>
          <ClaudeHolo state={scenario.holoState} onActivate={onHolo} />
        </div>
        <section>
          <span>Continuity</span>
          <article>
            <small>Selected file</small>
            <strong>{artifact.name}</strong>
            <p>{artifact.role.replaceAll("_", " ")} · version {artifact.version}</p>
          </article>
          <article>
            <small>System status</small>
            <strong>Sample work queue</strong>
            <p>This alternate view uses the same sample artifacts and decision history.</p>
          </article>
        </section>
      </div>
    </section>
  );
}

export function BrainOsLab() {
  const [variant, setVariant] = useState<Variant>("c");
  const [scenarioKey, setScenarioKey] = useState<ScenarioKey>("resume");
  const [selectedPath, setSelectedPath] = useState(scenarios[0].primaryPath);
  const [trialStartedAt, setTrialStartedAt] = useState<number | null>(null);
  const [trialId, setTrialId] = useState<string | null>(null);
  const [trialEvents, setTrialEvents] = useState<string[]>([]);
  const [eventCount, setEventCount] = useState(0);
  const [liveDetail, setLiveDetail] = useState("Choose a workflow to explore fictional sources, decisions, and review history.");

  const scenario = scenarios.find((item) => item.key === scenarioKey) ?? scenarios[0];
  const artifacts = useMemo(() => {
    const paths = [scenario.primaryPath, scenario.secondaryPath].filter(Boolean) as string[];
    return paths.map((path) => artifactFor(path, scenario));
  }, [scenario]);
  const selectedArtifact = artifacts.find((artifact) => artifact.path === selectedPath) ?? artifacts[0];
  const fieldActive = variant === "c" && scenario.spatialUseful;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const parameters = new URLSearchParams(window.location.search);
      const requestedVariant = parameters.get("variant") as Variant | null;
      const requestedScenario = parameters.get("scenario") as ScenarioKey | null;
      if (requestedVariant && variants.some((item) => item.key === requestedVariant)) {
        setVariant(requestedVariant);
      }
      if (requestedScenario && scenarios.some((item) => item.key === requestedScenario)) {
        const next = scenarios.find((item) => item.key === requestedScenario)!;
        setScenarioKey(requestedScenario);
        setSelectedPath(next.primaryPath);
      }
      const stored = readStoredEvents();
      setEventCount(stored.length);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      } catch {
        setLiveDetail("Local instrumentation is unavailable in this browser; the laboratory still works without logging.");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function record(eventType: string, options: RecordOptions = {}) {
    const event: TrialEvent = {
      eventId: crypto.randomUUID(),
      trialId: options.trialId === undefined ? trialId : options.trialId,
      occurredAt: new Date().toISOString(),
      elapsedMs: options.elapsedMs === undefined
        ? trialStartedAt === null ? null : Math.round(performance.now() - trialStartedAt)
        : options.elapsedMs,
      variant: options.variant ?? variant,
      scenario: options.scenario ?? scenario.key,
      eventType,
      objectId: options.objectId,
      detail: options.detail,
      success: options.success,
      missingRequirements: options.missingRequirements,
    };
    const stored = readStoredEvents();
    const next = [...stored, event].slice(-MAX_STORED_EVENTS);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setEventCount(next.length);
    } catch {
      setLiveDetail("This interaction was not stored because local instrumentation is unavailable.");
    }
    if (trialStartedAt !== null && eventType !== "trial_complete") {
      setTrialEvents((current) => current.includes(eventType) ? current : [...current, eventType]);
    }
  }

  function updateUrl(nextVariant: Variant, nextScenario: ScenarioKey) {
    const url = new URL(window.location.href);
    url.searchParams.set("variant", nextVariant);
    url.searchParams.set("scenario", nextScenario);
    window.history.replaceState({}, "", url);
  }

  function selectVariant(next: Variant) {
    if (trialStartedAt !== null) return;
    setVariant(next);
    updateUrl(next, scenario.key);
    record("condition_change", { detail: next, variant: next });
    setLiveDetail(`View ${next.toUpperCase()} selected. All views use the same fictional examples.`);
  }

  function selectScenario(nextKey: ScenarioKey) {
    if (trialStartedAt !== null) return;
    const next = scenarios.find((item) => item.key === nextKey) ?? scenarios[0];
    setScenarioKey(nextKey);
    setSelectedPath(next.primaryPath);
    setTrialStartedAt(null);
    setTrialId(null);
    setTrialEvents([]);
    updateUrl(variant, nextKey);
    record("scenario_change", { detail: nextKey, scenario: nextKey });
    setLiveDetail(`${next.label} loaded. Trial timer is stopped.`);
  }

  function beginTrial() {
    const nextTrialId = crypto.randomUUID();
    setTrialStartedAt(performance.now());
    setTrialId(nextTrialId);
    setTrialEvents([]);
    record("trial_start", { trialId: nextTrialId, elapsedMs: 0 });
    setLiveDetail("Trial running. Events are stored locally without source contents.");
  }

  function completeTrial() {
    const missingRequirements = scenario.requiredEvents.filter((eventType) => !trialEvents.includes(eventType));
    const success = missingRequirements.length === 0;
    record("trial_complete", {
      detail: scenario.expectedAction,
      objectId: selectedArtifact.objectId,
      success,
      missingRequirements,
    });
    setTrialStartedAt(null);
    setTrialId(null);
    setLiveDetail(success
      ? `Trial completed with the required evidence interactions. Terminal action: ${scenario.expectedAction}.`
      : `Trial incomplete. Missing: ${missingRequirements.map((item) => item.replaceAll("_", " ")).join(", ")}.`);
  }

  function exportEvents() {
    const payload = window.localStorage.getItem(STORAGE_KEY) ?? "[]";
    const blob = new Blob([payload], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = `diana-public-preview-${new Date().toISOString().replaceAll(":", "-")}.json`;
    anchor.click();
    URL.revokeObjectURL(href);
    setLiveDetail(`${eventCount} local events exported. Only demonstration interaction metadata is included.`);
  }

  function inspect(eventType: string, detail?: string) {
    record(eventType, { detail, objectId: selectedArtifact.objectId });
    setLiveDetail(`${eventType.replaceAll("_", " ")} recorded for ${selectedArtifact.name}.`);
  }

  const variantMeta = variants.find((item) => item.key === variant) ?? variants[2];
  return (
    <main className={styles.labShell} data-variant={variant} data-scenario={scenario.key}>
      <header className={styles.labHeader}>
        <div className={styles.brand}>
          <span>DIANA</span>
          <strong>Governed AI Workspace</strong>
        </div>
        <div className={styles.scopeHeader} aria-label="Safety and scope">
          <span><i aria-hidden="true" /> Synthetic examples</span>
          <span>Meridian launch</span>
          <span>demo · generation 04</span>
          <span>interactive preview</span>
        </div>
        <span className={styles.identityLock}>Public prototype</span>
      </header>


      <section className={styles.publicIntro} aria-label="About this preview">
        <div>
          <span>PROJECT CONTEXT → REVIEWABLE DECISIONS</span>
          <h1>Keep the work in view.<br />Keep the decision grounded.</h1>
          <p>Explore how a governed AI workspace can connect project context, source evidence, delegated reviews, and approval checkpoints. Every example below belongs to a fictional launch.</p>
        </div>
        <aside>
          <strong>Try a two-minute walkthrough</strong>
          <p>Start with the launch brief, inspect a changed requirement, then review a proposed change. Switch views to see the same evidence from another angle.</p>
          <span>Interface prototype · browser-local interactions</span>
        </aside>
      </section>

      <section className={styles.experimentBar} aria-label="Experiment controls">
        <label>
          View
          <select disabled={trialStartedAt !== null} value={variant} onChange={(event) => selectVariant(event.target.value as Variant)}>
            {variants.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
          </select>
        </label>
        <label>
          Workflow
          <select disabled={trialStartedAt !== null} value={scenario.key} onChange={(event) => selectScenario(event.target.value as ScenarioKey)}>
            {scenarios.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
          </select>
        </label>
        <div className={styles.trialControls}>
          <button type="button" onClick={beginTrial} disabled={trialStartedAt !== null}>Begin walkthrough</button>
          <button type="button" onClick={completeTrial} disabled={trialStartedAt === null}>Finish</button>
          <button type="button" onClick={exportEvents}>Export {eventCount}</button>
        </div>
        <div className={styles.modelEvidence}>
          <span>TRACEABLE DECISIONS</span>
          <strong>{scenarios.length} workflows</strong>
          <small>{variantMeta.description}</small>
        </div>
      </section>

      <section className={styles.intentHeader}>
        <div>
          <span>{scenario.label}</span>
          <h1>{scenario.intent}</h1>
          <p>{scenario.definitionOfDone}</p>
        </div>
        <dl>
          <div><dt>Checkpoint</dt><dd>{scenario.checkpoint}</dd></div>
          <div><dt>Changed</dt><dd>{scenario.changed}</dd></div>
        </dl>
      </section>

      {variant === "a" ? (
        <BaselineSurface scenario={scenario} artifact={selectedArtifact} onHolo={() => inspect("holo_explanation")} />
      ) : (
        <>
          <NowStrip scenario={scenario} />
          <section className={styles.workLayer}>
            <div className={styles.orientationColumn}>
              {fieldActive ? (
                <CausalField
                  scenario={scenario}
                  artifact={selectedArtifact}
                  onHolo={() => inspect("holo_explanation")}
                  onRelation={(label) => inspect("relation_inspect", label)}
                />
              ) : (
                <div className={styles.quietHolo}>
                  <ClaudeHolo state={scenario.holoState} onActivate={() => inspect("holo_explanation")} />
                  <ResponseFrame scenario={scenario} />
                </div>
              )}
              <WorkingSet
                artifacts={artifacts}
                selectedPath={selectedArtifact.path}
                onSelect={(artifact) => {
                  setSelectedPath(artifact.path);
                  record("artifact_select", { detail: artifact.path, objectId: artifact.objectId });
                  setLiveDetail(`artifact select recorded for ${artifact.name}.`);
                }}
              />
            </div>
            <ArtifactFocus artifact={selectedArtifact} onInspect={(eventType) => inspect(eventType)} />
            <TruthRail artifact={selectedArtifact} scenario={scenario} onInspect={(eventType) => inspect(eventType)} />
          </section>
          <ActionMembrane scenario={scenario} artifact={selectedArtifact} />
          <TimeSpine scenario={scenario} />
        </>
      )}

      <footer className={styles.labFooter}>
        <p aria-live="polite">{liveDetail}</p>
        <span>
          Synthetic data · no live models, agents, or external actions
        </span>
      </footer>
    </main>
  );
}
