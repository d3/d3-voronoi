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
  v.size([960, 500]);
  test.deepEqual(v.size(), [960, 500]);
  test.deepEqual(v.extent(), [[0, 0], [960, 500]]);
  test.deepEqual(asArray(v.cells([[200, 200], [760, 300]])), [
    [[435.3571428571429, 500], [524.6428571428572, 0], [0, 0], [0, 500]],
    [[524.6428571428572, 0], [435.3571428571429, 500], [960, 500], [960, 0]]
  ]);
  test.end();
});

tape("voronoi.extent([[x1, y1], [x2, y2]]) sets the specified extent", function(test) {
  var v = voronoi.voronoi();
  test.equal(v.extent([[1, 2], [3, 4]]), v);
  test.deepEqual(v.extent(), [[1, 2], [3, 4]]);
  v.extent([[0, 0], [960, 500]]);
  test.deepEqual(v.size(), [960, 500]);
  test.deepEqual(v.extent(), [[0, 0], [960, 500]]);
  test.deepEqual(asArray(v.cells([[200, 200], [760, 300]])), [
    [[435.3571428571429, 500], [524.6428571428572, 0], [0, 0], [0, 500]],
    [[524.6428571428572, 0], [435.3571428571429, 500], [960, 500], [960, 0]]
  ]);
  test.end();
});

tape("voronoi.x(x) sets the specified x-accessor", function(test) {
  var v = voronoi.voronoi();
  test.equal(v.x(function(d) { return d.x; }), v);
  test.equal(v.x()({x: 1}), 1);
  test.deepEqual(asArray(v.cells([{x: 200, 1: 200}, {x: 760, 1: 300}])), [
    [[-178046.78571428574, 1e6], [179096.07142857145, -1e6], [-1e6, -1e6], [-1e6, 1e6]],
    [[179096.07142857145, -1e6], [-178046.78571428574, 1e6], [1e6, 1e6], [1e6, -1e6]]
  ]);
  test.end();
});

tape("voronoi.y(y) sets the specified y-accessor", function(test) {
  var v = voronoi.voronoi();
  test.equal(v.y(function(d) { return d.y; }), v);
  test.equal(v.y()({y: 1}), 1);
  test.deepEqual(asArray(v.cells([{0: 200, y: 200}, {0: 760, y: 300}])), [
    [[-178046.78571428574, 1e6], [179096.07142857145, -1e6], [-1e6, -1e6], [-1e6, 1e6]],
    [[179096.07142857145, -1e6], [-178046.78571428574, 1e6], [1e6, 1e6], [1e6, -1e6]]
  ]);
  test.end();
});

tape("voronoi.x(x) allows the specified x-accessor to be a constant", function(test) {
  var v = voronoi.voronoi().y(function(d) { return d; });
  test.equal(v.x(42), v);
  test.equal(v.x(), 42);
  test.deepEqual(asArray(v.cells([200, 760])), [
    [[-1e6, 480], [1e6, 480], [1e6, -1e6], [-1e6, -1e6]],
    [[1e6, 480], [-1e6, 480], [-1e6, 1e6], [1e6, 1e6]]
  ]);
  test.end();
});

tape("voronoi.y(y) allows the specified y-accessor to be a constant", function(test) {
  var v = voronoi.voronoi().x(function(d) { return d; });
  test.equal(v.y(43), v);
  test.equal(v.y(), 43);
  test.deepEqual(asArray(v.cells([200, 760])), [
    [[480, 1e6], [480, -1e6], [-1e6, -1e6], [-1e6, 1e6]],
    [[480, -1e6], [480, 1e6], [1e6, 1e6], [1e6, -1e6]]
  ]);
  test.end();
});

tape("voronoi.cells(points) returns an array of polygons for the specified points", function(test) {
  test.deepEqual(asArray(voronoi.voronoi().cells([[200, 200], [760, 300]])), [
    [[-178046.78571428574, 1e6], [179096.07142857145, -1e6], [-1e6, -1e6], [-1e6, 1e6]],
    [[179096.07142857145, -1e6], [-178046.78571428574, 1e6], [1e6, 1e6], [1e6, -1e6]]
  ]);
  test.end();
});

tape("voronoi.cells(points) returns open, counterclockwise polygons", function(test) {
  voronoi.voronoi().cells([[200, 200], [760, 300]]).forEach(function(cell) {
    test.ok(cell.length > 2);
    test.ok(cell[0][0] !== cell[cell.length - 1][0] || cell[0][1] !== cell[cell.length - 1][1]);
    test.ok(polygonArea(cell) > 0);
  });
  test.end();
});

tape("voronoi.cells(points) has an implicit extent of [[-1e6, -1e6], [1e6, 1e6]]", function(test) {
  var x0 = Infinity,
      x1 = -Infinity,
      y0 = Infinity,
      y1 = -Infinity,
      v = voronoi.voronoi();
  v.cells([[200, 200], [760, 300]]).forEach(function(cell) {
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
  test.deepEqual(asArray(v.cells([[50, 50]])), [[[-1e6, 1e6], [1e6, 1e6], [1e6, -1e6], [-1e6, -1e6]]]);
  test.ok(v.cells([[50, 50]]).every(function(polygon) { return polygonArea(polygon) > 0; }));
  test.end();
});

tape("voronoi.cells(points) returns polygons where polygons[i].data is equal to points[i]", function(test) {
  var points = [[200, 200], [760, 300]];
  voronoi.voronoi().cells(points).forEach(function(cell, i) {
    test.equal(cell.data, points[i]);
  });
  test.end();
});

tape("voronoi.cells(points) can separate two points with a horizontal line", function(test) {
  test.deepEqual(asArray(voronoi.voronoi().cells([[0, -100], [0, 100]])), [
    [[-1e6, 0], [1e6, 0], [1e6, -1e6], [-1e6, -1e6]],
    [[1e6, 0], [-1e6, 0], [-1e6, 1e6], [1e6, 1e6]],
  ]);
  test.deepEqual(asArray(voronoi.voronoi().cells([[0, 100], [0, -100]])), [
    [[1e6, 0], [-1e6, 0], [-1e6, 1e6], [1e6, 1e6]],
    [[-1e6, 0], [1e6, 0], [1e6, -1e6], [-1e6, -1e6]]
  ]);
  test.end();
});

tape("voronoi.cells(points) can separate two points with a vertical line", function(test) {
  test.deepEqual(asArray(voronoi.voronoi().cells([[100, 0], [-100, 0]])), [
    [[0, -1e6], [0, 1e6], [1e6, 1e6], [1e6, -1e6]],
    [[0, 1e6], [0, -1e6], [-1e6, -1e6], [-1e6, 1e6]]
  ]);
  test.deepEqual(asArray(voronoi.voronoi().cells([[-100, 0], [100, 0]])), [
    [[0, 1e6], [0, -1e6], [-1e6, -1e6], [-1e6, 1e6]],
    [[0, -1e6], [0, 1e6], [1e6, 1e6], [1e6, -1e6]]
  ]);
  test.end();
});

tape("voronoi.cells(points) can separate two points with a diagonal line", function(test) {
  test.deepEqual(asArray(voronoi.voronoi().cells([[-100, -100], [100, 100]])), [
    [[-1e6, 1e6], [1e6, -1e6], [-1e6, -1e6]],
    [[1e6, -1e6], [-1e6, 1e6], [1e6, 1e6]]
  ]);
  test.deepEqual(asArray(voronoi.voronoi().cells([[100, 100], [-100, -100]])), [
    [[1e6, -1e6], [-1e6, 1e6], [1e6, 1e6]],
    [[-1e6, 1e6], [1e6, -1e6], [-1e6, -1e6]]
  ]);
  test.end();
});

tape("voronoi.cells(points) can separate two points with an arbitrary diagonal", function(test) {
  test.deepEqual(asArray(voronoi.voronoi().cells([[-100, -100], [100, 0]])), [
    [[-500025, 1e6], [499975, -1e6], [-1e6, -1e6], [-1e6, 1e6]],
    [ [499975, -1e6], [-500025, 1e6], [1e6, 1e6], [1e6, -1e6]]
  ]);
  test.end();
});

tape("voronoi.cells(points) can handle three collinear points", function(test) {
  test.deepEqual(asArray(voronoi.voronoi().cells([[-100, -100], [0, 0], [100, 100]])), [
    [[-1e6, 999900], [999900, -1e6], [-1e6, -1e6]],
    [[-999900, 1e6], [1e6, -999900], [1e6, -1e6], [999900, -1e6], [-1e6, 999900], [-1e6, 1e6]],
    [[1e6, -999900], [-999900, 1e6], [1e6, 1e6]]
  ]);
  test.end();
});
