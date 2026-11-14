/**
 * The shared test constants: how a test waits on a delivery, the fields
 * whose facets the chart tests ask for, where the mock API is addressed, and
 * the file-rule findings the package still owes.
 */

/**
 * How a test waits on a delivery: often, since one arrives within a round
 * trip, and long enough for a busy machine, within the test's own timeout.
 */
export const DELIVERY_WAIT = { interval: 5, timeout: 4000 } as const;

/** The fields whose facets the chart tests ask for. */
export const CHART_FACETS = ["status", "cores"] as const;

/** Where a test's mock API requests are addressed; the handlers match any origin. */
export const MOCK_API_ORIGIN = "http://localhost";

/**
 * The file-rule findings this package still owes, one `"<path> <rule>"`
 * line each. The guard fails on a finding not listed and on a listed one no
 * longer found, so a row leaves with the fix.
 */
export const FILE_RULE_ALLOWLIST: readonly string[] = Object.freeze([
  "src/lib/_work_in_progress/BuildARenderer/common/RecordItem/RecordItem.tsx export:memo-over-function",
  "src/lib/_work_in_progress/DataCards/common/CardItem/CardItem.tsx export:memo-over-function",
  "src/lib/_work_in_progress/DataCards/common/CardList/CardList.tsx export:memo-over-function",
  "src/lib/_work_in_progress/DataCards/common/FieldValue/FieldValue.tsx export:memo-over-function",
  "src/lib/_work_in_progress/DataChart/common/BarDrawing/BarDrawing.tsx export:memo-over-function",
  "src/lib/_work_in_progress/DataChart/common/RangeDrawing/RangeDrawing.tsx export:memo-over-function",
  "src/lib/_work_in_progress/DataTable/common/BodyCell/BodyCell.tsx export:memo-over-function",
  "src/lib/_work_in_progress/DataTable/common/HeaderMenu/HeaderMenu.tsx export:memo-over-function",
  "src/lib/_work_in_progress/DataTable/common/Row/Row.tsx export:memo-over-function",
  "src/lib/_work_in_progress/DataTable/common/Row/Row.tsx test",
  "src/lib/_work_in_progress/DataTable/common/SettingsMenu/LabelsContext.ts test",
  "src/lib/_work_in_progress/DataTable/common/SettingsMenu/SettingsMenu.tsx export:memo-over-function",
  "src/lib/_work_in_progress/DataTable/common/SettingsMenu/common/ItemLabel/ItemLabel.tsx test",
  "src/lib/_work_in_progress/DataTable/common/TableBody/TableBody.tsx export:memo-over-function",
  "src/lib/_work_in_progress/DataTable/common/TableBody/TableBody.tsx test",
  "src/lib/_work_in_progress/DataTable/common/hooks/useMenuPhase.ts test",
  "src/lib/_work_in_progress/DataTable/common/utils/spellDestinationKey.ts test",
  "src/lib/_work_in_progress/DataTable/constants.ts test",
  "src/lib/_work_in_progress/DataViews/Context.tsx test",
  "src/lib/_work_in_progress/DataViews/Provider.tsx export:default-misnamed",
  "src/lib/_work_in_progress/DataViews/common/Filters/common/constants.ts test",
  "src/lib/_work_in_progress/DataViews/common/HiddenQueryFields/HiddenQueryFields.tsx test",
  "src/lib/_work_in_progress/DataViews/common/SavedViews/common/DeleteConfirm/DeleteConfirm.tsx test",
  "src/lib/_work_in_progress/DataViews/common/SavedViews/common/NameForm/NameForm.tsx test",
  "src/lib/_work_in_progress/DataViews/common/SavedViews/hooks/usePanelFocus.ts test",
  "src/lib/_work_in_progress/DataViews/hooks/useDataViewsRoot.ts test",
  "src/lib/_work_in_progress/DataViews/hooks/useDestination.ts test",
  "src/lib/_work_in_progress/DataViews/hooks/useFilterHandle.ts test",
  "src/lib/_work_in_progress/DataViews/hooks/useMoreFiltersPin.ts test",
  "src/lib/_work_in_progress/PaginationBar/common/PageControl/PageControl.tsx test",
  "src/lib/common/Announcer/Announcer.tsx export:memo-over-function",
  "src/lib/common/Announcer/constants.ts test",
  "src/lib/common/CellContext/CellContext.tsx test",
  "src/lib/common/MessagesContext/MessagesContext.tsx test",
  "src/lib/common/SettingsMenuContext/SettingsMenuContext.tsx test",
  "src/lib/common/virtualization/constants.ts test",
  "src/lib/hooks/useAnnouncer.ts test",
  "src/lib/hooks/useAnsweredFacets.ts test",
  "src/lib/hooks/useDataViewsValue.ts export:mixed",
  "src/lib/hooks/useFacets.ts test",
  "src/lib/hooks/useIsHydrated.ts test",
  "src/lib/hooks/useMergedRef.ts test",
  "src/lib/hooks/useRowScopes.ts test",
  "src/lib/hooks/useStableCallback.ts test",
  "src/lib/hooks/useStableValue.ts test",
  "src/lib/utils/applyRef.ts test",
  "src/lib/utils/interceptSubmit.ts test",
  "src/lib/utils/readFieldName.ts test",
  "src/lib/virtualization/common/VirtualBody/VirtualBody.tsx export:memo-over-function",
  "src/storybook/decorators.tsx export:several-functions",
  "src/storybook/decorators.tsx test",
  "src/storybook/getHiddenButton.ts test",
  "src/storybook/locales/fr.ts export:one-value",
  "src/storybook/locales/fr.ts test",
  "src/storybook/machines/api/answerBehind.ts test",
  "src/storybook/machines/api/compareRecords.ts test",
  "src/storybook/machines/api/constants.ts test",
  "src/storybook/machines/api/foldStoredText.ts test",
  "src/storybook/machines/api/isFacetField.ts test",
  "src/storybook/machines/api/readApiFacets.ts test",
  "src/storybook/machines/api/readGraphQLQuery.ts test",
  "src/storybook/machines/api/readRestQuery.ts test",
  "src/storybook/machines/api/selectRecords.ts test",
  "src/storybook/machines/consumerCode.ts export:one-function",
  "src/storybook/machines/consumerCode.ts test",
  "src/storybook/machines/readPaginationSummary.ts test",
  "src/storybook/machines/sources/MachinesQuery.ts test",
  "src/storybook/spellPublicImports.ts test",
  "testing/answerOverHttp2.ts test",
  "testing/createFakeChannel.ts test",
  "testing/createTokenMessages.ts test",
  "testing/elementAt.ts test",
  "testing/expectNoAxeViolations.ts test",
  "testing/fakeAnnouncerClock.ts test",
  "testing/keyboard/DataTable.keyboard.ts export:none",
  "testing/keyboard/DataTable.keyboard.ts test",
  "testing/readAnnouncements.ts test",
  "testing/serveMockApi.ts test",
  "testing/silenceRenderErrors.ts test",
  "testing/toggleDisclosure.ts test",
  "testing/watchMockRequest.ts test",
]);
