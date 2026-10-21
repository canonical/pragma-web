import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
const OUT = "/home/user/graph-atlas/data";
const PRAGMA = "/root/.local/bin/pragma";
function q(sparql: string): Record<string, string>[] {
  const r = spawnSync(PRAGMA, ["graph", "query", sparql, "--format", "json"], { encoding: "utf-8", maxBuffer: 1 << 28, cwd: "/home/user" });
  if (r.status !== 0) { console.error("QUERY FAILED", sparql, r.stderr, r.stdout.slice(0, 500)); return []; }
  try { const j = JSON.parse(r.stdout); return j.data?.bindings ?? []; } catch (e) { console.error("PARSE FAILED", sparql, r.stdout.slice(0, 300)); return []; }
}
const t0 = Date.now();
const out: Record<string, unknown> = {};
const save = (name: string, data: unknown) => { writeFileSync(`${OUT}/${name}.json`, JSON.stringify(data)); console.log(name, "saved", Date.now() - t0, "ms"); };

// ---- overview
const classes = q("SELECT ?c (COUNT(?s) AS ?n) WHERE { ?s a ?c } GROUP BY ?c ORDER BY DESC(?n)");
const predicates = q("SELECT ?p (COUNT(*) AS ?n) (COUNT(DISTINCT ?s) AS ?subjects) (SUM(IF(isLiteral(?o),1,0)) AS ?literals) WHERE { ?s ?p ?o } GROUP BY ?p ORDER BY DESC(?n)");
const subjNs = q("SELECT ?ns (COUNT(*) AS ?n) WHERE { ?s ?p ?o . BIND(IF(isBlank(?s), 'blank', REPLACE(STR(?s), '^(https?://[^/]+/).*$', '$1')) AS ?ns) } GROUP BY ?ns ORDER BY DESC(?n)");
const predNs = q("SELECT ?ns (COUNT(*) AS ?n) WHERE { ?s ?p ?o . BIND(REPLACE(STR(?p), '^(https?://[^/#]+[/#]).*$', '$1') AS ?ns) } GROUP BY ?ns ORDER BY DESC(?n)");
const objKinds = q("SELECT (SUM(IF(isLiteral(?o),1,0)) AS ?literal) (SUM(IF(isBlank(?o),1,0)) AS ?blank) (SUM(IF(isIRI(?o),1,0)) AS ?iri) (SUM(IF(isBlank(?s),1,0)) AS ?blankSubject) (COUNT(*) AS ?total) WHERE { ?s ?p ?o }");
const entities = q("SELECT (COUNT(DISTINCT ?s) AS ?n) WHERE { ?s ?p ?o FILTER(isIRI(?s)) }");
const classNsPack = q("SELECT ?c (COUNT(?s) AS ?n) (SUM(IF(isBlank(?s),1,0)) AS ?blank) WHERE { ?s a ?c } GROUP BY ?c");
save("overview", { classes, predicates, subjNs, predNs, objKinds: objKinds[0], entities: entities[0], classNsPack });

// ---- schema
const owlClasses = q("SELECT ?c ?label ?comment ?parent WHERE { ?c a owl:Class FILTER(isIRI(?c)) OPTIONAL { ?c rdfs:label ?label } OPTIONAL { ?c rdfs:comment ?comment } OPTIONAL { ?c rdfs:subClassOf ?parent FILTER(isIRI(?parent)) } }");
const objProps = q("SELECT ?p ?label ?domain ?range ?comment WHERE { ?p a owl:ObjectProperty . OPTIONAL { ?p rdfs:label ?label } OPTIONAL { ?p rdfs:domain ?domain } OPTIONAL { ?p rdfs:range ?range } OPTIONAL { ?p rdfs:comment ?comment } }");
const dataProps = q("SELECT ?p ?label ?domain ?range WHERE { ?p a owl:DatatypeProperty . OPTIONAL { ?p rdfs:label ?label } OPTIONAL { ?p rdfs:domain ?domain } OPTIONAL { ?p rdfs:range ?range } }");
const propUse = q("SELECT ?p (COUNT(*) AS ?n) WHERE { ?s ?p ?o } GROUP BY ?p");
const shapes = q("SELECT ?shape ?target (COUNT(?prop) AS ?props) WHERE { ?shape a sh:NodeShape . OPTIONAL { ?shape sh:targetClass ?target } OPTIONAL { ?shape sh:property ?prop } } GROUP BY ?shape ?target");
// observed class-to-class edges (instance level) : subject class, predicate, object class
const classEdges = q("SELECT ?sc ?p ?oc (COUNT(*) AS ?n) WHERE { ?s ?p ?o . ?s a ?sc . ?o a ?oc . FILTER(?p != rdf:type) } GROUP BY ?sc ?p ?oc ORDER BY DESC(?n)");
save("schema", { owlClasses, objProps, dataProps, propUse, shapes, classEdges });

// ---- tiers & blocks
const tiers = q("SELECT ?t ?name ?summary WHERE { ?t a ds:Tier . OPTIONAL { ?t ds:name ?name } OPTIONAL { ?t ds:summary ?summary } }");
const blocks = q(`SELECT ?b ?name ?class ?tier ?stage ?summary (COUNT(DISTINCT ?prop) AS ?props) (COUNT(DISTINCT ?bind) AS ?bindings) (COUNT(DISTINCT ?impl) AS ?impls) (COUNT(DISTINCT ?sub) AS ?subs) (GROUP_CONCAT(DISTINCT ?fam; separator='|') AS ?families) (GROUP_CONCAT(DISTINCT ?parent; separator='|') AS ?parents)
WHERE { VALUES ?class { ds:Component ds:Subcomponent ds:Pattern ds:Layout ds:View ds:Group ds:Variant } ?b a ?class . OPTIONAL { ?b ds:name ?name } OPTIONAL { ?b ds:tier ?tier } OPTIONAL { ?b ds:documentationStage ?stage } OPTIONAL { ?b ds:summary ?summary } OPTIONAL { ?b ds:hasProperty ?prop } OPTIONAL { ?bind ds:viaBlock ?b } OPTIONAL { ?impl ds:implementsBlock ?b } OPTIONAL { ?b ds:hasSubcomponent ?sub } OPTIONAL { ?b ds:hasModifierFamily ?fam } OPTIONAL { ?b ds:parentComponent ?parent } }
GROUP BY ?b ?name ?class ?tier ?stage ?summary`);
const blockLinks = q("SELECT ?s ?p ?o WHERE { VALUES ?p { ds:hasSubcomponent ds:inheritsFrom ds:specializedBy ds:variantOf ds:hasVariant ds:parentComponent } ?s ?p ?o }");
const anatomyDsl = q("SELECT ?b ?dsl WHERE { ?b ds:anatomyDsl ?dsl }");
const tags = q("SELECT ?tag ?name ?cat ?catName (COUNT(?b) AS ?n) WHERE { ?tag a ds:Tag . OPTIONAL { ?tag ds:name ?name } OPTIONAL { ?tag ds:category ?cat . OPTIONAL { ?cat ds:name ?catName } } OPTIONAL { ?b ds:documentationStage ?tag } } GROUP BY ?tag ?name ?cat ?catName");
const modifiers = q("SELECT ?fam ?famName ?m ?mName WHERE { ?fam a ds:ModifierFamily . OPTIONAL { ?fam ds:name ?famName } OPTIONAL { ?fam ds:hasModifier ?m . OPTIONAL { ?m ds:name ?mName } } }");
const concepts = q("SELECT ?c ?name ?type ?typeName ?summary WHERE { ?c a ds:Concept . OPTIONAL { ?c ds:name ?name } OPTIONAL { ?c ds:conceptType ?type . OPTIONAL { ?type ds:name ?typeName } } OPTIONAL { ?c ds:summary ?summary } }");
const props = q("SELECT ?b ?pname ?ptype ?optional WHERE { ?b ds:hasProperty ?p . OPTIONAL { ?p ds:name ?pname } OPTIONAL { ?p ds:propertyType ?ptype } OPTIONAL { ?p ds:optional ?optional } }");
const changelog = q("SELECT ?b ?ts ?type ?change WHERE { ?b ds:changeLog ?e . ?e ds:timestamp ?ts . OPTIONAL { ?e ds:changeType ?type } OPTIONAL { ?e ds:change ?change } }");
save("blocks", { tiers, blocks, blockLinks, anatomyDsl: anatomyDsl.map(r => ({ b: r.b, lines: (r.dsl || "").split("\n").length, nodes: ((r.dsl || "").match(/\bnode:/g) || []).length, edges: ((r.dsl || "").match(/\brelation:/g) || []).length })), tags, modifiers, concepts, props, changelog });

// ---- bindings
const bindings = q("SELECT ?block ?node ?key ?state ?sym ?rank WHERE { ?x a ds:TokenBinding ; ds:viaBlock ?block ; ds:consumesSymbol ?sym . OPTIONAL { ?x ds:node ?node } OPTIONAL { ?x anatomy:styleKey ?key } OPTIONAL { ?x anatomy:styleState ?state } OPTIONAL { ?x ds:rank ?rank } }");
const styleKeys = q("SELECT ?k ?kind (GROUP_CONCAT(?ns; separator='|') AS ?namespaces) WHERE { ?k a anatomy:StyleKey . OPTIONAL { ?k anatomy:valueKind ?kind } OPTIONAL { ?k anatomy:tokenNamespace ?ns } } GROUP BY ?k ?kind");
save("bindings", { bindings, styleKeys });

// ---- tokens
const files = q("SELECT ?f (COUNT(?t) AS ?tokens) WHERE { ?t a w3c-tokens:Token ; w3c-tokens:inFile ?f } GROUP BY ?f ORDER BY DESC(?tokens)");
const symbols = q("SELECT ?s ?name ?type (COUNT(DISTINCT ?t) AS ?defs) (COUNT(DISTINCT ?v) AS ?vars) (COUNT(DISTINCT ?rv) AS ?resolved) (COUNT(DISTINCT ?b) AS ?consumers) (GROUP_CONCAT(DISTINCT ?f; separator='|') AS ?files) WHERE { ?s a dt:TokenSymbol . OPTIONAL { ?s rdfs:label ?name } OPTIONAL { ?t dt:symbol ?s . OPTIONAL { ?t dt:tokenType ?type } OPTIONAL { ?t w3c-tokens:inFile ?f } } OPTIONAL { ?v dt:ofSymbol ?s } OPTIONAL { ?rv dt:forSymbol ?s } OPTIONAL { ?b ds:consumesSymbol ?s } } GROUP BY ?s ?name ?type");
const variables = q("SELECT ?v ?name ?tier ?vis ?sym (COUNT(DISTINCT ?d) AS ?decls) (COUNT(DISTINCT ?ref) AS ?refs) WHERE { ?v a dt:Variable . OPTIONAL { ?v rdfs:label ?name } OPTIONAL { ?v dt:tier ?tier } OPTIONAL { ?v dt:visibility ?vis } OPTIONAL { ?v dt:ofSymbol ?sym } OPTIONAL { ?d dt:declaredAt ?v } OPTIONAL { ?v dt:refersTo ?ref } } GROUP BY ?v ?name ?tier ?vis ?sym");
const varDecl = q("SELECT ?p (COUNT(*) AS ?n) WHERE { ?d a dt:Declaration ; ?p ?o } GROUP BY ?p");
const declSample = q("SELECT ?p ?o WHERE { ?d a dt:Declaration ; ?p ?o } LIMIT 12");
const declUnder = q("SELECT ?u (COUNT(?d) AS ?n) WHERE { ?d a dt:Declaration ; dt:under ?u } GROUP BY ?u ORDER BY DESC(?n)");
const declAt = q("SELECT ?a (COUNT(?d) AS ?n) WHERE { ?d a dt:Declaration ; dt:at ?a } GROUP BY ?a ORDER BY DESC(?n)");
const refersTo = q("SELECT ?from ?to WHERE { ?v dt:refersTo ?t . ?v dt:tier ?from . ?t dt:tier ?to }");
const refTierPairs = q("SELECT ?from ?to (COUNT(*) AS ?n) WHERE { ?v dt:refersTo ?t . ?v dt:tier ?from . ?t dt:tier ?to } GROUP BY ?from ?to");
const coordinates = q("SELECT ?c ?label ?family ?contract ?famName WHERE { ?c a dt:Coordinate . OPTIONAL { ?c rdfs:label ?label } OPTIONAL { ?c dt:family ?family . OPTIONAL { ?family ds:name ?famName } } OPTIONAL { ?c dt:contract ?contract } }");
const contracts = q("SELECT ?c ?label ?p ?o WHERE { ?c a dt:Contract ; ?p ?o . OPTIONAL { ?c rdfs:label ?label } }");
const covers = q("SELECT ?fam ?famName (COUNT(?s) AS ?n) WHERE { ?fam dt:covers ?s . OPTIONAL { ?fam ds:name ?famName } } GROUP BY ?fam ?famName");
const coversByType = q("SELECT ?fam ?type (COUNT(DISTINCT ?s) AS ?n) WHERE { ?fam dt:covers ?s . ?t dt:symbol ?s ; dt:tokenType ?type } GROUP BY ?fam ?type");
const resolvedByCoord = q("SELECT ?coord (COUNT(?rv) AS ?n) WHERE { ?rv a dt:ResolvedValue . OPTIONAL { ?rv dt:coordinate ?coord } } GROUP BY ?coord ORDER BY DESC(?n)");
const chainLen = q("SELECT ?len (COUNT(?rv) AS ?n) WHERE { { SELECT ?rv (COUNT(?x) AS ?len) WHERE { ?rv dt:resolutionChain ?l . ?l rdf:rest* ?cell . ?cell rdf:first ?x } GROUP BY ?rv } } GROUP BY ?len ORDER BY ?len");
const symbolRefs = q("SELECT ?a ?b WHERE { ?va dt:ofSymbol ?a ; dt:refersTo ?vb . ?vb dt:ofSymbol ?b . FILTER(?a != ?b) }");
const aliasOf = q("SELECT ?fromTier ?toTier (COUNT(*) AS ?n) WHERE { ?v dt:aliasOf ?t . OPTIONAL { ?v dt:tier ?fromTier } OPTIONAL { ?t dt:tier ?toTier } } GROUP BY ?fromTier ?toTier");
const tokenGroups = q("SELECT ?g ?name (COUNT(?t) AS ?n) WHERE { ?g a w3c-tokens:Group . OPTIONAL { ?g w3c-tokens:name ?name } OPTIONAL { ?t w3c-tokens:inGroup ?g } } GROUP BY ?g ?name");
const resolver = q("SELECT ?ctx ?name ?mod ?modName WHERE { ?ctx a w3c-tokens:ResolverContext . OPTIONAL { ?ctx w3c-tokens:name ?name } OPTIONAL { ?ctx w3c-tokens:modifier ?mod . OPTIONAL { ?mod w3c-tokens:name ?modName } } }");
save("tokens", { files, symbols, variables, varDecl, declSample, declUnder, declAt, refTierPairs, coordinates, contracts, covers, coversByType, resolvedByCoord, chainLen, symbolRefs, aliasOf, tokenGroups, resolver });

// ---- standards
const standards = q("SELECT ?s ?label ?cat ?catLabel ?ext (COUNT(DISTINCT ?do) AS ?dos) (COUNT(DISTINCT ?dont) AS ?donts) (GROUP_CONCAT(DISTINCT ?lang; separator='|') AS ?langs) ?desc WHERE { ?s a cs:CodeStandard . OPTIONAL { ?s rdfs:label ?label } OPTIONAL { ?s cs:hasCategory ?cat . OPTIONAL { ?cat rdfs:label ?catLabel } } OPTIONAL { ?s cs:extends ?ext } OPTIONAL { ?s cs:do ?do } OPTIONAL { ?s cs:dont ?dont } OPTIONAL { ?s cs:do|cs:dont ?ex . ?ex cs:language ?lang } OPTIONAL { ?s cs:description ?desc } } GROUP BY ?s ?label ?cat ?catLabel ?ext ?desc");
const categories = q("SELECT ?c ?label ?broader ?def WHERE { ?c a cs:Category . OPTIONAL { ?c rdfs:label ?label } OPTIONAL { ?c skos:broader ?broader } OPTIONAL { ?c skos:definition ?def } }");
const exLangs = q("SELECT ?lang (COUNT(*) AS ?n) WHERE { ?ex cs:language ?lang } GROUP BY ?lang ORDER BY DESC(?n)");
save("standards", { standards: standards.map(r => ({ ...r, desc: (r.desc || "").slice(0, 400) })), categories, exLangs });

// ---- implementations
const libs = q("SELECT ?l ?name ?framework ?tier ?version ?docs (COUNT(?i) AS ?n) WHERE { ?l a ds:ImplementationLibrary . OPTIONAL { ?l ds:name ?name } OPTIONAL { ?l ds:framework ?framework } OPTIONAL { ?l ds:libraryTier ?tier } OPTIONAL { ?l ds:version ?version } OPTIONAL { ?l ds:documentation ?docs } OPTIONAL { ?i ds:library ?l } } GROUP BY ?l ?name ?framework ?tier ?version ?docs");
const impls = q("SELECT ?i ?block ?head ?versioned ?import ?lib WHERE { ?i a ds:ImplementationObject ; ds:implementsBlock ?block . OPTIONAL { ?i ds:headLink ?head } OPTIONAL { ?i ds:versionedLink ?versioned } OPTIONAL { ?i ds:importStatement ?import } OPTIONAL { ?lib ds:hasImplementation ?i } }");
save("implementations", { libs, impls });

// ---- entity graph (IRI-level)
const nodes = q("SELECT ?s (SAMPLE(?c) AS ?class) (SAMPLE(?lbl) AS ?label) (COUNT(DISTINCT ?o) AS ?outDeg) WHERE { ?s ?p ?o FILTER(isIRI(?s)) OPTIONAL { ?s a ?c } OPTIONAL { ?s ds:name|rdfs:label|w3c-tokens:name ?lbl } } GROUP BY ?s");
const edges = q("SELECT ?s ?p ?o WHERE { ?s ?p ?o FILTER(isIRI(?s) && isIRI(?o) && ?p != rdf:type) }");
save("entities", { nodes, edges });
console.log("done", Date.now() - t0);
