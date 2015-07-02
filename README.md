# d3-voronoi

This module implements Steven J. Fortune’s algorithm for computing the Voronoi diagram of a set of two-dimensional points, largely based on [Raymond Hill’s previous implementation](https://github.com/gorhill/Javascript-Voronoi). Voronoi diagrams are particularly useful for improving interaction in visualization by increasing the target area of visual elements such as dots in a scatterplot. (See [“Strikeouts On The Rise”](http://www.nytimes.com/interactive/2013/03/29/sports/baseball/Strikeouts-Are-Still-Soaring.html) in *The New York Times* and Nate Vack’s [Voronoi picking](http://bl.ocks.org/njvack/1405439) for examples; also see Tovi Grossman’s paper on [bubble cursors](http://www.tovigrossman.com/BubbleCursor).)

<a href="http://bl.ocks.org/mbostock/4060366"><img src="http://bl.ocks.org/mbostock/raw/4060366/thumbnail.png" width="202"></a>
<a href="http://bl.ocks.org/mbostock/4237768"><img src="http://bl.ocks.org/mbostock/raw/4237768/thumbnail.png" width="202"></a>

This implementation also computes the dual of the Voronoi diagrams: the Delaunay triangulation and mesh.

<a href="http://bl.ocks.org/mbostock/4341156"><img src="http://bl.ocks.org/mbostock/raw/4341156/thumbnail.png" width="202"></a>
<a href="http://bl.ocks.org/mbostock/1073373"><img src="http://bl.ocks.org/mbostock/raw/1073373/thumbnail.png" width="202"></a>

## Installing

If you use NPM, `npm install d3-voronoi`. Otherwise, download the [latest release](https://github.com/d3/d3-voronoi/releases/latest).

## API Reference

<a name="voronoi" href="#voronoi">#</a> <b>voronoi</b>()

Creates a new Voronoi layout with default [*x*-](#voronoi_x) and [*y*-](#voronoi_y)accessors and the default [extent](#voronoi_extent).

<a name="_voronoi" href="#_voronoi">#</a> <i>voronoi</i>(<i>data</i>)

Returns an array of polygons, one for each input point in the specified *data* points, corresponding to the cells in the computed Voronoi diagram. For each element *i* in *data*, the polygon *i* represents the corresponding cell in the computed Voronoi diagram. Each polygon is represented as an array of points [*x*, *y*] where *x* and *y* are the point coordinates, and a `point` field that refers to the corresponding element in *data*.

The returned polygon is *open* in that it does not contain an explicit closing point that duplicates the initial point; a triangle, for example, is an array of three points. The polygon is counterclockwise, assuming the origin ⟨0,0⟩ is in the top-left corner.

Note: if any points are coincident or have NaN positions, **the behavior of this method is undefined.** Most likely, invalid polygons will be returned! You must filter invalid points and consolidate coincident points before computing the Voronoi diagram.

<a name="voronoi_x" href="#voronoi_x">#</a> <i>voronoi</i>.<b>x</b>([<i>x</i>])

If *x* is specified, sets the *x*-coordinate accessor. If *x* is not specified, returns the current *x*-coordinate accessor, which defaults to:

```js
function x(d) {
  return d[0];
}
```

<a name="voronoi_y" href="#voronoi_y">#</a> <i>voronoi</i>.<b>y</b>([<i>y</i>])

If *y* is specified, sets the *y*-coordinate accessor. If *y* is not specified, returns the current *y*-coordinate accessor, which defaults to:

```js
function y(d) {
  return d[1];
}
```

<a name="voronoi_extent" href="#voronoi_extent">#</a> <i>voronoi</i>.<b>extent</b>([<i>extent</i>])

If *extent* is specified, sets the clip extent of the Voronoi layout to the specified bounds and returns the layout. The *extent* bounds are specified as an array [​[<i>x0</i>, <i>y0</i>], [<i>x1</i>, <i>y1</i>]​], where <i>x0</i> is the left side of the extent, <i>y0</i> is the top, <i>x1</i> is the right and <i>y1</i> is the bottom. If *extent* is null, no clipping is performed. If *extent* is not specified, returns the current clip extent which defaults to null.

Use of a clip extent is strongly recommended in conjunction with [*voronoi*](#_voronoi), as unclipped polygons may have large coordinates which may not render correctly.

<a name="voronoi_size" href="#voronoi_size">#</a> <i>voronoi</i>.<b>size</b>([<i>size</i>])

An alias for [*voronoi*.extent](#voronoi_extent) where the minimum *x* and *y* of the extent are ⟨0,0⟩. Given a Voronoi layout `v`, this is equivalent to:

```js
v.extent([[0, 0], size])
```

<a name="voronoi_links" href="#voronoi_links">#</a> <i>voronoi</i>.<b>links</b>(<i>data</i>)

Returns the Delaunay triangulation of the specified *data* array as an array of links. Each link has the following attributes:

* `source` - the source node (an element in *data*).
* `target` - the target node (an element in *data*).

<a name="voronoi_triangles" href="#voronoi_triangles">#</a> <i>voronoi</i>.<b>triangles</b>(<i>data</i>)

Returns the <a href="https://en.wikipedia.org/wiki/Delaunay_triangulation">Delaunay triangulation</a> of the specified *data* array as an array of triangles. Each triangle is a three-element array containing elements from *data*.

## Changes from D3 3.x:

* Removed deprecated constructor.

* Removed deprecated delaunay constructor; use voronoi.triangles instead.

* Renamed *voronoi*.clipExtent to [*voronoi*.extent](#voronoi_extent).
