# Journeys

This site's own demand model, read from the graph: each
[job](surface:Job), the [pairings](surface:Pairing) that reach the surfaces
serving it, and the layouts those surfaces compose, as a
[table](ds:global.component.table) or a graph.

It serves the maintainer who [looks for the gaps](dsd:job.m2): a job with no
pairing is unserved, unless it is deferred, like
[retiring a component](dsd:job.m4).
