function Halfedge(edge, site) {
  this.edge = edge;
  this.site = site;
}

export function createHalfedge(edge, site) {
  return new Halfedge(edge, site);
};

export function halfedgeStart(halfedge) {
  return halfedge.edge[+(halfedge.edge.right === halfedge.site)];
};

export function halfedgeEnd(halfedge) {
  return halfedge.edge[+(halfedge.edge.left === halfedge.site)];
};

export function sortHalfedges(halfedges) {
  if (!(n = halfedges.length)) return;
  var n,
      index = new Array(n),
      array = new Array(n);
  for (var i = 0; i < n; ++i) index[i] = i, array[i] = halfedgeAngle(halfedges[i]);
  index.sort(function(i, j) { return array[j] - array[i]; });
  for (var i = 0; i < n; ++i) array[i] = halfedges[index[i]];
  for (var i = 0; i < n; ++i) halfedges[i] = array[i];
};

function halfedgeAngle(halfedge) {
  var edge = halfedge.edge,
      va = edge.left,
      vb = edge.right,
      site = halfedge.site;
  if (site === vb) vb = va, va = site;
  if (vb) return Math.atan2(vb[1] - va[1], vb[0] - va[0]);
  if (site === va) va = edge[1], vb = edge[0];
  else va = edge[0], vb = edge[1];
  return Math.atan2(va[0] - vb[0], vb[1] - va[1]);
}
