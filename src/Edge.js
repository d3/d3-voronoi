import {createHalfedge} from "./Halfedge";
import {cells, edges, epsilon} from "./voronoi";

export function createEdge(lSite, rSite, va, vb) {
  var edge = [null, null];
  edge.left = lSite;
  edge.right = rSite;
  edges.push(edge);
  if (va) setEdgeEnd(edge, lSite, rSite, va);
  if (vb) setEdgeEnd(edge, rSite, lSite, vb);
  cells[lSite.index].halfedges.push(createHalfedge(edge, lSite, rSite));
  cells[rSite.index].halfedges.push(createHalfedge(edge, rSite, lSite));
  return edge;
};

export function createBorderEdge(lSite, va, vb) {
  var edge = [va, vb];
  edge.left = lSite;
  edge.right = null;
  edges.push(edge);
  return edge;
};

export function setEdgeEnd(edge, lSite, rSite, vertex) {
  if (!edge[0] && !edge[1]) {
    edge[0] = vertex;
    edge.left = lSite;
    edge.right = rSite;
  } else if (edge.left === rSite) {
    edge[1] = vertex;
  } else {
    edge[0] = vertex;
  }
};

// Liang–Barsky line clipping.
function clipLine(edge, x0, y0, x1, y1) {
  var a = edge[0],
      b = edge[1],
      ax = a[0],
      ay = a[1],
      bx = b[0],
      by = b[1],
      t0 = 0,
      t1 = 1,
      dx = bx - ax,
      dy = by - ay,
      r;

  r = x0 - ax;
  if (!dx && r > 0) return;
  r /= dx;
  if (dx < 0) {
    if (r < t0) return;
    if (r < t1) t1 = r;
  } else if (dx > 0) {
    if (r > t1) return;
    if (r > t0) t0 = r;
  }

  r = x1 - ax;
  if (!dx && r < 0) return;
  r /= dx;
  if (dx < 0) {
    if (r > t1) return;
    if (r > t0) t0 = r;
  } else if (dx > 0) {
    if (r < t0) return;
    if (r < t1) t1 = r;
  }

  r = y0 - ay;
  if (!dy && r > 0) return;
  r /= dy;
  if (dy < 0) {
    if (r < t0) return;
    if (r < t1) t1 = r;
  } else if (dy > 0) {
    if (r > t1) return;
    if (r > t0) t0 = r;
  }

  r = y1 - ay;
  if (!dy && r < 0) return;
  r /= dy;
  if (dy < 0) {
    if (r > t1) return;
    if (r > t0) t0 = r;
  } else if (dy > 0) {
    if (r < t0) return;
    if (r < t1) t1 = r;
  }

  if (t0 > 0) edge[0] = [ax + t0 * dx, ay + t0 * dy];
  if (t1 < 1) edge[1] = [ax + t1 * dx, ay + t1 * dy];
  return edge;
}

function connectEdge(edge, x0, y0, x1, y1) {
  var vb = edge[1];
  if (vb) return true;

  var va = edge[0],
      lSite = edge.left,
      rSite = edge.right,
      lx = lSite[0],
      ly = lSite[1],
      rx = rSite[0],
      ry = rSite[1],
      fx = (lx + rx) / 2,
      fy = (ly + ry) / 2,
      fm,
      fb;

  if (ry === ly) {
    if (fx < x0 || fx >= x1) return;
    if (lx > rx) {
      if (!va) va = [fx, y0];
      else if (va[1] >= y1) return;
      vb = [fx, y1];
    } else {
      if (!va) va = [fx, y1];
      else if (va[1] < y0) return;
      vb = [fx, y0];
    }
  } else {
    fm = (lx - rx) / (ry - ly);
    fb = fy - fm * fx;
    if (fm < -1 || fm > 1) {
      if (lx > rx) {
        if (!va) va = [(y0 - fb) / fm, y0];
        else if (va[1] >= y1) return;
        vb = [(y1 - fb) / fm, y1];
      } else {
        if (!va) va = [(y1 - fb) / fm, y1];
        else if (va[1] < y0) return;
        vb = [(y0 - fb) / fm, y0];
      }
    } else {
      if (ly < ry) {
        if (!va) va = [x0, fm * x0 + fb];
        else if (va[0] >= x1) return;
        vb = [x1, fm * x1 + fb];
      } else {
        if (!va) va = [x1, fm * x1 + fb];
        else if (va[0] < x0) return;
        vb = [x0, fm * x0 + fb];
      }
    }
  }

  edge[0] = va;
  edge[1] = vb;
  return true;
}

export function clipEdges(x0, y0, x1, y1) {
  var i = edges.length,
      e;
  while (i--) {
    e = edges[i];
    if (!connectEdge(e, x0, y0, x1, y1)
        || !clipLine(e, x0, y0, x1, y1)
        || (Math.abs(e[0][0] - e[1][0]) < epsilon && Math.abs(e[0][1] - e[1][1]) < epsilon)) {
      e[0] = e[1] = null;
      edges.splice(i, 1);
    }
  }
};
