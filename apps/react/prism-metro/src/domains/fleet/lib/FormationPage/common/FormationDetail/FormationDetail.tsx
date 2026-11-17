import {
  PAGE_RENDERER_NAMES,
  SectionedView,
  useRenderers,
} from "@canonical/prism-core";
import { Head } from "@canonical/react-head";
import type { ReactElement } from "react";
import { useMessages } from "#i18n";
import { MetroChipProjection } from "#lib/ui";
import type { FormationPageQuery } from "#relay/__generated__/FormationPageQuery.graphql.js";
import formationPageQueryNode from "#relay/__generated__/FormationPageQuery.graphql.js";
import { FLEET_RENDERERS, FLEET_SECTIONS } from "../../../../constants.js";
import { useFleetNode } from "../../../../hooks/index.js";
import assertFragment from "../../../assertFragment.js";
import { FormationSideView } from "../../../FormationSideView/index.js";
import formatLength from "../../../formatLength.js";
import measurePlatformFit from "../../../measurePlatformFit.js";
import orientCars from "../../../orientCars.js";
import { PlatformFit } from "../../../PlatformFit/index.js";
import readFormationLines from "../../../readFormationLines.js";
import readFormationTrain from "../../../readFormationTrain.js";
import renderFleetFacts from "../../../renderFleetFacts.js";
import readFitLine from "./readFitLine.js";
import type { FormationDetailProps } from "./types.js";

/**
 * A formation's page, once its data is in the store, laid on the sectioned
 * view: its title and its stock's chip in the header, its facts, then its
 * side view with a tick at each line's shortest platform, its units in
 * order, each by its place and its chip, then its fit at the platforms of
 * every line it runs on, each line named by its chip. An address naming
 * no formation says nothing lives there.
 *
 * The header and the facts stand whatever the renderer: under the page
 * renderer the view gets these sections, under any other (Turtle, for
 * `as=turtle`) what that renderer draws stands in their place.
 *
 * @note Impure: reads the Relay store, the translator and the address.
 */
export default function FormationDetail({
  address,
}: FormationDetailProps): ReactElement {
  const t = useMessages();
  const { active } = useRenderers("page", FLEET_RENDERERS.page);
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
  const isPage = active.name === PAGE_RENDERER_NAMES.page;
  return (
    <>
      <Head title={node._meta.title} />
      <SectionedView
        facts={renderFleetFacts(node, t)}
        header={
          <header className="masthead">
            <h1 className="title">{node._meta.title}</h1>
            <p className="entry">
              <MetroChipProjection node={node.stock} />
            </p>
          </header>
        }
        sections={
          isPage
            ? [
                {
                  id: FLEET_SECTIONS.sideView,
                  title: t("fleet.sideView"),
                  content: (
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
                  ),
                },
                {
                  id: FLEET_SECTIONS.units,
                  title: t("fleet.units"),
                  content: (
                    <ol className="list">
                      {units.map(({ position, reversed, unit }) => (
                        <li className="entry" key={position}>
                          <span className="vital">
                            {t("fleet.unit", { position })}
                          </span>
                          <MetroChipProjection node={unit} />
                          <span className="vital">
                            {formatLength(unit.length)}
                          </span>
                          {reversed ? (
                            <span className="vital">{t("fleet.reversed")}</span>
                          ) : null}
                        </li>
                      ))}
                    </ol>
                  ),
                },
                {
                  id: FLEET_SECTIONS.platformFit,
                  title: t("fleet.platformFit"),
                  content: (
                    <PlatformFit
                      className="fit"
                      fits={fits}
                      renderName={({ code }) => (
                        <MetroChipProjection node={readFitLine(lines, code)} />
                      )}
                    />
                  ),
                },
              ]
            : []
        }
      >
        {isPage
          ? null
          : active.render({
              uri: node.uri,
              title: node._meta.title,
              children: null,
            })}
      </SectionedView>
    </>
  );
}
