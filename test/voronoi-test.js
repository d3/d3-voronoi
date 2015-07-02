var tape = require("tape"),
    voronoi = require("../"),
    asArray = require("./asArray"),
    polygonArea = require("./polygonArea");

tape("voronoi() has the expected defaults", function(test) {
  var v = voronoi.voronoi();
  test.equal(v.extent(), null);
  test.equal(v.size(), null);
  test.equal(v.x()([1, 2]), 1);
  test.equal(v.y()([1, 2]), 2);
  test.end();
});

tape("voronoi.size([x, y]) is an alias for voronoi.extent([[0, 0], [x, y]])", function(test) {
  var v = voronoi.voronoi();
  test.equal(v.size([3, 4]), v);
  test.deepEqual(v.size(), [3, 4]);
  test.deepEqual(v.extent(), [[0, 0], [3, 4]]);
  test.end();
});

tape("voronoi.extent([[x1, y1], [x2, y2]]) sets the specified extent", function(test) {
  var v = voronoi.voronoi();
  test.equal(v.extent([[1, 2], [3, 4]]), v);
  test.deepEqual(v.extent(), [[1, 2], [3, 4]]);
  test.end();
});

tape("voronoi.x(x) sets the specified x-accessor", function(test) {
  var v = voronoi.voronoi();
  test.equal(v.x(function(d) { return d.x; }), v);
  test.equal(v.x()({x: 1}), 1);
  test.end();
});

tape("voronoi.y(y) sets the specified y-accessor", function(test) {
  var v = voronoi.voronoi();
  test.equal(v.y(function(d) { return d.y; }), v);
  test.equal(v.y()({y: 1}), 1);
  test.end();
});

tape("voronoi(points) returns an array of polygons for the specified points", function(test) {
  test.deepEqual(asArray(voronoi.voronoi()([[200, 200], [760, 300]])), [
    [[-178046.78571428574, 1000000], [179096.07142857145, -1000000], [-1000000, -1000000], [-1000000, 1000000]],
    [[179096.07142857145, -1000000], [-178046.78571428574, 1000000], [1000000, 1000000], [1000000, -1000000]]
  ]);
  test.end();
});

tape("voronoi(points) returns open, counterclockwise polygons", function(test) {
  voronoi.voronoi()([[200, 200], [760, 300]]).forEach(function(cell) {
    test.ok(cell.length > 2);
    test.ok(cell[0][0] !== cell[cell.length - 1][0] || cell[0][1] !== cell[cell.length - 1][1]);
    test.ok(polygonArea(cell) > 0);
  });
  test.end();
});

tape("voronoi(points) has an implicit extent of [[-1e6, -1e6], [1e6, 1e6]] by default", function(test) {
  var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  voronoi.voronoi()([[200, 200], [760, 300]]).forEach(function(cell) {
    cell.forEach(function(point) {
      if (point[0] < x0) x0 = point[0];
      if (point[0] > x1) x1 = point[0];
      if (point[1] < y0) y0 = point[1];
      if (point[1] > y1) y1 = point[1];
    });
  });
  test.equal(x0, -1e6);
  test.equal(x1, 1e6);
  test.equal(y0, -1e6);
  test.equal(y1, 1e6);
  test.end();
});

tape("voronoi(points) returns polygons where polygons[i].point is equal to points[i]", function(test) {
  var points = [[200, 200], [760, 300]];
  voronoi.voronoi()(points).forEach(function(cell, i) {
    test.equal(cell.point, points[i]);
  });
  test.end();
});

    // "a voronoi layout with custom x- and y-accessors": {
    //   topic: function(voronoi) {
    //     return voronoi()
    //         .x(function(d) { return d.x; })
    //         .y(43);
    //   },
    //   "observes the specified x-accessor, a function": function(v) {
    //     assert.strictEqual(v.x()({x: 42, y: 43}), 42);
    //   },
    //   "observes the specified y-accessor, a constant": function(v) {
    //     assert.strictEqual(v.y(), 43);
    //   },
    //   "of two points": {
    //     topic: function(v) {
    //       return v([{x: 200}, {x: 760}]);
    //     },
    //     "returns two cells with the expected geometry": function(cells) {
    //       assert.inDelta(cells, [
    //         [[480, 1e6], [480, -1e6], [-1e6, -1e6], [-1e6, 1e6]],
    //         [[480, -1e6], [480, 1e6], [1e6, 1e6], [1e6, -1e6]]
    //       ], 1e-6);
    //     }
    //   },

    // "a voronoi layout with clip extent [[0, 0], [960, 500]]": {
    //   topic: function(voronoi) {
    //     return voronoi()
    //         .x(function(d) { return d.x; })
    //         .y(function(d) { return d.y; })
    //         .clipExtent([[0, 0], [960, 500]]);
    //   },
    //   "of two points": {
    //     topic: function(v) {
    //       return v([{x: 200, y: 200}, {x: 760, y: 300}]);
    //     },
    //     "returns two cells with the expected geometry": function(cells) {
    //       assert.inDelta(cells, [
    //         [[435.35714285715324, 500], [524.6428571428696, 0], [0, 0], [0, 500]],
    //         [[524.6428571428696, 0], [435.35714285715324, 500], [960, 500], [960, 0]]
    //       ], 1e-6);
    //     },
    //     "the returned cells are clipped to the layout size": function(cells) {
    //       assert.isTrue(cells.every(function(cell) {
    //         return cell.every(function(point) {
    //           return point[0] >= 0 && point[0] <= 960
    //               && point[1] >= 0 && point[1] <= 500;
    //         });
    //       }));
    //     }
    //   }
    // },

    // "the default voronoi layout applied directly": {
    //   "with zero points": {
    //     "returns the empty array": function(voronoi) {
    //       assert.deepEqual(polygons(voronoi([])), []);
    //     }
    //   },
    //   "with one point": {
    //     topic: function(v) {
    //       return v([[50, 50]]);
    //     },
    //     "returns the semi-infinite bounding box": function(cells) {
    //       assert.deepEqual(polygons(cells), [
    //         [[-1e6, 1e6], [1e6, 1e6], [1e6, -1e6], [-1e6, -1e6]]
    //       ]);
    //     },
    //     "the returned cell has positive area": function(cells) {
    //       assert.ok(_.geom.polygon(cells[0]).area() > 0);
    //     }
    //   },
    //   "with two points": {
    //     "separated by a horizontal line": function(voronoi) {
    //       assert.deepEqual(polygons(voronoi([[0, -100], [0, 100]])), [
    //         [[-1e6, 0], [1e6, 0], [1e6, -1e6], [-1e6, -1e6]],
    //         [[1e6, 0], [-1e6, 0], [-1e6, 1e6], [1e6, 1e6]],
    //       ]);
    //       assert.deepEqual(polygons(voronoi([[0, 100], [0, -100]])), [
    //         [[1e6, 0], [-1e6, 0], [-1e6, 1e6], [1e6, 1e6]],
    //         [[-1e6, 0], [1e6, 0], [1e6, -1e6], [-1e6, -1e6]]
    //       ]);
    //     },
    //     "separated by a vertical line": function(voronoi) {
    //       assert.deepEqual(polygons(voronoi([[100, 0], [-100, 0]])), [
    //         [[0, -1e6], [0, 1e6], [1e6, 1e6], [1e6, -1e6]],
    //         [[0, 1e6], [0, -1e6], [-1e6, -1e6], [-1e6, 1e6]]
    //       ]);
    //       assert.deepEqual(polygons(voronoi([[-100, 0], [100, 0]])), [
    //         [[0, 1e6], [0, -1e6], [-1e6, -1e6], [-1e6, 1e6]],
    //         [[0, -1e6], [0, 1e6], [1e6, 1e6], [1e6, -1e6]]
    //       ]);
    //     },
    //     "separated by a diagonal line": function(voronoi) {
    //       assert.deepEqual(polygons(voronoi([[-100, -100], [100, 100]])), [
    //         [[-1e6, 1e6], [1e6, -1e6], [-1e6, -1e6]],
    //         [[1e6, -1e6], [-1e6, 1e6], [1e6, 1e6]]
    //       ]);
    //       assert.deepEqual(polygons(voronoi([[100, 100], [-100, -100]])), [
    //         [[1e6, -1e6], [-1e6, 1e6], [1e6, 1e6]],
    //         [[-1e6, 1e6], [1e6, -1e6], [-1e6, -1e6]]
    //       ]);
    //     },
    //     "separated by an arbitrary diagonal": function(voronoi) {
    //       assert.deepEqual(polygons(voronoi([[-100, -100], [100, 0]])), [
    //         [[-500025, 1e6], [499975, -1e6], [-1e6, -1e6], [-1e6, 1e6]],
    //         [ [499975, -1e6], [-500025, 1e6], [1e6, 1e6], [1e6, -1e6]]
    //       ]);
    //     }
    //   },
    //   "with three points": {
    //     "collinear": function(voronoi) {
    //       assert.deepEqual(polygons(voronoi([[-100, -100], [0, 0], [100, 100]])), [
    //         [[-1e6, 999900], [999900, -1e6], [-1e6, -1e6]],
    //         [[-999900, 1e6], [1e6, -999900], [1e6, -1e6], [999900, -1e6], [-1e6, 999900], [-1e6, 1e6]],
    //         [[1e6, -999900], [-999900, 1e6], [1e6, 1e6]]
    //       ]);
    //     }
    //   }
    // }
