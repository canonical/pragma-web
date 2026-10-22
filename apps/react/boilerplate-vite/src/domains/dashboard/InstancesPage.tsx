import { useTranslation } from "@canonical/i18n-react";
import {
  ContentLayout,
  SidePanel,
  type SidePanelHandle,
  ViewLayout,
} from "@canonical/react-ds-app";
import { Badge, Button, Tile } from "@canonical/react-ds-global";
import { Field, Form } from "@canonical/react-ds-global-form";
import { Head } from "@canonical/react-head";
import { type ReactElement, useRef, useState } from "react";
import { INSTANCES, RELEASE_OPTIONS } from "./constants.js";
import DashboardBreadcrumbs from "./DashboardBreadcrumbs.js";
import type { Instance } from "./types.js";
import "./styles.css";

/** The create form's prefilled values: a second web server on 24.04. */
const CREATE_DEFAULTS = {
  instance_name: "web-03",
  release: "noble",
  enable_pro: true,
  cloud_init: "#cloud-config\npackages:\n  - nginx",
};

/**
 * Builds the instance a submitted create form describes. A new instance is
 * starting and has no address yet.
 */
function createInstance(data: Record<string, unknown>): Instance {
  const release = RELEASE_OPTIONS.find(
    (option) => option.value === data.release,
  );

  return {
    name: String(data.instance_name ?? ""),
    status: "Starting",
    release: release?.label ?? String(data.release ?? ""),
    ipv4: "",
    memory: "4 GiB",
  };
}

export default function InstancesPage(): ReactElement {
  const { t } = useTranslation();
  const panelRef = useRef<SidePanelHandle>(null);
  const [instances, setInstances] = useState<readonly Instance[]>(INSTANCES);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const selected = instances.find((instance) => instance.name === selectedName);

  function handleCreate(data: Record<string, unknown>) {
    const instance = createInstance(data);

    setInstances((current) => [...current, instance]);
    setSelectedName(instance.name);
    panelRef.current?.close();
  }

  const details = (
    <section aria-labelledby="details-title" className="panel">
      <h2 id="details-title">
        {selected ? selected.name : t("dashboard.instances.details")}
      </h2>
      {selected ? (
        <dl className="details">
          <dt>{t("dashboard.instances.status")}</dt>
          <dd>{selected.status}</dd>
          <dt>{t("dashboard.instances.release")}</dt>
          <dd>{selected.release}</dd>
          <dt>{t("dashboard.instances.address")}</dt>
          <dd>{selected.ipv4 || "—"}</dd>
          <dt>{t("dashboard.instances.memory")}</dt>
          <dd>{selected.memory}</dd>
        </dl>
      ) : (
        <p className="muted">{t("dashboard.instances.selectHint")}</p>
      )}
    </section>
  );

  return (
    <ViewLayout aside={details} className="dashboard-view">
      <ContentLayout>
        <Head title={t("dashboard.instances.title")} />
        <header className="titlebar">
          <div>
            <DashboardBreadcrumbs />
            <h1>
              {t("dashboard.instances.heading")}{" "}
              <Badge value={instances.length} />
            </h1>
          </div>
          <div className="actions">
            <Button
              icon="plus"
              importance="primary"
              onClick={() => panelRef.current?.open()}
            >
              {t("dashboard.instances.create")}
            </Button>
          </div>
        </header>

        <section
          aria-label={t("dashboard.instances.heading")}
          className="section"
        >
          <ul className="tiles">
            {instances.map((instance) => (
              <li key={instance.name}>
                <Tile>
                  <Tile.Header>{instance.name}</Tile.Header>
                  <Tile.Content>
                    <p className="muted">
                      {instance.status} · {instance.release}
                    </p>
                    <Button
                      aria-label={t("dashboard.instances.show", {
                        name: instance.name,
                      })}
                      aria-pressed={instance.name === selectedName}
                      importance="tertiary"
                      onClick={() => setSelectedName(instance.name)}
                    >
                      {t("dashboard.instances.details")}
                    </Button>
                  </Tile.Content>
                </Tile>
              </li>
            ))}
          </ul>
        </section>
      </ContentLayout>

      <SidePanel ref={panelRef}>
        <SidePanel.Header dismissLabel={t("dashboard.instances.closePanel")}>
          {t("dashboard.instances.create")}
        </SidePanel.Header>
        <SidePanel.Content>
          <Form
            defaultValues={CREATE_DEFAULTS}
            id="create-instance"
            onSubmit={handleCreate}
          >
            <Field
              inputType="text"
              label={t("dashboard.instances.name")}
              name="instance_name"
              registerProps={{
                required: t("dashboard.instances.nameRequired"),
              }}
            />
            <Field
              inputType="select"
              label={t("dashboard.instances.release")}
              name="release"
              options={RELEASE_OPTIONS}
            />
            <Field
              controlLabel={t("dashboard.instances.pro")}
              inputType="checkbox"
              isOptional
              name="enable_pro"
            />
            <Field
              inputType="textarea"
              isOptional
              label={t("dashboard.instances.cloudInit")}
              name="cloud_init"
            />
          </Form>
        </SidePanel.Content>
        <SidePanel.Footer>
          <Button onClick={() => panelRef.current?.close()}>
            {t("dashboard.cancel")}
          </Button>
          <Button
            anticipation="constructive"
            form="create-instance"
            importance="primary"
            type="submit"
          >
            {t("dashboard.instances.create")}
          </Button>
        </SidePanel.Footer>
      </SidePanel>
    </ViewLayout>
  );
}
