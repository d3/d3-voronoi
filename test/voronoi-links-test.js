    //   "links": {
    //     "for two points": function(v) {
    //       assert.deepEqual(v.links([[200, 200], [760, 300]]), [
    //         {source: [200, 200], target: [760, 300]}
    //       ]);
    //     },
    //     "for three points": function(v) {
    //       assert.deepEqual(v.links([[200, 200], [500, 250], [760, 300]]), [
    //         {source: [200, 200], target: [500, 250]},
    //         {source: [500, 250], target: [760, 300]},
    //         {source: [760, 300], target: [200, 200]}
    //       ]);
    //     }
    //   },

    // "a voronoi layout with custom x- and y-accessors": {
    //   topic: function(voronoi) {
    //     return voronoi()
    //         .x(function(d) { return d.x; })
    //         .y(43);
    //   },
    //   "links": {
    //     topic: function(v) {
    //       return v.y(function(d) { return d.y; });
    //     },
    //     "for two points": function(v) {
    //       assert.deepEqual(v.links([{x: 200, y: 200}, {x: 760, y: 300}]), [
    //         {source: {x: 200, y: 200}, target: {x: 760, y: 300}}
    //       ]);
    //     },
    //     "for three points": function(v) {
    //       assert.deepEqual(v.links([{x: 200, y: 200}, {x: 500, y: 250}, {x: 760, y: 300}]), [
    //         {source: {x: 200, y: 200}, target: {x: 500, y: 250}},
    //         {source: {x: 500, y: 250}, target: {x: 760, y: 300}},
    //         {source: {x: 760, y: 300}, target: {x: 200, y: 200}}
    //       ]);
    //     }
    //   }
