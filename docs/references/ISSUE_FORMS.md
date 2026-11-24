# Issue forms

The forms in `.github/ISSUE_TEMPLATE/` are the only way to open an issue in this
repository. This page states the rules they follow, so a change to a form can be
judged against them rather than against taste.

## The forms

One form per intent, named by its verb. Kinds within an intent are a dropdown, not a
separate form.

| Form | Intent | Kinds |
| --- | --- | --- |
| Report a problem | Something does not match its design, documentation or tokens | Figma library, code, design tokens, documentation, not sure |
| Propose something new | Nothing in Pragma covers the need | UI block, design token, documentation, tooling |
| Propose a change | It works as designed, but the design should change | UI block, design token, documentation, tooling |
| Promote a component | A component one product built is needed by others | — |
| Contribute assets | The filer brings finished icons, illustrations or other assets | icon, illustration, other |
| Ask for support or a review | The filer needs help | — |
| Share an insight | An observation, with no action requested | — |
| Raise something else | None of the above | — |

## Rules

1. **Every field feeds a triage decision** (accept, repository, discipline,
   priority) or the work itself. Anything else is a hint in a field description.
2. **The typical filer can answer every field without investigating.** Internal
   concepts such as tiers, repositories or who fixes it stay out of the forms.
3. **A new form needs a new intent.** A new kind is a dropdown option.
4. **At most five fields and three required**, not counting the closing "Will you do
   this yourself?" question.
5. **No checkboxes.** Unticked boxes land in the issue as noise; ask "No / Yes" with a
   dropdown.
6. **No optional field triage would not miss.** An empty optional field shows up as
   `_No response_`.
7. **At most three lines of guidance at the top**, one line at the end, and hints only
   in field descriptions.
8. **Every answer applies at most one `Type:` label**, because the Jira sync takes the
   issue type from it.
9. **Change a form on evidence**: issues moved to another form or repository, fields
   that come back empty, or questions triage keeps asking in comments.

## How answers become labels

A form can only apply fixed labels. The `Issue form labels` workflow reads the
answers when the issue is opened and adds the labels each one implies; the mapping is
in `.github/actions/apply-issue-form-labels/apply-issue-form-labels.cjs`. A field
label or dropdown option that changes in a form must change there too.

The forms whose kind is a dropdown apply only `Status: needs triage` themselves, and
the workflow adds their `Type:` label. The Jira sync creates its ticket on the first
label that passes its allow-list and never changes the ticket's type afterwards, so
the type label must arrive in one step.

Labels and their Jira issue types are listed in [LABELS.md](./LABELS.md).
