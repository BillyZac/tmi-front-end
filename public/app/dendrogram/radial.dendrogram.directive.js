(function() {
  angular.module('app')
  .directive('radialdendrogram', dendrogram)

  function dendrogram() {
    return {
      restrict: 'E',
      replace: true,
      template: '<div class="dendrogram"></div>',
      scope: {
        filter: '=',
        habitat: '='
       },
      link: drawTreeOfLife,
      controller: 'DendrogramController',
      controllerAs: 'vm',
      bindToController: true
    }
  }

  function drawTreeOfLife($scope, $element, $attr) {
    /***** Initialization ****/
    var tooltip = dendrogramService.initializeTooltip()
    var diameter = 600
    var viz = d3.select($element[0]).append("svg")
        .attr("width", diameter)
        .attr("height", diameter)
        .append("g")
        .attr("transform", "translate(" + diameter / 3 + "," + diameter / 2 + ")");
    var tree = d3.layout.tree()
        .size([360, diameter / 3-1])
        .separation(function(a, b) { return (a.parent == b.parent ? 2: 1) / a.depth; });
    var diagonal = d3.svg.diagonal.radial()
        .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

    /***** Execution ****/
    var data = dendrogramService.getData()

    // Inital rendering, with no filter
    visualizeIt(data)

    // Watch habitat and update visualization on change
    $scope.$watch('vm.habitat', function (newVal, oldVal) {
      if (newVal) {
        var selectedHabitat = newVal
        var filterOptions = {
          habitat: newVal
        }
        // Select the nodes that match the filter and modify them
        d3.selectAll('circle')
          .transition()
          .duration(150)
          .attr("r", function(d) {
            if  (matchFilter(d, filterOptions)) {
              return 10
            }
            return 6
          })
        // Modify the appearance of the text as well
        d3.selectAll('.node-name')
          .transition()
          .duration(150)
          .style('opacity', function(d) {
            if  (matchFilter(d, filterOptions)) {
              return 1
            }
            return 0.1
          })
      }

    })

    function visualizeIt(treeData) {
      var nodes = tree.nodes(treeData),
          links = tree.links(nodes);

      var link = viz.selectAll(".link")
          .data(links)
        .enter().append("path")
          .attr("class", "link")
          .attr("d", diagonal)
          //changes link color and thickness when hovered over, reverts when mouseoff
          .on("mouseover", function(d){
            link.style("stroke", "red")
            link.style("stroke-width", "2px");
          })
          .on("mouseout", function(d){
            link.style("stroke", "")
            link.style("stroke-width", "");
          });

      var node = viz.selectAll(".node")
          .data(nodes)
        .enter().append("g")
          .attr("class", "node")
          .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
          .on("mouseover", function(d){
            tooltip
              .transition()
              .duration(500)
              .style("opacity", 0.9);
            tooltip
              .html(
                "<strong>" +
                "<h3>" +
                d.habitat +
                "</h3>" +
                "<div>" +
                '<img src="http://lorempixel.com/100/100/animals/">' +
                '</div>' +
                '<a href="#">Learn more...</a>' +
                "</strong>"
              )
              .style("left", (d3.event.pageX) + "px")
              .style("top", (d3.event.pageY - 28) + "px");
          })
          .on('mouseout', function(){
            tooltip
              .transition()
              .duration(1000)
              .style("opacity", 0);
          })

      node.append("circle")
          .attr("r", 6)

      node.append("text")
          .attr("dy", 3)
          .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
          .attr("transform", function(d) { return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)"; })
          .text(function(d) { return d.name; })
          .style('opacity', 0.1)
          .attr('class', 'node-name')
    }

    d3.select(self.frameElement).style("height", diameter - 10 + "px");

 }

 function matchFilter(d, filterOptions) {
   if (
     d.habitat === filterOptions.habitat &&
     true // put another criteria here
   ) {
     return true
   }
   return false
 }
})()
