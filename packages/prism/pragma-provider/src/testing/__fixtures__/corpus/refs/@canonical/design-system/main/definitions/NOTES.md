Not a `.ttl`, and therefore not a source. Real refs packages carry READMEs,
JSON manifests and lockfiles alongside their Turtle; the Turtle collector must
ignore every one of them by extension rather than by luck.

It is a `.md`, though, so it is collected as a prose sidecar, and its name
names no entity in the graph: the provider binds it to nothing and says so.
