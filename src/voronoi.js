import {addBeach, removeBeach} from "./Beach";
import {cleanCells, closeCells} from "./Cell";
import {firstCircle} from "./Circle";
import {clipEdges} from "./Edge";
import {halfedgeStart} from "./Halfedge";
import RedBlackTree from "./RedBlackTree";

var nullExtent = [[-1e6, -1e6], [1e6, 1e6]];

export var epsilon = 1e-6;
export var epsilon2 = 1e-12;
export var beaches;
export var cells;
export var circles;
export var edges;

function pointX(p) {
  return p[0];
}

function pointY(p) {
  return p[1];
}

function functor(x) {
  return function() {
    return x;
  };
}

function triangleArea(a, b, c) {
  return (a[0] - c[0]) * (b[1] - a[1]) - (a[0] - b[0]) * (c[1] - a[1]);
}

function lexicographic(a, b) {
  return b[1] - a[1]
      || b[0] - a[0];
}

function computeVoronoi(sites, extent) {
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

  if (extent) {
    var x0 = extent[0][0],
        y0 = extent[0][1],
        x1 = extent[1][0],
        y1 = extent[1][1];
    clipEdges(x0, y0, x1, y1);
    closeCells(x0, y0, x1, y1);
  } else {
    cleanCells();
  }

  var diagram = {cells: cells, edges: edges};
  beaches = circles = edges = cells = null;
  return diagram;
}

export default function() {
  var x = pointX,
      y = pointY,
      fx = x,
      fy = y,
      extent = null;

  function voronoi(data) {
    return computeVoronoi(sites(data), extent);
  }

  function sites(data) {
    return data.map(function(d, i) {
      var s = [Math.round(fx(d, i, data) / epsilon) * epsilon, Math.round(fy(d, i, data) / epsilon) * epsilon];
      s.index = i;
      s.data = d;
      return s;
    });
  }

  voronoi.cells = function(data) {
    var polygons = new Array(data.length),
        box = extent || nullExtent,
        x0 = box[0][0],
        y0 = box[0][1],
        x1 = box[1][0],
        y1 = box[1][1];

    computeVoronoi(sites(data), box).cells.forEach(function(cell, i) {
      var halfedges = cell.halfedges,
          site = cell.site,
          polygon = polygons[i] = halfedges.length ? halfedges.map(halfedgeStart)
              : site[0] >= x0 && site[0] <= x1 && site[1] >= y0 && site[1] <= y1 ? [[x0, y1], [x1, y1], [x1, y0], [x0, y0]]
              : [];
      polygon.data = data[i];
    });

    return polygons;
  };

  voronoi.links = function(data) {
    return computeVoronoi(sites(data)).edges.filter(function(edge) {
      return edge.left && edge.right;
    }).map(function(edge) {
      return {
        source: edge.left.data,
        target: edge.right.data
      };
    });
  };

  voronoi.triangles = function(data) {
    var triangles = [];

    computeVoronoi(sites(data)).cells.forEach(function(cell, i) {
      var site = cell.site,
          halfedges = cell.halfedges,
          j = -1,
          m = halfedges.length,
          e0,
          s0,
          e1 = halfedges[m - 1].edge,
          s1 = e1.left === site ? e1.right : e1.left;

      while (++j < m) {
        e0 = e1;
        s0 = s1;
        e1 = halfedges[j].edge;
        s1 = e1.left === site ? e1.right : e1.left;
        if (i < s0.index && i < s1.index && triangleArea(site, s0, s1) < 0) {
          triangles.push([site.data, s0.data, s1.data]);
        }
      }
    });

    return triangles;
  };

  voronoi.x = function(_) {
    return arguments.length ? (x = _, fx = typeof _ === "function" ? x : functor(x), voronoi) : x;
  };

  voronoi.y = function(_) {
    return arguments.length ? (y = _, fy = typeof _ === "function" ? y : functor(y), voronoi) : y;
  };

  voronoi.extent = function(_) {
    return arguments.length ? (extent = _ == null ? null : [[+_[0][0], +_[0][1]], [+_[1][0], +_[1][1]]], voronoi) : extent && [[extent[0][0], extent[0][1]], [extent[1][0], extent[1][1]]];
  };

  voronoi.size = function(_) {
    return arguments.length ? (extent = _ == null ? null : [[0, 0], [+_[0], +_[1]]], voronoi) : extent && [extent[1][0], extent[1][1]];
  };

  return voronoi;
};
