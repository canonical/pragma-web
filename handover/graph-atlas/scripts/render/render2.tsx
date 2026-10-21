import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import * as G from "@canonical/react-ds-global";
import * as F from "@canonical/react-ds-global-form";
const { Button, Badge, Chip, Breadcrumbs, Tabs, Tile, Card, Accordion, Timeline, KeyboardKey, InlineCode, Spinner, Label, Link, Tooltip, Rule, Icon, ContextualMenu, Popover } = G as any;
const { Form, Field } = F as any;
const ICONS = "node_modules/@canonical/ds-assets/icons/";
const inlineIcons = (html: string) => html.replace(/<use href="\/icons\/([a-z0-9-]+)\.svg#\1"><\/use>/g, (m, name) => { const p = ICONS + name + ".svg"; if (!existsSync(p)) return ""; const svg = readFileSync(p, "utf-8"); return svg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").replace(/<g id="[^"]*">/, "<g>"); });
const r = (el: any) => inlineIcons(renderToStaticMarkup(el));
const form = (el: any) => r(<Form onSubmit={() => {}}>{el}</Form>);
// frames: name in the graph, grain, size class (columns), the real markup
const frames: any[] = [
  { name: "Button", size: 2, html: r(<div className="row"><Button importance="primary" icon="plus">Create</Button><Button importance="secondary">Cancel</Button><Button importance="tertiary">More</Button><Button importance="primary" anticipation="destructive">Delete</Button></div>) },
  { name: "Button", key: "button-states", title: "Button · states", size: 2, html: r(<div className="row"><Button importance="secondary" loading>Saving</Button><Button importance="primary" disabled>Disabled</Button><Button importance="secondary" icon="settings" aria-label="Settings" /><Button variant="link">Link</Button></div>) },
  { name: "Badge", size: 1, html: r(<div className="row"><Badge value={3} /><Badge value={12} criticality="information" /><Badge value={48} criticality="success" /><Badge value={7} criticality="warning" /><Badge value={1024} criticality="error" /></div>) },
  { name: "KeyboardKey", size: 1, html: r(<div className="row">{["Ctrl", "Shift", "K"].map(k => <KeyboardKey key={k} keyValue={k as any} />)}</div>) },
  { name: "InlineCode", size: 1, html: r(<p>Run <InlineCode>pragma doctor</InlineCode> first.</p>) },
  { name: "Spinner", size: 1, html: r(<div className="row"><Spinner /><Spinner /><Spinner /></div>) },
  { name: "Icon", size: 2, html: r(<div className="row icons">{["plus", "settings", "delete", "search", "user", "warning", "error", "success", "information", "chevron-down", "arrow-left", "arrow-right", "close", "copy", "edit", "external-link"].map(i => <Icon key={i} icon={i} />)}</div>) },
  { name: "Link", size: 1, html: r(<p><Link href="#">Read the guideline</Link></p>) },
  { name: "Tooltip", size: 1, html: r(<Tooltip isOpen>Explains the action</Tooltip>) },
  { name: "Rule", size: 2, html: r(<div><p style={{ margin: 0 }}>Above the rule</p><Rule /><p style={{ margin: 0 }}>Below the rule</p></div>) },
  { name: "Breadcrumbs", size: 2, html: r(<Breadcrumbs items={[{ label: "Instances", url: "#" }, { label: "lxd-prod-01", url: "#" }, { label: "Storage", url: "#", current: true }]} />) },
  { name: "Tabs", size: 3, html: r(<Tabs aria-label="Sections" navigationRoot={{ label: "root", items: [{ label: "Overview", url: "#overview" }, { label: "Configuration", url: "#config" }, { label: "Snapshots", url: "#snapshots" }, { label: "Logs", url: "#logs" }] }} currentUrl="#overview" />) },
  { name: "Tile", size: 2, html: r(<Tile><Tile.Header>Storage pool</Tile.Header><Tile.Content><p>Default pool on <InlineCode>zfs</InlineCode>, 2.4 TB used of 4 TB.</p><p>Alerts <Badge value={3} criticality="warning" /></p></Tile.Content></Tile>) },
  { name: "Card", size: 2, html: r(<Card><Card.Header>Ubuntu 24.04 LTS</Card.Header><Card.Content>Long-term support release with five years of security updates.</Card.Content><Card.Footer><Button importance="secondary">Details</Button><Button importance="primary" icon="plus">Launch</Button></Card.Footer></Card>) },
  { name: "Accordion", size: 2, html: r(<Accordion><Accordion.Item heading="Networking" expanded>Bridge <InlineCode>lxdbr0</InlineCode> with IPv4 and IPv6 NAT.</Accordion.Item><Accordion.Item heading="Storage">Two pools: default (zfs) and backups (dir).</Accordion.Item><Accordion.Item heading="Profiles">default, gpu, nested</Accordion.Item></Accordion>) },
  { name: "Timeline", size: 2, html: r(<Timeline><Timeline.Content><Timeline.Event actor="Alice" datetime="2 min ago" criticality="success">Instance <InlineCode>web-01</InlineCode> started</Timeline.Event><Timeline.Event actor="Scheduler" datetime="14 min ago">Snapshot taken</Timeline.Event><Timeline.Event actor="Monitor" datetime="1 h ago" criticality="warning">Disk at 85%</Timeline.Event></Timeline.Content></Timeline>) },
  { name: "TextField", size: 2, html: form(<Field inputType="text" name="name" label="Instance name" description="Lowercase letters, digits and dashes." />) },
  { name: "SelectField", size: 2, html: form(<Field inputType="select" name="image" label="Image" options={[{ label: "Ubuntu 24.04 LTS", value: "noble" }, { label: "Ubuntu 22.04 LTS", value: "jammy" }]} />) },
  { name: "CheckboxField", size: 2, html: form(<Field inputType="checkbox" name="ephemeral" label="Ephemeral" controlLabel="Delete when stopped" />) },
  { name: "SwitchField", size: 2, html: form(<Field inputType="switch" name="autostart" label="Autostart" controlLabel="Start with the host" />) },
  { name: "RangeField", size: 2, html: form(<Field inputType="range" name="cpu" label="CPU limit" min={1} max={16} />) },
  { name: "PasswordField", size: 2, html: form(<Field inputType="password" name="pw" label="Password" />) },
  { name: "TextareaField", size: 2, html: form(<Field inputType="textarea" name="notes" label="Notes" description="Optional" />) },
  { name: "ChoicesField", size: 2, html: (() => { try { return form(<Field inputType="choices" name="arch" label="Architecture" options={[{ label: "amd64", value: "amd64" }, { label: "arm64", value: "arm64" }]} />); } catch (e) { console.error("choices", String(e).slice(0, 100)); return ""; } })() },
  { name: "RatingField", size: 2, html: (() => { try { return form(<Field inputType="rating" name="rating" label="Rating" />); } catch (e) { console.error("rating", String(e).slice(0, 100)); return ""; } })() },
].filter(f => f.html);
writeFileSync("/home/user/graph-atlas/data/frames.json", JSON.stringify(frames));
for (const f of frames) console.log((f.key || f.name).padEnd(16), f.size, f.html.length);
