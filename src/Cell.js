import {createBorderEdge} from "./Edge";
import {cells, edges, epsilon} from "./Diagram";

export function createCell(site) {
  return cells[site.index] = {
    site: site,
    halfedges: []
  };
};

function cellHalfedgeAngle(cell, edge) {
  var site = cell.site,
      va = edge.left,
      vb = edge.right;
  if (site === vb) vb = va, va = site;
  if (vb) return Math.atan2(vb[1] - va[1], vb[0] - va[0]);
  if (site === va) va = edge[1], vb = edge[0];
  else va = edge[0], vb = edge[1];
  return Math.atan2(va[0] - vb[0], vb[1] - va[1]);
}

export function cellHalfedgeStart(cell, edge) {
  return edge[edge.left ? +(edge.right === cell.site) : 0];
};

export function cellHalfedgeEnd(cell, edge) {
  return edge[edge.left ? +(edge.left === cell.site) : 1];
};

export function sortCellHalfedges() {
  for (var i = 0, n = cells.length, cell, halfedges, m; i < n; ++i) {
    if ((cell = cells[i]) && (m = (halfedges = cell.halfedges).length)) {
      var index = new Array(m),
          array = new Array(m);
      for (var j = 0; j < m; ++j) index[j] = j, array[j] = cellHalfedgeAngle(cell, edges[halfedges[j]]);
      index.sort(function(i, j) { return array[j] - array[i]; });
      for (var j = 0; j < m; ++j) array[j] = halfedges[index[j]];
      for (var j = 0; j < m; ++j) halfedges[j] = array[j];
    }
  }
};

export function clippedCells(cells, edges, x0, y0, x1, y1) {
  var iCell = cells.length,
      clippedCells = new Array(iCell),
      x2,
      y2,
      x3,
      y3,
      cell,
      clippedCell,
      iHalfedge,
      halfedges,
      nHalfedges,
      start,
      end;

  while (iCell--) {
    if (cell = clippedCell = cells[iCell]) {
      halfedges = cell.halfedges;
      iHalfedge = halfedges.length;

      // Remove any dangling clipped edges.
      while (iHalfedge--) {
        if (!edges[halfedges[iHalfedge]]) {
          if (clippedCell === cell) clippedCell = {site: cell.site, halfedges: halfedges = halfedges.slice()}; // Copy-on-write.
          halfedges.splice(iHalfedge, 1);
        }
      }

      // Insert any border edges as necessary.
      iHalfedge = 0, nHalfedges = halfedges.length;
      while (iHalfedge < nHalfedges) {
        end = cellHalfedgeEnd(cell, edges[halfedges[iHalfedge]]), x3 = end[0], y3 = end[1];
        start = cellHalfedgeStart(cell, edges[halfedges[++iHalfedge % nHalfedges]]), x2 = start[0], y2 = start[1];
        if (Math.abs(x3 - x2) > epsilon || Math.abs(y3 - y2) > epsilon) {
          if (clippedCell === cell) clippedCell = {site: cell.site, halfedges: halfedges = halfedges.slice()}; // Copy-on-write.
          halfedges.splice(iHalfedge, 0, edges.push([end,
              Math.abs(x3 - x0) < epsilon && y1 - y3 > epsilon ? [x0, Math.abs(x2 - x0) < epsilon ? y2 : y1]
              : Math.abs(y3 - y1) < epsilon && x1 - x3 > epsilon ? [Math.abs(y2 - y1) < epsilon ? x2 : x1, y1]
              : Math.abs(x3 - x1) < epsilon && y3 - y0 > epsilon ? [x1, Math.abs(x2 - x1) < epsilon ? y2 : y0]
              : Math.abs(y3 - y0) < epsilon && x3 - x0 > epsilon ? [Math.abs(y2 - y0) < epsilon ? x2 : x0, y0]
              : null]) - 1);
          ++nHalfedges;
        }
      }

      clippedCells[iCell] = clippedCell;
    }
  }

  return clippedCells;
};
