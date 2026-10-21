import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import * as G from "@canonical/react-ds-global";
import * as F from "@canonical/react-ds-global-form";
const { Button, Badge, Chip, Breadcrumbs, Tabs, Tile, Card, Accordion, Timeline, KeyboardKey, InlineCode, Spinner, Label, Link, Tooltip, Rule, Icon } = G as any;
const { Form, Field } = F as any;
const ICONS = "node_modules/@canonical/ds-assets/icons/";
const inlineIcons = (html: string) => html.replace(/<use href="\/icons\/([a-z0-9-]+)\.svg#\1"><\/use>/g, (m, name) => { const p = ICONS + name + ".svg"; if (!existsSync(p)) return `<!-- missing icon ${name} -->`; const svg = readFileSync(p, "utf-8"); const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, ""); return inner.replace(/<g id="[^"]*">/, "<g>"); });
const r = (el: any) => inlineIcons(renderToStaticMarkup(el));
const out: Record<string, string> = {};
const IMP = ["primary", "secondary", "tertiary"], ANT = [undefined, "constructive", "caution", "destructive"];
out.buttonGrid = r(<div className="grid-buttons">{IMP.map(i => ANT.map(a => <Button key={i + a} importance={i} anticipation={a}>{a ? a[0].toUpperCase() + a.slice(1) : "Default"}</Button>))}</div>);
out.buttonRow = r(<>
  <Button importance="primary" icon="plus">Create instance</Button>
  <Button importance="secondary">Cancel</Button>
  <Button importance="tertiary" icon="settings">Settings</Button>
  <Button importance="primary" anticipation="destructive" icon="delete">Delete</Button>
  <Button importance="secondary" loading>Saving</Button>
  <Button importance="primary" disabled>Disabled</Button>
  <Button variant="link">As a link</Button>
</>);
out.buttonSingle = r(<Button importance="primary" icon="plus">Create instance</Button>);
out.badges = r(<>{[[3, undefined], [12, "information"], [48, "success"], [7, "warning"], [1024, "error"]].map(([v, c]) => <Badge key={String(v)} value={v as number} criticality={c as any} />)}</>);
out.chips = r(<>
  <Chip lead="Region" value="eu-west-1" />
  <Chip value="Stable" release="stable" />
  <Chip value="Beta" release="beta" />
  <Chip value="Experimental" release="experimental" />
  <Chip value="Needs attention" criticality="warning" />
  <Chip value="Failing" criticality="error" />
  <Chip value="Healthy" criticality="success" />
  <Chip lead="Owner" value="webteam" onDismiss={() => {}} onClick={() => {}} />
</>);
out.keys = r(<>{["Ctrl", "Shift", "K"].map(k => <KeyboardKey key={k} keyValue={k as any} />)}</>);
out.inlineCode = r(<p>Run <InlineCode>pragma block lookup Button</InlineCode> to read the spec.</p>);
out.spinner = r(<Spinner />);
out.labels = r(<>{[["Primary", { importance: "primary" }], ["Caution", { anticipation: "caution" }], ["Error", { criticality: "error" }], ["Completed", { lifecycle: "completed" }], ["In progress", { lifecycle: "inProgress" }]].map(([t, p]: any) => <Label key={t} {...p}>{t}</Label>)}</>);
out.breadcrumbs = r(<Breadcrumbs items={[{ label: "Instances", href: "#" }, { label: "lxd-prod-01", href: "#" }, { label: "Storage", href: "#", current: true }]} />);
out.tabs = r(<Tabs aria-label="Sections" navigationRoot={{ label: "root", items: [{ label: "Overview", url: "#overview" }, { label: "Configuration", url: "#config" }, { label: "Snapshots", url: "#snapshots" }, { label: "Logs", url: "#logs" }] }} currentUrl="#overview" />);
out.tile = r(<Tile><Tile.Header>Storage pool</Tile.Header><Tile.Content>Default pool on <InlineCode>zfs</InlineCode>, 2.4 TB used of 4 TB. <Badge value={3} criticality="warning" /></Tile.Content></Tile>);
out.tiles = r(<>{[["Instances", "128 running, 4 stopped", 4, "warning"], ["Storage", "2.4 TB of 4 TB", 0, undefined], ["Networks", "6 bridges, 2 OVN", 1, "error"]].map(([h, c, n, cr]: any) => <Tile key={h}><Tile.Header>{h}</Tile.Header><Tile.Content>{c}{n ? <> <Badge value={n} criticality={cr} /></> : null}</Tile.Content></Tile>)}</>);
out.card = r(<Card><Card.Header>Ubuntu 24.04 LTS</Card.Header><Card.Content>Long-term support release with five years of security updates. <Chip value="Stable" release="stable" /></Card.Content><Card.Footer><Button importance="secondary">Details</Button><Button importance="primary" icon="plus">Launch</Button></Card.Footer></Card>);
out.accordion = r(<Accordion><Accordion.Item heading="Networking" expanded>Bridge <InlineCode>lxdbr0</InlineCode> with IPv4 and IPv6 NAT enabled.</Accordion.Item><Accordion.Item heading="Storage">Two pools: default (zfs) and backups (dir).</Accordion.Item><Accordion.Item heading="Profiles">default, gpu, nested</Accordion.Item></Accordion>);
out.timeline = r(<Timeline><Timeline.Content><Timeline.Event actor="Alice" datetime="2 min ago" criticality="success">Instance <InlineCode>web-01</InlineCode> started</Timeline.Event><Timeline.Event actor="Scheduler" datetime="14 min ago">Snapshot taken</Timeline.Event><Timeline.Event actor="Monitor" datetime="1 h ago" criticality="warning">Disk at 85%</Timeline.Event></Timeline.Content></Timeline>);
out.rule = r(<Rule />);
out.link = r(<Link href="#">Read the guideline</Link>);
try { out.tooltip = r(<Tooltip isOpen>Explains the action</Tooltip>); } catch (e) { out.tooltip = ""; console.error("tooltip", String(e).slice(0, 120)); }
try {
  out.form = r(<Form onSubmit={() => {}}><Field inputType="text" name="name" label="Instance name" description="Lowercase letters, digits and dashes." /><Field inputType="select" name="image" label="Image" options={[{ label: "Ubuntu 24.04 LTS", value: "noble" }, { label: "Ubuntu 22.04 LTS", value: "jammy" }]} /><Field inputType="checkbox" name="ephemeral" label="Ephemeral" controlLabel="Delete when stopped" /><Field inputType="switch" name="autostart" label="Autostart" controlLabel="Start with the host" /><Field inputType="range" name="cpu" label="CPU limit" min={1} max={16} /></Form>);
} catch (e) { out.form = ""; console.error("form", String(e).slice(0, 300)); }
writeFileSync("pieces.json", JSON.stringify(out));
for (const [k, v] of Object.entries(out)) console.log(k.padEnd(12), v.length, v.slice(0, 110).replace(/\n/g, " "));
