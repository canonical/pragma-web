import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import * as G from "@canonical/react-ds-global";
import * as F from "@canonical/react-ds-global-form";
const { Button, Badge, Chip, Breadcrumbs, Tabs, Tile, Card, Accordion, Timeline, KeyboardKey, InlineCode, Spinner, Label, Link, Tooltip, Rule, Icon } = G as any;
const { Form, Field } = F as any;
import * as AP from "@canonical/react-ds-app";
const { SideNavigation, SidePanel, ApplicationLayout } = AP as any;
const CANONICAL_LOGO = "data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2MC40NSA1Ny44NyI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOiNmZmY7fTwvc3R5bGU+PC9kZWZzPjxjaXJjbGUgY2xhc3M9ImNscy0xIiBjeD0iOS42NiIgY3k9IjI3LjQxIiByPSI4LjEyIi8+PGNpcmNsZSBjbGFzcz0iY2xzLTEiIGN4PSI0My40OCIgY3k9IjkuNjEiIHI9IjguMTIiLz48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik03LjM0LDM4LjcxQTI2LjY3LDI2LjY3LDAsMCwwLDMyLjU4LDU1LjU1YTExLjQ3LDExLjQ3LDAsMCwxLTIuNDktN1EyOSw0OC40LDI4LDQ4LjE5QTE5LjYyLDE5LjYyLDAsMCwxLDE0LjU1LDM3LjgzLDExLjQ5LDExLjQ5LDAsMCwxLDcuMzQsMzguNzFaIi8+PGNpcmNsZSBjbGFzcz0iY2xzLTEiIGN4PSI0MS42NSIgY3k9IjQ4LjM1IiByPSI4LjEyIi8+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNNDguOSwzOS4zMWExMS41OCwxMS41OCwwLDAsMSw0LDYuMjUsMjYuNjQsMjYuNjQsMCwwLDAsMS4zNi0zMS42MywxMS40NywxMS40NywwLDAsMS00LjcsNS41NEExOS43MywxOS43MywwLDAsMSw0OC45LDM5LjMxWiIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTkuNjgsMTUuODVhMTEuNDQsMTEuNDQsMCwwLDEsMi40LjI1LDExLjcyLDExLjcyLDAsMCwxLDMuNzcsMS41NCwxOS43MywxOS43MywwLDAsMSwxNi04LjU2LDEyLjE1LDEyLjE1LDAsMCwxLC4yMi0xLjloMGExMS43NSwxMS43NSwwLDAsMSwyLjM0LTQuODlBMjYuOSwyNi45LDAsMCwwLDguODIsMTUuODhDOS4xMSwxNS44Niw5LjM5LDE1Ljg1LDkuNjgsMTUuODVaIi8+PC9zdmc+";
const CanonicalLogo = () => <a className="ds canonical-logo" href="#" aria-label="Home"><img src={CANONICAL_LOGO} alt="Canonical" className="mark" /></a>;
const { Modal } = G as any;
const open = (html: string, cls: string) => html.replace(new RegExp(`<dialog([^>]*class="ds ${cls}")`), `<dialog open$1`);
const lxdRoot = { key: "lxd", items: [
  { key: "primary", items: [{ url: "#instances", label: "Instances", icon: "containers" }, { url: "#profiles", label: "Profiles", icon: "profiles" }] },
  { key: "networking", label: "Networking", items: [{ url: "#networks", label: "Networks", icon: "connected" }, { url: "#acls", label: "ACLs", icon: "locked" }, { url: "#ipam", label: "IPAM", icon: "code" }] },
  { key: "storage", label: "Storage", items: [{ url: "#pools", label: "Pools", icon: "pods" }, { url: "#volumes", label: "Volumes", icon: "bundle" }, { url: "#buckets", label: "Buckets", icon: "archive" }] } ] };
const lxdFooter = { key: "lxd-footer", items: [{ label: "admin", icon: "user" }, { url: "#docs", label: "Documentation", icon: "book" }, { label: "Report a bug", icon: "bug", control: "button" }, { label: "Log out", icon: "log-out", control: "button" }] };
const ICONS = "node_modules/@canonical/ds-assets/icons/";
const inlineIcons = (html: string) => html.replace(/<use href="\/icons\/([a-z0-9-]+)\.svg#\1"><\/use>/g, (m, name) => { const p = ICONS + name + ".svg"; if (!existsSync(p)) return ""; return readFileSync(p, "utf-8").replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").replace(/<g id="[^"]*">/, "<g>"); });
const r = (el: any) => inlineIcons(renderToStaticMarkup(el));
const safe = (name: string, fn: () => string) => { try { return fn(); } catch (e) { console.error("FAILED", name, String(e).slice(0, 160)); return ""; } };
const Actions = ({ children }: any) => <div className="actions">{children}</div>;
const comps: any[] = [
  { key: "page-header", title: "Page header", uses: ["Breadcrumbs", "Tabs", "Button", "Badge"], size: 4, html: safe("page-header", () => r(<div className="stack-v">
    <Breadcrumbs items={[{ label: "Projects", url: "#" }, { label: "default", url: "#" }, { label: "Instances", url: "#", current: true }]} />
    <div className="titlebar"><div><h2 className="h2">Instances <Badge value={132} /></h2><p className="muted">128 running · 4 stopped · last change 2 minutes ago</p></div><Actions><Button importance="secondary" icon="settings">Settings</Button><Button importance="primary" icon="plus">Create instance</Button></Actions></div>
    <Tabs aria-label="Sections" navigationRoot={{ label: "root", items: [{ label: "All", url: "#all" }, { label: "Running", url: "#running" }, { label: "Stopped", url: "#stopped" }, { label: "Snapshots", url: "#snapshots" }, { label: "Logs", url: "#logs" }] }} currentUrl="#running" />
  </div>)) },
  { key: "create-form", title: "Create an instance", uses: ["TextField", "SelectField", "ChoicesField", "RangeField", "SwitchField", "CheckboxField", "TextareaField", "Button"], size: 3, html: safe("create-form", () => r(<Form onSubmit={() => {}}>
    <h3 className="h3">Create an instance</h3>
    <Field inputType="text" name="name" label="Instance name" description="Lowercase letters, digits and dashes." defaultValue="web-01" />
    <Field inputType="select" name="image" label="Image" defaultValue="noble" options={[{ label: "Ubuntu 24.04 LTS", value: "noble" }, { label: "Ubuntu 22.04 LTS", value: "jammy" }, { label: "Ubuntu Core 24", value: "core24" }]} />
    <Field inputType="choices" name="arch" label="Architecture" defaultValue="amd64" options={[{ label: "amd64", value: "amd64" }, { label: "arm64", value: "arm64" }]} />
    <Field inputType="range" name="memory" label="Memory (GB)" min={1} max={64} defaultValue={8} />
    <Field inputType="switch" name="autostart" label="Autostart" controlLabel="Start with the host" defaultChecked isOptional />
    <Field inputType="checkbox" name="ephemeral" label="Lifecycle" controlLabel="Ephemeral: delete when stopped" isOptional />
    <Field inputType="textarea" name="description" label="Description" defaultValue="Front-end web server for the staging environment." isOptional />
    <Actions><Button importance="tertiary">Cancel</Button><Button importance="primary" icon="plus">Create</Button></Actions>
  </Form>)) },
  { key: "sign-in", title: "Sign in", uses: ["TextField", "PasswordField", "CheckboxField", "Button", "Link"], size: 2, html: safe("sign-in", () => r(<Form onSubmit={() => {}}>
    <h3 className="h3">Sign in to Landscape</h3>
    <Field inputType="email" name="email" label="Email" defaultValue="alice@example.com" />
    <Field inputType="password" name="password" label="Password" defaultValue="correct-horse-battery" />
    <Field inputType="checkbox" name="remember" controlLabel="Keep me signed in" defaultChecked isOptional />
    <Actions><Button importance="primary" type="submit">Sign in</Button><Link href="#">Forgot your password?</Link></Actions>
  </Form>)) },
  { key: "status-tiles", title: "Status overview", uses: ["Tile", "Badge", "InlineCode"], size: 4, html: safe("status-tiles", () => r(<div className="tiles-3">
    <Tile><Tile.Header>Instances</Tile.Header><Tile.Content><p className="big">128</p><p className="row">running · <Badge value={4} criticality="warning" /> stopped</p></Tile.Content></Tile>
    <Tile><Tile.Header>Storage</Tile.Header><Tile.Content><p className="big">2.4 TB</p><p>of 4 TB used on <InlineCode>zfs</InlineCode></p></Tile.Content></Tile>
    <Tile><Tile.Header>Alerts</Tile.Header><Tile.Content><p className="big">2</p><p className="row">open <Badge value={2} criticality="error" /></p></Tile.Content></Tile>
  </div>)) },
  { key: "release-cards", title: "Releases", uses: ["Card", "Button"], size: 4, html: safe("release-cards", () => r(<div className="cards-2">
    <Card><Card.Header>Ubuntu 24.04 LTS</Card.Header><Card.Content><p>Noble Numbat. Five years of security updates, ten with Ubuntu Pro.</p><p className="muted">Stable · kernel 6.8</p></Card.Content><Card.Footer><Button importance="secondary">Release notes</Button><Button importance="primary" icon="plus">Launch</Button></Card.Footer></Card>
    <Card><Card.Header>Ubuntu 25.10</Card.Header><Card.Content><p>Questing Quokka. Interim release with nine months of support.</p><p className="muted">Beta · kernel 6.17</p></Card.Content><Card.Footer><Button importance="secondary">Release notes</Button><Button importance="primary" icon="plus">Launch</Button></Card.Footer></Card>
  </div>)) },
  { key: "activity", title: "Activity", uses: ["Timeline", "InlineCode"], size: 2, html: safe("activity", () => r(<div><h3 className="h3">Activity</h3><Timeline><Timeline.Content>
    <Timeline.Event actor="Alice" datetime="2 min ago" criticality="success">Started <InlineCode>web-01</InlineCode></Timeline.Event>
    <Timeline.Event actor="Scheduler" datetime="14 min ago">Snapshot <InlineCode>nightly-2026-10-21</InlineCode> taken</Timeline.Event>
    <Timeline.Event actor="Monitor" datetime="1 h ago" criticality="warning">Disk on <InlineCode>db-02</InlineCode> at 85%</Timeline.Event>
    <Timeline.Event actor="Bob" datetime="yesterday">Profile <InlineCode>gpu</InlineCode> updated</Timeline.Event>
    <Timeline.Event actor="Monitor" datetime="2 days ago" criticality="error">Instance <InlineCode>cache-01</InlineCode> failed to start</Timeline.Event>
  </Timeline.Content></Timeline></div>)) },
  { key: "settings", title: "Settings", uses: ["Accordion", "SwitchField", "SelectField", "NumberField", "Button"], size: 3, html: safe("settings", () => r(<Form onSubmit={() => {}}><h3 className="h3">Project settings</h3><Accordion>
    <Accordion.Item heading="Networking" expanded><Field inputType="select" name="bridge" label="Default bridge" defaultValue="lxdbr0" options={[{ label: "lxdbr0", value: "lxdbr0" }, { label: "ovn-1", value: "ovn-1" }]} /><Field inputType="switch" name="ipv6" label="IPv6" controlLabel="Enable IPv6 NAT" defaultChecked isOptional /></Accordion.Item>
    <Accordion.Item heading="Limits"><Field inputType="number" name="maxInstances" label="Maximum instances" defaultValue={50} /></Accordion.Item>
    <Accordion.Item heading="Backups"><Field inputType="switch" name="backups" label="Nightly snapshots" controlLabel="Enabled" defaultChecked isOptional /></Accordion.Item>
  </Accordion><Actions><Button importance="tertiary">Discard</Button><Button importance="primary">Save changes</Button></Actions></Form>)) },
  { key: "shortcuts", title: "Keyboard shortcuts", uses: ["KeyboardKey"], size: 2, html: safe("shortcuts", () => r(<div><h3 className="h3">Keyboard shortcuts</h3><dl className="keys">{[["Search", ["Ctrl", "K"]], ["New instance", ["Ctrl", "N"]], ["Save", ["Ctrl", "S"]], ["Toggle sidebar", ["Ctrl", "B"]], ["Help", ["?"]]].map(([a, ks]: any) => <React.Fragment key={a}><dt>{a}</dt><dd>{ks.map((k: string, i: number) => <React.Fragment key={k}>{i ? " + " : ""}<KeyboardKey keyValue={k as any} /></React.Fragment>)}</dd></React.Fragment>)}</dl></div>)) },
  { key: "feedback", title: "Feedback", uses: ["RatingField", "TextareaField", "Button"], size: 2, html: safe("feedback", () => r(<Form onSubmit={() => {}}><h3 className="h3">How was the migration guide?</h3><Field inputType="rating" name="rating" label="Rating" defaultValue={4} /><Field inputType="textarea" name="comment" label="Comment" isOptional defaultValue="Clear steps, but the token table could use a search box." /><Actions><Button importance="primary">Send feedback</Button></Actions></Form>)) },
  { key: "maintenance", title: "Schedule maintenance", uses: ["DateField", "TimeField", "PhoneField", "Button"], size: 2, html: safe("maintenance", () => r(<Form onSubmit={() => {}}><h3 className="h3">Schedule maintenance</h3><Field inputType="date" name="date" label="Date" defaultValue="2026-11-03" /><Field inputType="time" name="time" label="Start time" defaultValue="02:00" /><Field inputType="phone" name="phone" label="On-call phone" defaultValue="+44 20 7946 0958" /><Actions><Button importance="primary" anticipation="caution">Schedule</Button></Actions></Form>)) },
  { key: "danger", title: "Danger zone", uses: ["Button"], size: 2, html: safe("danger", () => r(<div><h3 className="h3">Danger zone</h3><p className="muted">These actions cannot be undone.</p><div className="row"><Button importance="secondary" anticipation="destructive">Stop all instances</Button><Button importance="primary" anticipation="destructive" icon="delete">Delete project</Button></div><p className="muted small">Deleting a project removes its 132 instances and 2.4 TB of storage.</p></div>)) },
  { key: "empty", title: "Empty state", uses: ["Tile", "Button", "Icon"], size: 2, html: safe("empty", () => r(<Tile><Tile.Header>No snapshots yet</Tile.Header><Tile.Content><p>Snapshots let you roll an instance back to a known state.</p><Actions><Button importance="primary" icon="plus">Take a snapshot</Button><Button variant="link">Learn more</Button></Actions></Tile.Content></Tile>)) },
  { key: "app-shell", title: "Application shell", uses: ["ApplicationLayout", "SideNavigation", "Breadcrumbs", "Button", "Badge", "Tile"], size: 4, screen: 720, html: safe("app-shell", () => r(<ApplicationLayout navigation={<SideNavigation brand={<CanonicalLogo />} applicationName="LXD" root={lxdRoot} footerRoot={lxdFooter} currentUrl="#instances" />}>
    <div className="screen-main stack-v"><Breadcrumbs items={[{ label: "default", url: "#" }, { label: "Instances", url: "#", current: true }]} />
      <div className="titlebar"><h2 className="h2">Instances <Badge value={132} /></h2><Actions><Button importance="primary" icon="plus">Create instance</Button></Actions></div>
      <div className="tiles-3"><Tile><Tile.Header>Running</Tile.Header><Tile.Content><p className="big">128</p></Tile.Content></Tile><Tile><Tile.Header>Stopped</Tile.Header><Tile.Content><p className="big">4</p></Tile.Content></Tile><Tile><Tile.Header>Storage</Tile.Header><Tile.Content><p className="big">2.4 TB</p><p>of 4 TB</p></Tile.Content></Tile></div>
    </div></ApplicationLayout>)) },
  { key: "side-panel", title: "Side panel", uses: ["SidePanel", "Breadcrumbs", "Tile", "TextField", "SelectField", "CheckboxField", "TextareaField", "Button"], size: 4, screen: 620, html: safe("side-panel", () => r(<div className="screen-backdrop stack-v"><Breadcrumbs items={[{ label: "default", url: "#" }, { label: "Instances", url: "#", current: true }]} /><div className="titlebar"><h2 className="h2">Instances <Badge value={132} /></h2></div><div className="tiles-3 narrow">{["web-01", "web-02", "db-01", "db-02", "cache-01", "worker-01"].map(n => <Tile key={n}><Tile.Header>{n}</Tile.Header><Tile.Content><p className="muted">Running · 24.04</p></Tile.Content></Tile>)}</div></div>) + open(r(<SidePanel ref={React.createRef()}><SidePanel.Header>Create instance</SidePanel.Header><SidePanel.Content><Form id="create-instance" onSubmit={() => {}}>
      <Field name="instance_name" inputType="text" label="Instance name" defaultValue="web-02" />
      <Field name="release" inputType="select" label="Ubuntu release" defaultValue="noble" options={[{ value: "noble", label: "Ubuntu 24.04 LTS (Noble Numbat)" }, { value: "jammy", label: "Ubuntu 22.04 LTS (Jammy Jellyfish)" }, { value: "focal", label: "Ubuntu 20.04 LTS (Focal Fossa)" }]} />
      <Field name="enable_pro" inputType="checkbox" controlLabel="Enable Ubuntu Pro" isOptional defaultChecked />
      <Field name="cloud_init" inputType="textarea" label="Cloud-init user data" isOptional defaultValue={"#cloud-config\npackages:\n  - nginx"} />
    </Form></SidePanel.Content><SidePanel.Footer><Button>Cancel</Button><Button importance="primary" anticipation="constructive" type="submit" form="create-instance">Create instance</Button></SidePanel.Footer></SidePanel>), "side-panel")) },
  { key: "modal", title: "Modal", uses: ["Modal", "Button", "InlineCode"], size: 3, screen: 360, html: safe("modal", () => `<div class="screen-scrim"></div>` + open(r(<Modal ref={React.createRef()}><Modal.Header>Delete instance?</Modal.Header><Modal.Content><p>This permanently deletes <InlineCode>cache-01</InlineCode> and its 3 snapshots. This cannot be undone.</p></Modal.Content><Modal.Footer><Button importance="tertiary">Cancel</Button><Button importance="primary" anticipation="destructive" icon="delete">Delete</Button></Modal.Footer></Modal>), "modal")) },
].filter(c => c.html);
writeFileSync("/home/user/graph-atlas/data/compositions.json", JSON.stringify(comps));
for (const c of comps) console.log(c.key.padEnd(14), c.size, c.html.length, /value="web-01"|checked=""|selected=""|value="4"/.test(c.html) ? "prefilled" : "");
