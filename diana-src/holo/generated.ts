// Public synthetic fixtures. Digests identify these fictional samples only.
export const brainOsExperimentData = {
  "fixtures": [
    {
      "objectId": "demo-launch-brief",
      "relativePath": "samples/launch-brief.md",
      "role": "launch_brief",
      "byteLength": 458,
      "contentSha256": "79b1247c1e8b52bbfe74ff4a271cdde35f182332fc1be2630311a13db156be3a",
      "publicSnapshot": {
        "relativePath": "samples/launch-brief.md",
        "startLine": 1,
        "endLine": 9,
        "content": "# Meridian Launch Brief\n\nDEMONSTRATION DATA \u2014 fictional project.\n\nGoal: launch a business onboarding portal with a reviewable approval trail.\nAudience: operations managers and account teams.\nCurrent checkpoint: staging build reviewed; accessibility review remains open.\nSuccess criteria: approved change specification, completed independent review, and a recoverable deployment plan.\nNext decision: resolve the keyboard-navigation finding before approval.\n"
      }
    },
    {
      "objectId": "demo-approval-decision",
      "relativePath": "samples/approval-decision.json",
      "role": "approval_decision",
      "byteLength": 333,
      "contentSha256": "c6209cf85b341edf3b5d959aa0dff9fea84d7923eef094d19371c281c8b6a263",
      "publicSnapshot": {
        "relativePath": "samples/approval-decision.json",
        "startLine": 1,
        "endLine": 13,
        "content": "{\n  \"fixture\": \"synthetic\",\n  \"decision_id\": \"meridian-review-04\",\n  \"project\": \"meridian\",\n  \"status\": \"WAITING_FOR_REVIEW\",\n  \"checks\": {\n    \"accessibility\": \"OPEN\",\n    \"security\": \"REVIEWED\",\n    \"change_spec\": \"CURRENT\"\n  },\n  \"reason\": \"Keyboard navigation must pass before release approval.\",\n  \"executor_connected\": false\n}\n"
      }
    },
    {
      "objectId": "demo-change-spec",
      "relativePath": "samples/change-spec.json",
      "role": "change_specification",
      "byteLength": 428,
      "contentSha256": "d3b98d2ee074eaf2961f15858c82bbf7d551d74fd68643090e39a1a67e8197b1",
      "publicSnapshot": {
        "relativePath": "samples/change-spec.json",
        "startLine": 1,
        "endLine": 14,
        "content": "{\n  \"fixture\": \"synthetic\",\n  \"change_id\": \"meridian-change-04\",\n  \"target\": \"samples/onboarding-copy.md\",\n  \"change\": {\n    \"before\": \"Submit\",\n    \"after\": \"Submit for review\"\n  },\n  \"expected_effect\": \"Clarifies that submission creates a review request.\",\n  \"verification\": \"Independent content comparison\",\n  \"rollback\": \"Restore the original two-word control label.\",\n  \"status\": \"EXPIRED\",\n  \"executor_connected\": false\n}\n"
      }
    },
    {
      "objectId": "demo-source-correction",
      "relativePath": "samples/source-correction.md",
      "role": "source_correction",
      "byteLength": 464,
      "contentSha256": "60f4d798fee5b1c54dd545f3a67b95ae30b9dd9e43f9211bbf7376d5928507e4",
      "publicSnapshot": {
        "relativePath": "samples/source-correction.md",
        "startLine": 1,
        "endLine": 9,
        "content": "# Meridian Source Correction\n\nDEMONSTRATION DATA \u2014 fictional project.\n\nSupersedes: launch-plan-v1.md, which described immediate release after staging.\nCurrent rule: release requires an accessibility review and an approval decision.\nReason: review identified an unresolved keyboard-navigation issue.\nPreservation: the original statement remains visible as historical context.\nEffect: recommendations should cite this correction and the current approval decision.\n"
      }
    },
    {
      "objectId": "demo-launch-plan-v1",
      "relativePath": "samples/launch-plan-v1.md",
      "role": "historical_proposal",
      "byteLength": 265,
      "contentSha256": "5696bfc4d7f525429ebbce11bcfd8d0e893086d67e005091e35ab1c9dcd272c1",
      "publicSnapshot": {
        "relativePath": "samples/launch-plan-v1.md",
        "startLine": 1,
        "endLine": 7,
        "content": "# Meridian Launch Plan \u2014 Historical\n\nDEMONSTRATION DATA \u2014 fictional project.\n\nPrevious proposal: release after the staging build completes.\nStatus: superseded by source-correction.md.\nRetained to explain what changed; it is not the current release requirement.\n"
      }
    },
    {
      "objectId": "demo-evidence-review",
      "relativePath": "samples/evidence-review.md",
      "role": "evidence_review",
      "byteLength": 407,
      "contentSha256": "9a96515408e820caf6d5a7b15033cb6485b8ef6794bcab3eb4ba8724faa0a3e9",
      "publicSnapshot": {
        "relativePath": "samples/evidence-review.md",
        "startLine": 1,
        "endLine": 9,
        "content": "# Meridian Evidence Review\n\nDEMONSTRATION DATA \u2014 fictional project.\n\nClaim: the onboarding flow is ready for release.\nSupporting evidence: staging build completed and content review finished.\nCounterevidence: the keyboard-navigation review remains open.\nVerdict: technical progress is visible; release readiness is not established.\nDecision: retain the approval hold until the missing check is completed.\n"
      }
    },
    {
      "objectId": "demo-agent-review",
      "relativePath": "samples/agent-review.json",
      "role": "agent_review",
      "byteLength": 465,
      "contentSha256": "415f145428e14be474a56746bffd3cf3369a68c39e1804864d3951e182d700a7",
      "publicSnapshot": {
        "relativePath": "samples/agent-review.json",
        "startLine": 1,
        "endLine": 20,
        "content": "{\n  \"fixture\": \"synthetic\",\n  \"commitment\": \"Review the Meridian change\",\n  \"worker\": {\n    \"role\": \"Draft\",\n    \"state\": \"COMPLETE\",\n    \"output\": \"change-spec.json\"\n  },\n  \"reviewer\": {\n    \"role\": \"Critique\",\n    \"state\": \"OPEN\",\n    \"finding\": \"Keyboard navigation requires review.\"\n  },\n  \"witness\": {\n    \"role\": \"Verify\",\n    \"state\": \"WAITING\",\n    \"proof\": \"Compare the final artifact with the approved specification.\"\n  },\n  \"executor_connected\": false\n}\n"
      }
    }
  ]
} as const;
