import {addBeach, removeBeach} from "./Beach";
import {sortCellHalfedges, cellHalfedgeStart, clipCells} from "./Cell";
import {firstCircle} from "./Circle";
import {clippedEdges} from "./Edge";
import RedBlackTree from "./RedBlackTree";

export var epsilon = 1e-6;
export var epsilon2 = 1e-12;
export var beaches;
export var cells;
export var circles;
export var edges;

function triangleArea(a, b, c) {
  return (a[0] - c[0]) * (b[1] - a[1]) - (a[0] - b[0]) * (c[1] - a[1]);
}

function lexicographic(a, b) {
  return b[1] - a[1]
      || b[0] - a[0];
}

export default function Diagram(sites, extent) {
  var site = sites.sort(lexicographic).pop(),
      x,
      y,
      circle;

  edges = [];
  cells = new Array(sites.length);
  beaches = new RedBlackTree;
  circles = new RedBlackTree;

  while (true) {
    circle = firstCircle;
    if (site && (!circle || site[1] < circle.y || (site[1] === circle.y && site[0] < circle.x))) {
      if (site[0] !== x || site[1] !== y) {
        addBeach(site);
        x = site[0], y = site[1];
      }
      site = sites.pop();
    } else if (circle) {
      removeBeach(circle.arc);
    } else {
      break;
    }
  }

  sortCellHalfedges();

  if (extent) {
    var x0 = extent[0][0],
        y0 = extent[0][1],
        x1 = extent[1][0],
        y1 = extent[1][1];
    this.extent = [[x0, y0], [x1, y1]];
    this.cellEdges = clippedEdges(x0, y0, x1, y1);
    clipCells(this.cellEdges, x0, y0, x1, y1);
  } else {
    this.cellEdges = edges;
  }

  this.cells = cells;
  this.edges = edges;

  beaches =
  circles =
  edges =
  cells = null;
}

Diagram.prototype = {
  constructor: Diagram,

  polygons: function() {
    var cells = this.cells,
        edges = this.cellEdges,
        extent = this.extent,
        x0 = extent[0][0],
        y0 = extent[0][1],
        x1 = extent[1][0],
        y1 = extent[1][1],
        polygons = new Array(cells.length);

    cells.forEach(function(cell, i) {
      var site = cell.site,
          halfedges = cell.halfedges,
          polygon;
      if (halfedges.length) polygon = halfedges.map(function(index) { return cellHalfedgeStart(cell, edges[index]); });
      else if (site[0] >= x0 && site[0] <= x1 && site[1] >= y0 && site[1] <= y1) polygon = [[x0, y1], [x1, y1], [x1, y0], [x0, y0]];
      else return;
      polygons[i] = polygon;
      polygon.data = site.data;
    });

    return polygons;
  },

  triangles: function() {
    var triangles = [],
        edges = this.edges;

    this.cells.forEach(function(cell, i) {
      var site = cell.site,
          halfedges = cell.halfedges,
          j = -1,
          m = halfedges.length,
          s0,
          e1 = edges[halfedges[m - 1]],
          s1 = e1.left === site ? e1.right : e1.left;

      while (++j < m) {
        s0 = s1;
        e1 = edges[halfedges[j]];
        s1 = e1.left === site ? e1.right : e1.left;
        if (i < s0.index && i < s1.index && triangleArea(site, s0, s1) < 0) {
          triangles.push([site.data, s0.data, s1.data]);
        }
      }
    });

    return triangles;
  },

  links: function() {
    return this.edges.filter(function(edge) {
      return edge.right;
    }).map(function(edge) {
      return {
        source: edge.left.data,
        target: edge.right.data
      };
    });
  }
}
