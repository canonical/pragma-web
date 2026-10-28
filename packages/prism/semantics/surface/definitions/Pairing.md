# Pairing

A [Pairing](surface:Pairing) is the edge between a [job](surface:Job) and a
[surface](surface:Surface), made a node so that it can carry what the edge
means: its [role](surface:PairingRole), primary or secondary, and its
[arrival](surface:Preservation), what the consumer keeps when they reach the
surface for this job.

Arrivals are ordered by the cost of reorienting: a
[cold entry](surface:cold_entry) keeps nothing, a
[subject kept](surface:subject_kept) arrival keeps the entity in view, a
[view kept](surface:view_kept) arrival keeps the whole view, and
[no move](surface:no_move) is reached in place. A pairing to a
[port](surface:Port) carries no arrival: a machine consumer has nothing to
reorient.

The set of a job's pairings answers whether the job is served and at what
cost, which is what the journeys view of a documentation site shows.
