function Halfedge(edge, site, angle) {
  this.edge = edge;
  this.site = site;
  this.angle = angle;
}

export function halfedgeStart(halfedge) {
  return halfedge.edge[+(halfedge.edge.right === halfedge.site)];
};

export function halfedgeEnd(halfedge) {
  return halfedge.edge[+(halfedge.edge.left === halfedge.site)];
};

export function createHalfedge(edge, lSite, rSite) {
  var va = edge[0],
      vb = edge[1];
  return new Halfedge(edge, lSite, rSite ? Math.atan2(rSite[1] - lSite[1], rSite[0] - lSite[0])
      : edge.left === lSite ? Math.atan2(vb[0] - va[0], va[1] - vb[1])
      : Math.atan2(va[0] - vb[0], vb[1] - va[1]));
};

export function descendingAngle(a, b) {
  return b.angle - a.angle;
};
