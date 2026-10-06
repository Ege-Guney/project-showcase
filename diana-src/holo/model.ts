import { brainOsExperimentData } from "./generated";

export type Variant = "a" | "b" | "c";
export type ScenarioKey =
  | "resume"
  | "authoritative_source"
  | "verify_claim"
  | "compare"
  | "correct_memory"
  | "supervise_agents"
  | "approve"
  | "recover";
export type HoloState = "idle" | "listening" | "speaking" | "working" | "alert";

export type ArtifactProjection = {
  objectId: string;
  name: string;
  path: string;
  role: string;
  version: string;
  byteLength: number;
  anchor: string;
  anchorState: "exact" | "rebased" | "ambiguous" | "orphaned";
  freshness: "current" | "stale" | "historical";
  authority: "canonical" | "derived" | "simulated";
  content: string;
  contentLabel: string;
  sourceSha256: string;
};

export type LabScenario = {
  key: ScenarioKey;
  label: string;
  intent: string;
  definitionOfDone: string;
  checkpoint: string;
  changed: string;
  holoState: HoloState;
  spatialUseful: boolean;
  now: Array<{ kind: "Decide" | "Approve" | "Blocked" | "Unknown"; text: string }>;
  primaryPath: string;
  secondaryPath?: string;
  recommendation: string;
  uncertainty: string;
  relationLabels: string[];
  expectedAction: string;
  requiredEvents: string[];
};

export const variants: Array<{ key: Variant; label: string; description: string }> = [
  {
    "key": "a",
    "label": "A \u00b7 Category view",
    "description": "Browse the same fictional work by category."
  },
  {
    "key": "b",
    "label": "B \u00b7 Focused Holo",
    "description": "A stable view of decisions, sources, and history."
  },
  {
    "key": "c",
    "label": "C \u00b7 Hybrid Holo",
    "description": "Adds a relationship view when the workflow benefits from it."
  }
];

export const scenarios: LabScenario[] = [
  {
    "key": "resume",
    "label": "Resume a launch project",
    "intent": "Pick up the Meridian launch with the next decision already in view.",
    "definitionOfDone": "Find the current brief, the unresolved review, and the next decision.",
    "checkpoint": "Staging build reviewed",
    "changed": "An accessibility finding is waiting for a decision.",
    "holoState": "idle",
    "spatialUseful": false,
    "now": [
      {
        "kind": "Decide",
        "text": "Resolve the keyboard-navigation review"
      },
      {
        "kind": "Blocked",
        "text": "Release approval awaits that review"
      }
    ],
    "primaryPath": "samples/launch-brief.md",
    "recommendation": "Resume from the current brief, inspect the approval hold, and complete the outstanding review.",
    "uncertainty": "The project and review state are fictional examples; no production system is connected.",
    "relationLabels": [
      "current brief",
      "review hold",
      "next decision"
    ],
    "expectedAction": "Inspect the brief and current approval decision",
    "requiredEvents": [
      "show_raw_source",
      "inspect_version"
    ],
    "secondaryPath": "samples/approval-decision.json"
  },
  {
    "key": "authoritative_source",
    "label": "Trace a decision to its source",
    "intent": "See exactly why the Meridian launch remains on hold.",
    "definitionOfDone": "Identify the current decision and distinguish it from the earlier release proposal.",
    "checkpoint": "Approval decision is waiting for review",
    "changed": "The current requirement supersedes the original immediate-release proposal.",
    "holoState": "listening",
    "spatialUseful": false,
    "now": [
      {
        "kind": "Decide",
        "text": "Use the current approval decision as the decision source"
      }
    ],
    "primaryPath": "samples/approval-decision.json",
    "recommendation": "Use the versioned approval decision for the current status; retain the previous plan as historical context.",
    "uncertainty": "Source labels describe synthetic sample artifacts, not live permission grants.",
    "relationLabels": [
      "decision source",
      "historical proposal",
      "source version"
    ],
    "expectedAction": "Inspect the current approval decision",
    "requiredEvents": [
      "show_raw_source",
      "inspect_version"
    ],
    "secondaryPath": "samples/launch-plan-v1.md"
  },
  {
    "key": "verify_claim",
    "label": "Review evidence before a release",
    "intent": "Check whether a completed staging build proves the launch is ready.",
    "definitionOfDone": "Read the evidence, find the missing review, and classify the release claim.",
    "checkpoint": "Staging and content checks completed",
    "changed": "The keyboard-navigation check remains open.",
    "holoState": "working",
    "spatialUseful": false,
    "now": [
      {
        "kind": "Decide",
        "text": "Hold the release claim until the missing check is complete"
      }
    ],
    "primaryPath": "samples/evidence-review.md",
    "recommendation": "Separate completed engineering work from release readiness and keep the missing review visible.",
    "uncertainty": "This example demonstrates evidence review; it does not measure a real project outcome.",
    "relationLabels": [
      "claim",
      "supporting evidence",
      "missing check",
      "verdict"
    ],
    "expectedAction": "Inspect the evidence and its stated limitation",
    "requiredEvents": [
      "show_raw_source",
      "peel_evidence"
    ],
    "secondaryPath": "samples/approval-decision.json"
  },
  {
    "key": "compare",
    "label": "Compare delivery options",
    "intent": "Compare immediate release with a review-first launch using the same evidence.",
    "definitionOfDone": "Inspect both the launch brief and the correction before choosing a delivery path.",
    "checkpoint": "A review-first launch is the current proposal",
    "changed": "The earlier immediate-release option is now historical.",
    "holoState": "working",
    "spatialUseful": true,
    "now": [
      {
        "kind": "Decide",
        "text": "Choose a delivery path with an explicit review checkpoint"
      }
    ],
    "primaryPath": "samples/launch-brief.md",
    "recommendation": "Use the relationship view to understand which source changes the release decision.",
    "uncertainty": "The view illustrates relationships; it does not generate a new recommendation or benchmark result.",
    "relationLabels": [
      "supports launch",
      "changes requirement",
      "review constraint",
      "delivery decision"
    ],
    "expectedAction": "Inspect both decision sources",
    "requiredEvents": [
      "relation_inspect",
      "artifact_select"
    ],
    "secondaryPath": "samples/source-correction.md"
  },
  {
    "key": "correct_memory",
    "label": "Correct a changed requirement",
    "intent": "Update the release requirement while preserving the original decision history.",
    "definitionOfDone": "Read the correction and retain the superseded proposal with its historical label.",
    "checkpoint": "Review required before release",
    "changed": "The earlier release-after-staging assumption has been corrected.",
    "holoState": "alert",
    "spatialUseful": true,
    "now": [
      {
        "kind": "Blocked",
        "text": "The old release assumption conflicts with the current review requirement"
      }
    ],
    "primaryPath": "samples/source-correction.md",
    "recommendation": "Append the source correction and cite the new requirement instead of silently rewriting the old proposal.",
    "uncertainty": "The public preview changes sample selection only; it writes no real memory or project record.",
    "relationLabels": [
      "supersedes",
      "historical source",
      "current requirement",
      "review dependency"
    ],
    "expectedAction": "Inspect the correction and its provenance",
    "requiredEvents": [
      "relation_inspect",
      "inspect_provenance"
    ],
    "secondaryPath": "samples/launch-plan-v1.md"
  },
  {
    "key": "supervise_agents",
    "label": "Review delegated work",
    "intent": "Understand the draft, critique, and verification steps behind one delivery decision.",
    "definitionOfDone": "Find the worker output, the open reviewer finding, and the independent verification obligation.",
    "checkpoint": "Draft change specification prepared",
    "changed": "The reviewer flagged an outstanding accessibility check.",
    "holoState": "working",
    "spatialUseful": true,
    "now": [
      {
        "kind": "Decide",
        "text": "Resolve reviewer dissent before accepting the change"
      }
    ],
    "primaryPath": "samples/agent-review.json",
    "recommendation": "Group delegated work by the artifact and evidence it owes: draft, critique, then independent verification.",
    "uncertainty": "Agent roles are synthetic examples; no agents are running or receiving authority.",
    "relationLabels": [
      "worker draft",
      "reviewer finding",
      "witness obligation",
      "acceptance gate"
    ],
    "expectedAction": "Inspect the review finding and the verification obligation",
    "requiredEvents": [
      "relation_inspect",
      "inspect_provenance"
    ],
    "secondaryPath": "samples/change-spec.json"
  },
  {
    "key": "approve",
    "label": "Inspect a proposed change",
    "intent": "Review exactly what an onboarding copy change would do before accepting it.",
    "definitionOfDone": "Check the target, proposed text, expected effect, verification, and rollback.",
    "checkpoint": "Change specification prepared for review",
    "changed": "This demonstration specification is marked expired, so its prepare control is disabled.",
    "holoState": "alert",
    "spatialUseful": false,
    "now": [
      {
        "kind": "Blocked",
        "text": "Expired demonstration specification requires a fresh review"
      }
    ],
    "primaryPath": "samples/change-spec.json",
    "recommendation": "Review the exact change, reject the expired specification, and request a current version.",
    "uncertainty": "Approval is demonstrated with sample data; there is no executor or production deployment connection.",
    "relationLabels": [
      "exact change",
      "review decision",
      "expected effect",
      "rollback"
    ],
    "expectedAction": "Review the expired specification; do not apply it",
    "requiredEvents": [
      "inspect_version",
      "inspect_provenance"
    ],
    "secondaryPath": "samples/approval-decision.json"
  },
  {
    "key": "recover",
    "label": "Review an uncertain outcome",
    "intent": "Inspect an ambiguous change outcome without repeating the operation.",
    "definitionOfDone": "Identify the last checkpoint and the independent readback needed for reconciliation.",
    "checkpoint": "Sample change accepted; outcome is uncertain",
    "changed": "A fictional process interruption occurred before its completion receipt.",
    "holoState": "alert",
    "spatialUseful": false,
    "now": [
      {
        "kind": "Unknown",
        "text": "Confirm the target state before retrying any change"
      }
    ],
    "primaryPath": "samples/change-spec.json",
    "recommendation": "Use independent readback to reconcile the target state rather than assuming failure and repeating the change.",
    "uncertainty": "Readback is an interface demonstration; it accesses no files or external systems.",
    "relationLabels": [
      "last checkpoint",
      "uncertain outcome",
      "independent readback",
      "reconciliation"
    ],
    "expectedAction": "Inspect provenance and the readback requirement",
    "requiredEvents": [
      "inspect_provenance",
      "prepare_action"
    ],
    "secondaryPath": "samples/evidence-review.md"
  }
];

type GeneratedFixture = (typeof brainOsExperimentData.fixtures)[number];
const generatedFixtureByPath: ReadonlyMap<string, GeneratedFixture> = new Map(
  brainOsExperimentData.fixtures.map((fixture) => [fixture.relativePath, fixture]),
);

export function artifactFor(path: string, scenario: LabScenario): ArtifactProjection {
  const fixture = generatedFixtureByPath.get(path);
  if (!fixture) throw new Error(`Unknown demonstration fixture: ${path}`);
  const historical = path.endsWith("launch-plan-v1.md") || (scenario.key === "approve" && path.endsWith("change-spec.json"));
  return {
    objectId: fixture.objectId,
    name: path.split("/").at(-1) ?? path,
    path,
    role: fixture.role,
    version: fixture.contentSha256.slice(0, 12),
    byteLength: fixture.byteLength,
    anchor: `lines ${fixture.publicSnapshot.startLine}–${fixture.publicSnapshot.endLine}`,
    anchorState: scenario.key === "correct_memory" && path.endsWith("source-correction.md") ? "rebased" : "exact",
    freshness: historical ? "historical" : "current",
    authority: path.endsWith("approval-decision.json") || path.endsWith("source-correction.md") ? "canonical" : "simulated",
    content: fixture.publicSnapshot.content,
    contentLabel: "fictional business example · synthetic data",
    sourceSha256: fixture.contentSha256,
  };
}

export { brainOsExperimentData };
