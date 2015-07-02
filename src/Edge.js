import {createHalfEdge} from "./HalfEdge";
import {cells, edges, epsilon} from "./voronoi";

function Edge(lSite, rSite) {
  this.l = lSite;
  this.r = rSite;
  this.a = this.b = null; // for border edges
}

export function createEdge(lSite, rSite, va, vb) {
  var edge = new Edge(lSite, rSite);
  edges.push(edge);
  if (va) setEdgeEnd(edge, lSite, rSite, va);
  if (vb) setEdgeEnd(edge, rSite, lSite, vb);
  cells[lSite.i].edges.push(createHalfEdge(edge, lSite, rSite));
  cells[rSite.i].edges.push(createHalfEdge(edge, rSite, lSite));
  return edge;
};

export function createBorderEdge(lSite, va, vb) {
  var edge = new Edge(lSite, null);
  edge.a = va;
  edge.b = vb;
  edges.push(edge);
  return edge;
};

export function setEdgeEnd(edge, lSite, rSite, vertex) {
  if (!edge.a && !edge.b) {
    edge.a = vertex;
    edge.l = lSite;
    edge.r = rSite;
  } else if (edge.l === rSite) {
    edge.b = vertex;
  } else {
    edge.a = vertex;
  }
};

// Liang–Barsky line clipping.
function clipLine(line, x0, y0, x1, y1) {
  var a = line.a,
      b = line.b,
      ax = a.x,
      ay = a.y,
      bx = b.x,
      by = b.y,
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

  if (t0 > 0) line.a = {x: ax + t0 * dx, y: ay + t0 * dy};
  if (t1 < 1) line.b = {x: ax + t1 * dx, y: ay + t1 * dy};
  return line;
}

function connectEdge(edge, x0, y0, x1, y1) {
  var vb = edge.b;
  if (vb) return true;

  var va = edge.a,
      lSite = edge.l,
      rSite = edge.r,
      lx = lSite.x,
      ly = lSite.y,
      rx = rSite.x,
      ry = rSite.y,
      fx = (lx + rx) / 2,
      fy = (ly + ry) / 2,
      fm,
      fb;

  if (ry === ly) {
    if (fx < x0 || fx >= x1) return;
    if (lx > rx) {
      if (!va) va = {x: fx, y: y0};
      else if (va.y >= y1) return;
      vb = {x: fx, y: y1};
    } else {
      if (!va) va = {x: fx, y: y1};
      else if (va.y < y0) return;
      vb = {x: fx, y: y0};
    }
  } else {
    fm = (lx - rx) / (ry - ly);
    fb = fy - fm * fx;
    if (fm < -1 || fm > 1) {
      if (lx > rx) {
        if (!va) va = {x: (y0 - fb) / fm, y: y0};
        else if (va.y >= y1) return;
        vb = {x: (y1 - fb) / fm, y: y1};
      } else {
        if (!va) va = {x: (y1 - fb) / fm, y: y1};
        else if (va.y < y0) return;
        vb = {x: (y0 - fb) / fm, y: y0};
      }
    } else {
      if (ly < ry) {
        if (!va) va = {x: x0, y: fm * x0 + fb};
        else if (va.x >= x1) return;
        vb = {x: x1, y: fm * x1 + fb};
      } else {
        if (!va) va = {x: x1, y: fm * x1 + fb};
        else if (va.x < x0) return;
        vb = {x: x0, y: fm * x0 + fb};
      }
    }
  }

  edge.a = va;
  edge.b = vb;
  return true;
}

export function clipEdges(x0, y0, x1, y1) {
  var i = edges.length,
      e;
  while (i--) {
    e = edges[i];
    if (!connectEdge(e, x0, y0, x1, y1)
        || !clipLine(e, x0, y0, x1, y1)
        || (Math.abs(e.a.x - e.b.x) < epsilon && Math.abs(e.a.y - e.b.y) < epsilon)) {
      e.a = e.b = null;
      edges.splice(i, 1);
    }
  }
};
