import RedBlackTree from "./RedBlackTree";
import {addBeach, removeBeach} from "./Beach";
import {clipEdges} from "./Edge";
import {closeCells} from "./Cell";
import {descendingAngle} from "./HalfEdge";
import {firstCircle} from "./Circle";

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
  return (a.x - c.x) * (b.y - a.y) - (a.x - b.x) * (c.y - a.y);
}

function lexicographic(a, b) {
  return b.y - a.y
      || b.x - a.x;
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
    if (site && (!circle || site.y < circle.y || (site.y === circle.y && site.x < circle.x))) {
      if (site.x !== x || site.y !== y) {
        addBeach(site);
        x = site.x, y = site.y;
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
      return {
        x: Math.round(fx(d, i) / epsilon) * epsilon,
        y: Math.round(fy(d, i) / epsilon) * epsilon,
        i: i
      };
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
      var edges = cell.edges,
          site = cell.site,
          polygon = polygons[i] = edges.length ? edges.map(function(e) { var s = e.start(); return [s.x, s.y]; })
              : site.x >= x0 && site.x <= x1 && site.y >= y0 && site.y <= y1 ? [[x0, y1], [x1, y1], [x1, y0], [x0, y0]]
              : [];
      polygon.point = data[i];
    });

    return polygons;
  };

  voronoi.links = function(data) {
    return computeVoronoi(sites(data)).edges.filter(function(edge) {
      return edge.l && edge.r;
    }).map(function(edge) {
      return {
        source: data[edge.l.i],
        target: data[edge.r.i]
      };
    });
  };

  voronoi.triangles = function(data) {
    var triangles = [];

    computeVoronoi(sites(data)).cells.forEach(function(cell, i) {
      var site = cell.site,
          edges = cell.edges.sort(descendingAngle),
          j = -1,
          m = edges.length,
          e0,
          s0,
          e1 = edges[m - 1].edge,
          s1 = e1.l === site ? e1.r : e1.l;

      while (++j < m) {
        e0 = e1;
        s0 = s1;
        e1 = edges[j].edge;
        s1 = e1.l === site ? e1.r : e1.l;
        if (i < s0.i && i < s1.i && triangleArea(site, s0, s1) < 0) {
          triangles.push([data[i], data[s0.i], data[s1.i]]);
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
