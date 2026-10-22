import { useTranslation } from "@canonical/i18n-react";
import { ContentLayout, ViewLayout } from "@canonical/react-ds-app";
import { Button, Modal } from "@canonical/react-ds-global";
import { Field, Form } from "@canonical/react-ds-global-form";
import { Head } from "@canonical/react-head";
import { type ReactElement, useRef } from "react";
import { PROJECT_NAME } from "./constants.js";
import DashboardBreadcrumbs from "./DashboardBreadcrumbs.js";
import "./styles.css";

/** The project's current settings, prefilled into the form. */
const SETTINGS_DEFAULTS = {
  bridge: "lxdbr0",
  ipv6: true,
  max_instances: 50,
  snapshots: true,
};

const BRIDGE_OPTIONS = [
  { value: "lxdbr0", label: "lxdbr0" },
  { value: "ovn-1", label: "ovn-1" },
];

function handleSave(data: Record<string, unknown>) {
  console.log("Settings saved:", data);
}

export default function SettingsPage(): ReactElement {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDialogElement>(null);

  function closeModal() {
    modalRef.current?.close();
  }

  return (
    <ViewLayout className="dashboard-view">
      <ContentLayout>
        <Head title={t("dashboard.settings.title")} />
        <header className="titlebar">
          <div>
            <DashboardBreadcrumbs />
            <h1>{t("dashboard.settings.heading")}</h1>
          </div>
        </header>

        <section aria-labelledby="project-title" className="section narrow">
          <h2 id="project-title">{t("dashboard.settings.project")}</h2>
          <Form defaultValues={SETTINGS_DEFAULTS} onSubmit={handleSave}>
            <Field
              inputType="select"
              label={t("dashboard.settings.bridge")}
              name="bridge"
              options={BRIDGE_OPTIONS}
            />
            <Field
              controlLabel={t("dashboard.settings.ipv6Control")}
              inputType="switch"
              isOptional
              label={t("dashboard.settings.ipv6")}
              name="ipv6"
            />
            <Field
              inputType="number"
              label={t("dashboard.settings.maxInstances")}
              name="max_instances"
            />
            <Field
              controlLabel={t("dashboard.settings.snapshotsControl")}
              inputType="switch"
              isOptional
              label={t("dashboard.settings.snapshots")}
              name="snapshots"
            />
            <div className="actions">
              <Button importance="primary" type="submit">
                {t("dashboard.settings.save")}
              </Button>
            </div>
          </Form>
        </section>

        <section aria-labelledby="danger-title" className="section narrow">
          <h2 id="danger-title">{t("dashboard.settings.danger")}</h2>
          <p className="muted">{t("dashboard.settings.dangerBody")}</p>
          <div className="actions">
            <Button
              anticipation="destructive"
              icon="delete"
              importance="primary"
              onClick={() => modalRef.current?.showModal()}
            >
              {t("dashboard.settings.delete")}
            </Button>
          </div>
        </section>
      </ContentLayout>

      <Modal closeOnBackdropClick ref={modalRef}>
        <Modal.Header dismissLabel={t("dashboard.close")}>
          {t("dashboard.settings.confirmTitle")}
        </Modal.Header>
        <Modal.Content>
          <p>
            {t("dashboard.settings.confirmBody", { project: PROJECT_NAME })}
          </p>
        </Modal.Content>
        <Modal.Footer>
          <Button importance="tertiary" onClick={closeModal}>
            {t("dashboard.cancel")}
          </Button>
          <Button
            anticipation="destructive"
            icon="delete"
            importance="primary"
            onClick={closeModal}
          >
            {t("dashboard.settings.delete")}
          </Button>
        </Modal.Footer>
      </Modal>
    </ViewLayout>
  );
}
