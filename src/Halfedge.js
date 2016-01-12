function Halfedge(edge, site, angle) {
  this.edge = edge;
  this.site = site;
  this.angle = angle;
}

Halfedge.prototype = {
  start: function() { return this.edge.l === this.site ? this.edge.a : this.edge.b; },
  end: function() { return this.edge.l === this.site ? this.edge.b : this.edge.a; }
};

export function createHalfedge(edge, lSite, rSite) {
  var va = edge.a,
      vb = edge.b;
  return new Halfedge(edge, lSite, rSite ? Math.atan2(rSite.y - lSite.y, rSite.x - lSite.x)
      : edge.l === lSite ? Math.atan2(vb.x - va.x, va.y - vb.y)
      : Math.atan2(va.x - vb.x, vb.y - va.y));
};

export function descendingAngle(a, b) {
  return b.angle - a.angle;
};
