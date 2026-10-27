/**
 * The fleet lens: the rolling stock, its formations, units and car types,
 * their side views and their fit at the platforms, and the projections that
 * render each fleet type in every form, which the site's slots arm. The site's route table
 * groups the lens's routes under its layout; each route's `warm` is its one
 * seam to the data layer.
 *
 * @module
 */

export { fleetLayout } from "./layout.js";
export {
  CarTypeCard,
  CarTypeChip,
  CarTypeCommand,
  CarTypeGraphNode,
  CarTypeRow,
  FormationCard,
  FormationChip,
  FormationCommand,
  FormationGraphNode,
  FormationRow,
  RollingStockCard,
  RollingStockChip,
  RollingStockCommand,
  RollingStockGraphNode,
  RollingStockRow,
  UnitCard,
  UnitChip,
  UnitCommand,
  UnitGraphNode,
  UnitRow,
} from "./lib/index.js";
export { fleetRoutes } from "./routes.js";
