function HalfEdge(edge, site, angle) {
  this.edge = edge;
  this.site = site;
  this.angle = angle;
}

HalfEdge.prototype = {
  start: function() { return this.edge.l === this.site ? this.edge.a : this.edge.b; },
  end: function() { return this.edge.l === this.site ? this.edge.b : this.edge.a; }
};

export function createHalfEdge(edge, lSite, rSite) {
  var va = edge.a,
      vb = edge.b;
  return new HalfEdge(edge, lSite, rSite ? Math.atan2(rSite.y - lSite.y, rSite.x - lSite.x)
      : edge.l === lSite ? Math.atan2(vb.x - va.x, va.y - vb.y)
      : Math.atan2(va.x - vb.x, vb.y - va.y));
};
