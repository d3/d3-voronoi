var tape = require("tape"),
    d3 = require("../"),
    asArray = require("./asArray"),
    polygonArea = require("./polygonArea");

var infinity = 1e6, // For sufficiently small values of Infinity.
    infinite = [[-infinity, -infinity], [infinity, infinity]];

tape("voronoi() has the expected defaults", function(test) {
  var voronoi = d3.voronoi();
  test.equal(voronoi.extent(), null);
  test.equal(voronoi.size(), null);
  test.equal(voronoi.x()([1, 2]), 1);
  test.equal(voronoi.y()([1, 2]), 2);
  test.end();
});

tape("voronoi.size([x, y]) is an alias for voronoi.extent([[0, 0], [x, y]])", function(test) {
  var voronoi = d3.voronoi();
  test.equal(voronoi.size([3, 4]), voronoi);
  test.deepEqual(voronoi.size(), [3, 4]);
  test.deepEqual(voronoi.extent(), [[0, 0], [3, 4]]);
  voronoi.size([960, 500]);
  test.deepEqual(voronoi.size(), [960, 500]);
  test.deepEqual(voronoi.extent(), [[0, 0], [960, 500]]);
  test.deepEqual(asArray(voronoi.polygons([[200, 200]])), [
    [[0, 0], [0, 500], [960, 500], [960, 0]]
  ]);
  test.deepEqual(asArray(voronoi.polygons([[200, 200], [760, 300]])), [
    [[435.3571428571429, 500], [524.6428571428572, 0], [0, 0], [0, 500]],
    [[524.6428571428572, 0], [435.3571428571429, 500], [960, 500], [960, 0]]
  ]);
  test.end();
});

tape("voronoi.size() returns the width and height of the extent", function(test) {
  var voronoi = d3.voronoi().extent([[1, 2], [34, 56]]);
  test.deepEqual(voronoi.size(), [33, 54]);
  test.end();
});

tape("voronoi.extent([[x1, y1], [x2, y2]]) sets the specified extent", function(test) {
  var voronoi = d3.voronoi();
  test.equal(voronoi.extent([[1, 2], [3, 4]]), voronoi);
  test.deepEqual(voronoi.extent(), [[1, 2], [3, 4]]);
  voronoi.extent([[0, 0], [960, 500]]);
  test.deepEqual(voronoi.size(), [960, 500]);
  test.deepEqual(voronoi.extent(), [[0, 0], [960, 500]]);
  test.deepEqual(asArray(voronoi.polygons([[200, 200], [760, 300]])), [
    [[435.3571428571429, 500], [524.6428571428572, 0], [0, 0], [0, 500]],
    [[524.6428571428572, 0], [435.3571428571429, 500], [960, 500], [960, 0]]
  ]);
  test.end();
});

tape("voronoi.x(x) sets the specified x-accessor", function(test) {
  var voronoi = d3.voronoi().extent(infinite);
  test.equal(voronoi.x(function(d) { return d.x; }), voronoi);
  test.equal(voronoi.x()({x: 1}), 1);
  test.deepEqual(asArray(voronoi.polygons([{x: 200, 1: 200}, {x: 760, 1: 300}])), [
    [[-178046.78571428574, infinity], [179096.07142857145, -infinity], [-infinity, -infinity], [-infinity, infinity]],
    [[179096.07142857145, -infinity], [-178046.78571428574, infinity], [infinity, infinity], [infinity, -infinity]]
  ]);
  test.end();
});

tape("voronoi.y(y) sets the specified y-accessor", function(test) {
  var voronoi = d3.voronoi().extent(infinite);
  test.equal(voronoi.y(function(d) { return d.y; }), voronoi);
  test.equal(voronoi.y()({y: 1}), 1);
  test.deepEqual(asArray(voronoi.polygons([{0: 200, y: 200}, {0: 760, y: 300}])), [
    [[-178046.78571428574, infinity], [179096.07142857145, -infinity], [-infinity, -infinity], [-infinity, infinity]],
    [[179096.07142857145, -infinity], [-178046.78571428574, infinity], [infinity, infinity], [infinity, -infinity]]
  ]);
  test.end();
});

tape("voronoi.x(x) allows the specified x-accessor to be a constant", function(test) {
  var voronoi = d3.voronoi().extent(infinite).y(function(d) { return d; });
  test.equal(voronoi.x(42), voronoi);
  test.equal(voronoi.x()(), 42);
  test.deepEqual(asArray(voronoi.polygons([200, 760])), [
    [[-infinity, 480], [infinity, 480], [infinity, -infinity], [-infinity, -infinity]],
    [[infinity, 480], [-infinity, 480], [-infinity, infinity], [infinity, infinity]]
  ]);
  test.end();
});

tape("voronoi.y(y) allows the specified y-accessor to be a constant", function(test) {
  var voronoi = d3.voronoi().extent(infinite).x(function(d) { return d; });
  test.equal(voronoi.y(43), voronoi);
  test.equal(voronoi.y()(), 43);
  test.deepEqual(asArray(voronoi.polygons([200, 760])), [
    [[480, infinity], [480, -infinity], [-infinity, -infinity], [-infinity, infinity]],
    [[480, -infinity], [480, infinity], [infinity, infinity], [infinity, -infinity]]
  ]);
  test.end();
});

tape("voronoi.polygons(points) returns an array of polygons for the specified points", function(test) {
  test.deepEqual(asArray(d3.voronoi().extent(infinite).polygons([[200, 200], [760, 300]])), [
    [[-178046.78571428574, infinity], [179096.07142857145, -infinity], [-infinity, -infinity], [-infinity, infinity]],
    [[179096.07142857145, -infinity], [-178046.78571428574, infinity], [infinity, infinity], [infinity, -infinity]]
  ]);
  test.end();
});

tape("voronoi.polygons(points) returns open, counterclockwise polygons", function(test) {
  d3.voronoi().extent(infinite).polygons([[200, 200], [760, 300]]).forEach(function(cell) {
    test.ok(cell.length > 2);
    test.ok(cell[0][0] !== cell[cell.length - 1][0] || cell[0][1] !== cell[cell.length - 1][1]);
    test.ok(polygonArea(cell) > 0);
  });
  test.end();
});

tape("voronoi.polygons(points) returns polygons where polygons[i].data is equal to points[i]", function(test) {
  var points = [[200, 200], [760, 300]];
  d3.voronoi().extent(infinite).polygons(points).forEach(function(cell, i) {
    test.equal(cell.data, points[i]);
  });
  test.end();
});

tape("voronoi.polygons(points) can handle no points", function(test) {
  test.deepEqual(asArray(d3.voronoi().size([960, 500]).polygons([])), []);
  test.end();
});

tape("voronoi.polygons(points) handles coincident points", function(test) {
  var voronoi = d3.voronoi();
  test.equal(voronoi.polygons([[0, 0], [0, 0]])[1].length, 0);
  test.end();
});

tape("voronoi.polygons(points) can handle a single point", function(test) {
  test.deepEqual(asArray(d3.voronoi().size([960, 500]).polygons([[100, 100]])), [
    [[0, 0], [0, 500], [960, 500], [960, 0]]
  ]);
  test.deepEqual(asArray(d3.voronoi().size([960, 500]).polygons([[-100, -100]])), [
    [[0, 0], [0, 500], [960, 500], [960, 0]]
  ]);
  test.end();
});

tape("voronoi.polygons(points) can handle a two points whose cells do not intersect the extent", function(test) {
  test.deepEqual(asArray(d3.voronoi().size([960, 500]).polygons([[480, -200], [480, 100]])), [
    ,
    [[0, 0], [0, 500], [960, 500], [960, 0]]
  ]);
  test.deepEqual(asArray(d3.voronoi().size([960, 500]).polygons([[480, 100], [480, -200]])), [
    [[0, 0], [0, 500], [960, 500], [960, 0]]
    ,
  ]);
  test.deepEqual(asArray(d3.voronoi().size([960, 500]).polygons([[480, 1000], [480, -2000]])), [
    [[0, 0], [0, 500], [960, 500], [960, 0]]
    ,
  ]);
  test.deepEqual(asArray(d3.voronoi().size([960, 500]).polygons([[480, -2000], [480, 1000]])), [
    ,
    [[0, 0], [0, 500], [960, 500], [960, 0]]
  ]);
  test.end();
});

tape("voronoi.polygons(points) can separate two points with a horizontal line", function(test) {
  test.deepEqual(asArray(d3.voronoi().extent(infinite).polygons([[0, -100], [0, 100]])), [
    [[-infinity, 0], [infinity, 0], [infinity, -infinity], [-infinity, -infinity]],
    [[infinity, 0], [-infinity, 0], [-infinity, infinity], [infinity, infinity]]
  ]);
  test.deepEqual(asArray(d3.voronoi().extent(infinite).polygons([[0, 100], [0, -100]])), [
    [[infinity, 0], [-infinity, 0], [-infinity, infinity], [infinity, infinity]],
    [[-infinity, 0], [infinity, 0], [infinity, -infinity], [-infinity, -infinity]]
  ]);
  test.end();
});

tape("voronoi.polygons(points) can separate two points with a vertical line", function(test) {
  test.deepEqual(asArray(d3.voronoi().extent(infinite).polygons([[100, 0], [-100, 0]])), [
    [[0, -infinity], [0, infinity], [infinity, infinity], [infinity, -infinity]],
    [[0, infinity], [0, -infinity], [-infinity, -infinity], [-infinity, infinity]]
  ]);
  test.deepEqual(asArray(d3.voronoi().extent(infinite).polygons([[-100, 0], [100, 0]])), [
    [[0, infinity], [0, -infinity], [-infinity, -infinity], [-infinity, infinity]],
    [[0, -infinity], [0, infinity], [infinity, infinity], [infinity, -infinity]]
  ]);
  test.end();
});

tape("voronoi.polygons(points) can separate two points with a diagonal line", function(test) {
  test.deepEqual(asArray(d3.voronoi().extent(infinite).polygons([[-100, -100], [100, 100]])), [
    [[-infinity, infinity], [infinity, -infinity], [-infinity, -infinity]],
    [[infinity, -infinity], [-infinity, infinity], [infinity, infinity]]
  ]);
  test.deepEqual(asArray(d3.voronoi().extent(infinite).polygons([[100, 100], [-100, -100]])), [
    [[infinity, -infinity], [-infinity, infinity], [infinity, infinity]],
    [[-infinity, infinity], [infinity, -infinity], [-infinity, -infinity]]
  ]);
  test.end();
});

tape("voronoi.polygons(points) can separate two points with an arbitrary diagonal", function(test) {
  test.deepEqual(asArray(d3.voronoi().extent(infinite).polygons([[-100, -100], [100, 0]])), [
    [[-500025, infinity], [499975, -infinity], [-infinity, -infinity], [-infinity, infinity]],
    [ [499975, -infinity], [-500025, infinity], [infinity, infinity], [infinity, -infinity]]
  ]);
  test.end();
});

tape("voronoi.polygons(points) can handle three collinear points", function(test) {
  test.deepEqual(asArray(d3.voronoi().extent(infinite).polygons([[-100, -100], [0, 0], [100, 100]])), [
    [[-infinity, 999900], [999900, -infinity], [-infinity, -infinity]],
    [[-999900, infinity], [infinity, -999900], [infinity, -infinity], [999900, -infinity], [-infinity, 999900], [-infinity, infinity]],
    [[infinity, -999900], [-999900, infinity], [infinity, infinity]]
  ]);
  test.end();
});
