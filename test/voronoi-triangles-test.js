var tape = require("tape"),
    d3 = require("../");

tape("voronoi.triangles(points) returns the Delaunay triangulation for the specified points", function(test) {
  var voronoi = d3.voronoi();
  test.deepEqual(voronoi.triangles([[200, 200], [500, 250], [760, 300]]), [
    [[200, 200], [760, 300], [500, 250]]
  ]);
  test.end();
});

tape("voronoi.triangles(points) observes the specified x- and y-accessors", function(test) {
  var voronoi = d3.voronoi().x(function(d) { return d.x; }).y(function(d) { return d.y; });
  test.deepEqual(voronoi.triangles([{x: 200, y: 200}, {x: 500, y: 250}, {x: 760, y: 300}]), [
    [{x: 200, y: 200}, {x: 760, y: 300}, {x: 500, y: 250}]
  ]);
  test.end();
});

tape("voronoi.extent(extent).triangles(points) returns a limited triangulation", function(test) {
  var voronoi = d3.voronoi().extent([[0, 0], [800, 600]]);
  test.deepEqual(voronoi.triangles([[100, 100], [100, 200], [200, 200], [500, 250], [760, 300]]), [
    [[100, 100], [100, 200], [200, 200]]
  ]);
  test.end();
});

tape("voronoi.triangles(points) handles coincident points", function(test) {
  var voronoi = d3.voronoi();
  test.deepEqual(voronoi.triangles([[0, 0], [0, 0]]), []);
  test.end();
});
