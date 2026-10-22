import { useFormatters, useTranslation } from "@canonical/i18n-react";
import { ContentLayout, ViewLayout } from "@canonical/react-ds-app";
import { Button, Card, Tile, Timeline } from "@canonical/react-ds-global";
import { Head } from "@canonical/react-head";
import { useRouter } from "@canonical/router-react";
import type { ReactElement } from "react";
import {
  ACTIVITY,
  CHANNEL_KEYS,
  OVERVIEW_FIGURES,
  RELEASES,
  TERABYTES,
} from "./constants.js";
import DashboardBreadcrumbs from "./DashboardBreadcrumbs.js";
import selectRelativeTime from "./selectRelativeTime.js";
import "./styles.css";

export default function OverviewPage(): ReactElement {
  const { t } = useTranslation();
  const formatters = useFormatters();

  function formatRelative(minutesAgo: number): string {
    const { value, unit } = selectRelativeTime(minutesAgo);
    return formatters.relativeTime(value, unit, { numeric: "auto" });
  }
  const router = useRouter();

  const activity = (
    <section aria-labelledby="activity-title" className="panel">
      <h2 id="activity-title">{t("dashboard.activity.heading")}</h2>
      <Timeline>
        <Timeline.Content>
          {ACTIVITY.map((event) => (
            <Timeline.Event
              actor={
                "name" in event.actor ? event.actor.name : t(event.actor.key)
              }
              criticality={event.criticality}
              datetime={formatRelative(event.minutesAgo)}
              key={event.key}
            >
              {t(event.messageKey, event.values)}
            </Timeline.Event>
          ))}
        </Timeline.Content>
      </Timeline>
    </section>
  );

  return (
    <ViewLayout aside={activity} className="dashboard-view">
      <ContentLayout>
        <Head title={t("dashboard.overview.title")} />
        <header className="titlebar">
          <div>
            <DashboardBreadcrumbs />
            <h1>{t("dashboard.overview.heading")}</h1>
          </div>
          <div className="actions">
            <Button
              icon="plus"
              importance="primary"
              onClick={() => router.navigate("dashboardInstances")}
            >
              {t("dashboard.instances.create")}
            </Button>
          </div>
        </header>

        <section aria-labelledby="status-title" className="section">
          <h2 id="status-title">{t("dashboard.overview.status")}</h2>
          <ul className="tiles">
            <li>
              <Tile>
                <Tile.Header>{t("dashboard.overview.running")}</Tile.Header>
                <Tile.Content>
                  <p className="figure">
                    {formatters.number(OVERVIEW_FIGURES.running)}
                  </p>
                </Tile.Content>
              </Tile>
            </li>
            <li>
              <Tile>
                <Tile.Header>{t("dashboard.overview.stopped")}</Tile.Header>
                <Tile.Content>
                  <p className="figure">
                    {formatters.number(OVERVIEW_FIGURES.stopped)}
                  </p>
                </Tile.Content>
              </Tile>
            </li>
            <li>
              <Tile>
                <Tile.Header>{t("dashboard.overview.storage")}</Tile.Header>
                <Tile.Content>
                  <p className="figure">
                    {formatters.number(
                      OVERVIEW_FIGURES.storageUsedTb,
                      TERABYTES,
                    )}
                  </p>
                  <p className="muted">
                    {t("dashboard.overview.storageOf", {
                      total: formatters.number(
                        OVERVIEW_FIGURES.storageTotalTb,
                        TERABYTES,
                      ),
                    })}
                  </p>
                </Tile.Content>
              </Tile>
            </li>
            <li>
              <Tile>
                <Tile.Header>{t("dashboard.overview.alerts")}</Tile.Header>
                <Tile.Content>
                  <p className="figure">
                    {formatters.number(OVERVIEW_FIGURES.alerts)}
                  </p>
                </Tile.Content>
              </Tile>
            </li>
          </ul>
        </section>

        <section aria-labelledby="releases-title" className="section">
          <h2 id="releases-title">{t("dashboard.overview.releases")}</h2>
          <ul className="cards">
            {RELEASES.map((release) => (
              <li key={release.name}>
                <Card>
                  <Card.Header>{release.name}</Card.Header>
                  <Card.Content>
                    <p>{t(release.summaryKey)}</p>
                    <p className="muted">
                      {t("dashboard.releases.detail", {
                        channel: t(CHANNEL_KEYS[release.channel]),
                        kernel: release.kernel,
                      })}
                    </p>
                  </Card.Content>
                  <Card.Footer>
                    <Button importance="secondary">
                      {t("dashboard.overview.releaseNotes")}
                    </Button>
                    <Button
                      icon="plus"
                      importance="primary"
                      onClick={() => router.navigate("dashboardInstances")}
                    >
                      {t("dashboard.overview.launch")}
                    </Button>
                  </Card.Footer>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      </ContentLayout>
    </ViewLayout>
  );
}
