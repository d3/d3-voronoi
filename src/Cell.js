import {createHalfedge, sortHalfedges, halfedgeStart, halfedgeEnd} from "./Halfedge";
import {createBorderEdge} from "./Edge";
import {cells, epsilon} from "./voronoi";

function Cell(site) {
  this.site = site;
  this.halfedges = [];
}

export function createCell(site) {
  return cells[site.index] = new Cell(site);
};

export function cleanCells() {
  var iCell = cells.length,
      cell;

  while (iCell--) {
    cell = cells[iCell];
    if (cell) sortHalfedges(cell.halfedges);
  }
};

export function closeCells(x0, y0, x1, y1) {
  var x2,
      y2,
      x3,
      y3,
      iCell = cells.length,
      cell,
      iHalfedge,
      halfedges,
      nHalfedges,
      edge,
      start,
      end;

  while (iCell--) {
    cell = cells[iCell];
    if (!cell) continue;
    halfedges = cell.halfedges;
    iHalfedge = halfedges.length;

    // Remove any dangling edges.
    while (iHalfedge--) {
      edge = halfedges[iHalfedge].edge;
      if (!edge[1] || !edge[0]) {
        halfedges.splice(iHalfedge, 1);
      }
    }

    sortHalfedges(halfedges);
    nHalfedges = halfedges.length;
    iHalfedge = 0;

    while (iHalfedge < nHalfedges) {
      end = halfedgeEnd(halfedges[iHalfedge]), x3 = end[0], y3 = end[1];
      start = halfedgeStart(halfedges[++iHalfedge % nHalfedges]), x2 = start[0], y2 = start[1];
      if (Math.abs(x3 - x2) > epsilon || Math.abs(y3 - y2) > epsilon) {
        halfedges.splice(iHalfedge, 0, createHalfedge(createBorderEdge(cell.site, end,
            Math.abs(x3 - x0) < epsilon && y1 - y3 > epsilon ? [x0, Math.abs(x2 - x0) < epsilon ? y2 : y1]
            : Math.abs(y3 - y1) < epsilon && x1 - x3 > epsilon ? [Math.abs(y2 - y1) < epsilon ? x2 : x1, y1]
            : Math.abs(x3 - x1) < epsilon && y3 - y0 > epsilon ? [x1, Math.abs(x2 - x1) < epsilon ? y2 : y0]
            : Math.abs(y3 - y0) < epsilon && x3 - x0 > epsilon ? [Math.abs(y2 - y0) < epsilon ? x2 : x0, y0]
            : null), cell.site));
        ++nHalfedges;
      }
    }
  }
};
