function HalfEdge(edge, lSite, rSite) {
  var va = edge.a,
      vb = edge.b;
  this.edge = edge;
  this.site = lSite;
  this.angle = rSite ? Math.atan2(rSite.y - lSite.y, rSite.x - lSite.x)
      : edge.l === lSite ? Math.atan2(vb.x - va.x, va.y - vb.y)
      : Math.atan2(va.x - vb.x, vb.y - va.y);
};

HalfEdge.prototype = {
  start: function() { return this.edge.l === this.site ? this.edge.a : this.edge.b; },
  end: function() { return this.edge.l === this.site ? this.edge.b : this.edge.a; }
};

export default HalfEdge;
