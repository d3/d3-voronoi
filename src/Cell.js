import {createBorderEdge} from "./Edge";
import {cells, edges, epsilon} from "./Diagram";

export function createCell(site) {
  return cells[site.index] = {
    site: site,
    halfedges: [],
    open: false
  };
}

function cellHalfedgeAngle(cell, edge) {
  var site = cell.site,
      l = edge.left,
      r = edge.right;
  if (site === r) r = l, l = site;
  if (r) return Math.atan2(r[1] - l[1], r[0] - l[0]);
  if (site === l) l = edge[1], r = edge[0];
  else l = edge[0], r = edge[1];
  return Math.atan2(l[0] - r[0], r[1] - l[1]);
}

export function cellHalfedgeStart(cell, edge) {
  return edge[+(edge.left !== cell.site)];
}

export function cellHalfedgeEnd(cell, edge) {
  return edge[+(edge.left === cell.site)];
}

export function sortCellHalfedges() {
  for (var i = 0, n = cells.length, cell, halfedges, j, m; i < n; ++i) {
    if ((cell = cells[i]) && (m = (halfedges = cell.halfedges).length)) {
      var index = new Array(m),
          array = new Array(m);
      for (j = 0; j < m; ++j) index[j] = j, array[j] = cellHalfedgeAngle(cell, edges[halfedges[j]]);
      index.sort(function(i, j) { return array[j] - array[i]; });
      for (j = 0; j < m; ++j) array[j] = halfedges[index[j]];
      for (j = 0; j < m; ++j) halfedges[j] = array[j];
    }
  }
}

export function clipCells(edges, x0, y0, x1, y1) {
  var iCell = cells.length,
      cell,
      iHalfedge,
      halfedges,
      nHalfedges,
      start,
      startX,
      startY,
      end,
      endX,
      endY,
      last;

  while (iCell--) {
    if ((cell = cells[iCell]) && cell.open) {
      nHalfedges = (halfedges = cell.halfedges).length;

      // Remove any dangling clipped edges.
      for (iHalfedge = nHalfedges - 1; iHalfedge >= 0; --iHalfedge) {
        if (!edges[halfedges[iHalfedge]]) {
          halfedges.splice(iHalfedge, 1), --nHalfedges;
        }
      }

      // Insert any border edges as necessary.
      // TODO nHalfedges could be zero if this is a solitary point
      for (iHalfedge = 0; iHalfedge < nHalfedges; ++iHalfedge) {
        end = cellHalfedgeEnd(cell, edges[halfedges[iHalfedge]]), endX = end[0], endY = end[1];
        start = cellHalfedgeStart(cell, edges[halfedges[(iHalfedge + 1) % nHalfedges]]), startX = start[0], startY = start[1];
        if (Math.abs(endX - startX) > epsilon || Math.abs(endY - startY) > epsilon) {
          switch (true) {

            case Math.abs(endX - x0) < epsilon && y1 - endY > epsilon:
              last = Math.abs(startX - x0) < epsilon;
              halfedges.splice(++iHalfedge, 0, edges.push(createBorderEdge(cell.site, end, end = [x0, last ? startY : y1])) - 1), ++nHalfedges;
              if (last) break;
              endX = end[0], endY = end[1];

            case Math.abs(endY - y1) < epsilon && x1 - endX > epsilon:
              last = Math.abs(startY - y1) < epsilon;
              halfedges.splice(++iHalfedge, 0, edges.push(createBorderEdge(cell.site, end, end = [last ? startX : x1, y1])) - 1), ++nHalfedges;
              if (last) break;
              endX = end[0], endY = end[1];

            case Math.abs(endX - x1) < epsilon && y0 - endY < epsilon:
              last = Math.abs(startX - x1) < epsilon;
              halfedges.splice(++iHalfedge, 0, edges.push(createBorderEdge(cell.site, end, end = [x1, last ? startY : y0])) - 1), ++nHalfedges;
              if (last) break;
              endX = end[0], endY = end[1];

            case Math.abs(endY - y0) < epsilon && x0 - endX < epsilon:
              last = Math.abs(startY - y0) < epsilon;
              halfedges.splice(++iHalfedge, 0, edges.push(createBorderEdge(cell.site, end, end = [last ? startX : x0, y0])) - 1), ++nHalfedges;
              if (last) break;
              endX = end[0], endY = end[1];

              last = Math.abs(startX - x0) < epsilon;
              halfedges.splice(++iHalfedge, 0, edges.push(createBorderEdge(cell.site, end, end = [x0, last ? startY : y1])) - 1), ++nHalfedges;
              if (last) break;
              endX = end[0], endY = end[1];

              last = Math.abs(startY - y1) < epsilon;
              halfedges.splice(++iHalfedge, 0, edges.push(createBorderEdge(cell.site, end, end = [last ? startX : x1, y1])) - 1), ++nHalfedges;
              if (last) break;
              endX = end[0], endY = end[1];

              last = Math.abs(startX - x1) < epsilon;
              halfedges.splice(++iHalfedge, 0, edges.push(createBorderEdge(cell.site, end, end = [x1, last ? startY : y0])) - 1), ++nHalfedges;
              if (last) break;
          }
        }
      }
    }
  }
}
