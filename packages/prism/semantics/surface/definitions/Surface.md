# Surface

A [Surface](surface:Surface) is a place where a consumer meets the substrate.
Its nature is carried by three dimensions, rendering, direction and
anchoring, and the named cells of that space are the idioms, each a
subclass:

- A [lens](surface:Lens) is a standalone way of looking at the substrate, such
  as a catalogue of components.
- A [detail](surface:Detail) is one entity in depth, such as a component page.
- A [peek](surface:Peek) is a preview passed through, such as a command
  palette.
- A [mechanism](surface:Mechanism) is woven through every other surface, such
  as the chips that link a name to its entity.
- An [editor](surface:Editor) is a place to write against the substrate at
  large, such as a playground.
- A [port](surface:Port) is where machine consumers call instead of look.

A curated surface [composes](surface:composes) a layout of the design system,
such as the [ApplicationLayout](ds:apps.layout.application_layout), and the
layout's [slots](surface:Slot) say which regions it shows.
