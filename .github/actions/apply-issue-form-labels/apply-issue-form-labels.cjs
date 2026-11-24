/**
 * Applies the labels an issue form's answers imply to a newly opened issue.
 *
 * Loaded by the sibling `action.yml` through `actions/github-script`, which
 * is why this file is CommonJS and exports the github-script contract: a
 * single async function taking the `{ github, context, core }` toolkit that
 * action injects. Nothing imports it and it belongs to no workspace — it runs
 * only on the runner, so it stays dependency-free and plain ES2022.
 *
 * A form can only apply fixed labels. This fills the gap: it reads the
 * answers GitHub writes into the issue body, one `### Field label` heading per
 * field, and adds the labels mapped to each answer below. It only adds; it
 * never removes, so a label triage has set is left alone.
 *
 * @note Impure — reads an issue and writes its labels through the GitHub API.
 */

// Field label → answer → labels. The field labels and answers must match the
// forms in `.github/ISSUE_TEMPLATE/` exactly, since they are read back from
// the issue body. The two "kind" dropdowns use different field labels so the
// same answer can map to different labels in each form. Every answer applies
// at most one `Type:` label: the Jira sync picks the issue type from it.
const ANSWER_LABELS = {
  // Report a problem
  "Where is the problem?": {
    "Figma library": ["Type: bug", "Discipline: design"],
    Code: ["Type: bug", "Discipline: eng"],
    "Design tokens": ["Type: bug", "Discipline: design"],
    Documentation: ["Type: docs"],
    "Not sure": ["Type: bug"],
  },
  // Propose something new
  "What do you want to add?": {
    "UI block": ["Type: UI block", "Discipline: design", "Discipline: eng"],
    "Design token": ["Type: tokens", "Discipline: design"],
    Documentation: ["Type: docs"],
    Tooling: ["Type: improvement", "Discipline: eng"],
  },
  // Propose a change
  "What do you want to change?": {
    "UI block": ["Type: improvement"],
    "Design token": ["Type: tokens", "Discipline: design"],
    Documentation: ["Type: docs"],
    Tooling: ["Type: improvement", "Discipline: eng"],
  },
  // Every form except "Ask for support" and "Share an insight"
  "Will you do this yourself?": {
    Yes: ["Contribution: offered"],
  },
};

// Only consulted when a label is missing from the repository. Colours follow
// docs/references/LABELS.md, by namespace.
const COLORS = {
  Type: "c5def5",
  Discipline: "f9d0c4",
  Contribution: "c2e0c6",
};

/** Reads a form-generated issue body into a map of field label → answer. */
function parseAnswers(body) {
  const answers = new Map();
  const sections = `\n${body ?? ""}`.split(/\n### /).slice(1);
  for (const section of sections) {
    const newline = section.indexOf("\n");
    const label = (newline === -1 ? section : section.slice(0, newline)).trim();
    const answer = newline === -1 ? "" : section.slice(newline + 1).trim();
    answers.set(label, answer);
  }
  return answers;
}

async function applyIssueFormLabels({ github, context, core }) {
  const { owner, repo } = context.repo;
  const issue = context.payload.issue;
  const answers = parseAnswers(issue.body);

  const labels = new Set();
  for (const [field, mapping] of Object.entries(ANSWER_LABELS)) {
    const answer = answers.get(field);
    for (const label of mapping[answer] ?? []) labels.add(label);
  }
  if (labels.size === 0) {
    core.info(`#${issue.number}: no mapped answers; nothing to add.`);
    return;
  }

  for (const name of labels) {
    try {
      await github.rest.issues.getLabel({ owner, repo, name });
    } catch (error) {
      if (error.status !== 404) throw error;
      const color = COLORS[name.split(":")[0]];
      await github.rest.issues.createLabel({ owner, repo, name, color });
      core.info(`Created missing label "${name}"`);
    }
  }
  // One call, so the Jira sync sees every label on the first event it handles.
  await github.rest.issues.addLabels({ owner, repo, issue_number: issue.number, labels: [...labels] });
  core.info(`#${issue.number}: added ${[...labels].join(", ")}`);
}

module.exports = applyIssueFormLabels;
