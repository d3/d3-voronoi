import {createHalfedge, descendingAngle} from "./Halfedge";
import {createBorderEdge} from "./Edge";
import {cells, epsilon} from "./voronoi";

function Cell(site) {
  this.site = site;
  this.halfedges = [];
}

function prepareCell(cell) {
  var halfedges = cell.halfedges,
      iHalfedge = halfedges.length,
      edge;

  while (iHalfedge--) {
    edge = halfedges[iHalfedge].edge;
    if (!edge.b || !edge.a) halfedges.splice(iHalfedge, 1);
  }

  halfedges.sort(descendingAngle);
  return halfedges.length;
}

export function createCell(site) {
  return cells[site.i] = new Cell(site);
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
      start,
      end;

  while (iCell--) {
    cell = cells[iCell];
    if (!cell || !prepareCell(cell)) continue;
    halfedges = cell.halfedges;
    nHalfedges = halfedges.length;
    iHalfedge = 0;
    while (iHalfedge < nHalfedges) {
      end = halfedges[iHalfedge].end(), x3 = end.x, y3 = end.y;
      start = halfedges[++iHalfedge % nHalfedges].start(), x2 = start.x, y2 = start.y;
      if (Math.abs(x3 - x2) > epsilon || Math.abs(y3 - y2) > epsilon) {
        halfedges.splice(iHalfedge, 0, createHalfedge(createBorderEdge(cell.site, end,
            Math.abs(x3 - x0) < epsilon && y1 - y3 > epsilon ? {x: x0, y: Math.abs(x2 - x0) < epsilon ? y2 : y1}
            : Math.abs(y3 - y1) < epsilon && x1 - x3 > epsilon ? {x: Math.abs(y2 - y1) < epsilon ? x2 : x1, y: y1}
            : Math.abs(x3 - x1) < epsilon && y3 - y0 > epsilon ? {x: x1, y: Math.abs(x2 - x1) < epsilon ? y2 : y0}
            : Math.abs(y3 - y0) < epsilon && x3 - x0 > epsilon ? {x: Math.abs(y2 - y0) < epsilon ? x2 : x0, y: y0}
            : null), cell.site, null));
        ++nHalfedges;
      }
    }
  }
};
