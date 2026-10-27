import { ChipProjection } from "@canonical/prism-projections";
import { Head } from "@canonical/react-head";
import { type ReactElement, useId } from "react";
import { useMessages } from "#i18n";
import type { FormationPageQuery } from "#relay/__generated__/FormationPageQuery.graphql.js";
import formationPageQueryNode from "#relay/__generated__/FormationPageQuery.graphql.js";
import { useFleetNode } from "../../../../hooks/index.js";
import assertFragment from "../../../assertFragment.js";
import { FormationSideView } from "../../../FormationSideView/index.js";
import formatLength from "../../../formatLength.js";
import measurePlatformFit from "../../../measurePlatformFit.js";
import orientCars from "../../../orientCars.js";
import { PlatformFit } from "../../../PlatformFit/index.js";
import readFormationLines from "../../../readFormationLines.js";
import readFormationTrain from "../../../readFormationTrain.js";
import type { FormationDetailProps } from "./types.js";

/**
 * A formation's page, once its data is in the store: its title, its stock's
 * chip, its side view with a tick at each line's shortest platform, its
 * units in order, each named by its chip, then its fit at the platforms of
 * every line it runs on, each line named by its chip. An address
 * naming no formation says nothing lives there.
 */
export default function FormationDetail({
  address,
}: FormationDetailProps): ReactElement {
  const t = useMessages();
  const unitsId = useId();
  const fitId = useId();
  const { node } = useFleetNode<FormationPageQuery>({
    query: formationPageQueryNode,
    address,
  });
  if (node?.__typename !== "Formation") {
    const message = t("fleet.notFound", { address });
    return (
      <>
        <Head title={message} />
        <p className="not-found" role="status">
          {message}
        </p>
      </>
    );
  }
  const fits = measurePlatformFit(
    node.length,
    readFormationLines(
      assertFragment(
        node.readFormationLines_formation,
        "readFormationLines_formation",
      ),
    ),
  );
  const units = [...node.units].sort((a, b) => a.position - b.position);
  const lines = new Map(node.lines.map((line) => [line.code, line]));
  return (
    <>
      <Head title={node._meta.title} />
      <h1 className="title">{node._meta.title}</h1>
      <p className="entry">
        <ChipProjection node={node.stock} />
      </p>
      <FormationSideView
        cars={orientCars(
          readFormationTrain(
            assertFragment(
              node.readFormationTrain_formation,
              "readFormationTrain_formation",
            ),
          ),
        )}
        className="side-view"
        fits={fits}
      />
      <section aria-labelledby={unitsId} className="section">
        <h2 id={unitsId}>{t("fleet.units")}</h2>
        <ol className="list">
          {units.map(({ position, reversed, unit }) => (
            <li className="entry" key={position}>
              <ChipProjection node={unit} />
              <span className="vital">{formatLength(unit.length)}</span>
              {reversed ? (
                <span className="vital">{t("fleet.reversed")}</span>
              ) : null}
            </li>
          ))}
        </ol>
      </section>
      <section aria-labelledby={fitId} className="section">
        <h2 id={fitId}>{t("fleet.platformFit")}</h2>
        <PlatformFit
          fits={fits}
          renderName={({ code, title }) => {
            const line = lines.get(code);
            return line === undefined ? title : <ChipProjection node={line} />;
          }}
        />
      </section>
    </>
  );
}
