# Coordinate

A [Coordinate](surface:Coordinate) is a region of demand space, on three
axes: the [actor](surface:Actor) (a human or an agent), the
[role](surface:Role) and the [fluency](surface:Fluency). An axis left empty
matches any value.

Jobs and personas share this one type. A job's
[coordinates](surface:coordinates) say who has it; a persona's
[region](surface:region) says which consumers it stands for. Which jobs a
persona has is never stored: it is derived by comparing the two regions axis
by axis.
