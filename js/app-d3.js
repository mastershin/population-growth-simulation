/*
Jae Y Shin
Email: mastershin@gmail.com
LinkedIn: https://www.linkedin.com/in/jaeyulshin

Population Simulator (using actual Birth/Death data)

Artificial Life Class Project @ University of Advancing Technology
Spring 2014 Semester


// http://www.infoplease.com/ipa/A0005074.html


2009 Data
15	    15-19	20-24	25-29	30-34	35-39	40-44	45-49
0.12%	8.83%	21.39%	31.55%	37.74%	30.09%	9.60%	0.80%	Avg=0.18	Sigma=0.146348951


*/

var WIDTH = 900;
var HEIGHT = 600;


//var maxNodes = 200;
var maxNodes = function() {
    return $("#maxNodes").val();  
};

var currYear = 2014;
var numNodes = 1;       // # of alive node
var degree_k = 3;       // 5 is average # of network
var loopInterval = function() {
    return $("#interval").val();
};
var circleRadius = 12;
var keepAfterDeath = 20;    // keep showing as a node after node dies, and then remove!

function printNodesAndEdges() {
    var output = '';
    output += "NodeId,Age,Generation\n";
    nodes.forEach( function(node, idx) {
        output += (node.id + "," + node.age + "," + node.generation + '\n' );
    });

    output += "EdgeFromId,EdgeToId" + '\n';
    links.forEach( function(l) {
       output += l.source.id + ',' + l.target.id + '\n'; 
    });
    
    $('#output').val(output);
}

// set up initial nodes and links
//  - nodes are known by 'id', not by index in array.
//  - reflexive edges are indicated on the node (as a bold black circle).
//  - links are always source < target; edge directions are set by 'left' and 'right'.
var nodes = [
    {id: 0, reflexive: false, name: 'initialNode', celebrity: 0, centrality: 0, age: 0, life: getLifeDuration(), generation: 0, died: 0, gender: 'F' },
    {id: 1, reflexive: false, name: 'initialNode', celebrity: 0, centrality: 0, age: 0, life: getLifeDuration(), generation: 0, died: 0, gender: 'M' },
    //{id: 1, reflexive: true },
    //{id: 2, reflexive: false}
  ],
  lastNodeId = 1,
  links = [
    //{source: nodes[0], target: nodes[1], left: false, right: true },
    //{source: nodes[1], target: nodes[2], left: false, right: true }
    ],
    elementsCircle = [],
    elementsText = [];      // contains node.id : { txtElem: txtElemObject }


function getLifeDuration() {
    return (Math.random() * 50 + 30) | 0;   // "| 0" is effectively casting to (int)
}
/*
function rnd_bmt() {        // http://www.protonfish.com/jslib/boxmuller.shtml
	var x = 0, y = 0, rds, c;

	// Get two random numbers from -1 to 1.
	// If the radius is zero or greater than 1, throw them out and pick two new ones
	// Rejection sampling throws away about 20% of the pairs.
	do {
	x = Math.random()*2-1;
	y = Math.random()*2-1;
	rds = x*x + y*y;
	}
	while (rds == 0 || rds > 1)

	// This magic is the Box-Muller Transform
	c = Math.sqrt(-2*Math.log(rds)/rds);

	// It always creates a pair of numbers. I'll return them in an array. 
	// This function is quite efficient so don't be afraid to throw one away if you don't need both.
	return [x*c, y*c];
}
*/
/*
function normalcdf(mean, sigma, to)     // http://stackoverflow.com/questions/5259421/cumulative-distribution-function-in-javascript
{               // this is just an approximation
    var z = (to-mean)/Math.sqrt(2*sigma*sigma);
    var t = 1/(1+0.3275911*Math.abs(z));
    var a1 =  0.254829592;
    var a2 = -0.284496736;
    var a3 =  1.421413741;
    var a4 = -1.453152027;
    var a5 =  1.061405429;
    var erf = 1-(((((a5*t + a4)*t) + a3)*t + a2)*t + a1)*t*Math.exp(-z*z);
    var sign = 1;
    if(z < 0)
    {
        sign = -1;
    }
    return (1/2)*(1+sign*erf);
}
*/
function getCelebrityProbabilty() {
    var p_celebrity = Math.random();  // higher means popular!  (Not used at this point, but, probably for the future. - Perhaps live longer?)
    return p_celebrity;
}
function getProbOfBirthByAge(age) {     

//15	    15-19	20-24	25-29	30-34	35-39	40-44	45-49
//0.12%	    8.83%	21.39%	31.55%	37.74%	30.09%	9.60%	0.80%	Avg=0.18	Sigma=0.146348951
    var p = 0;
    if( age < 15 )  
        p = 0;
    else if(age < 19)
        p = 0.0883;
    else if(age < 24)
        p = 0.2139;
    else if(age < 29)
        p = 0.3155;
    else if(age < 34)
        p = 0.3009;
    else if(age < 39)
        p = 0.0960;
    else if(age < 49)
        p = 0.0080;
    
    return p;
}

// http://www.cdc.gov/nchs/data/dvs/LEWK3_2009.pdf

function getProbOfDeathByAge(age) {     // this equation was calculated using Non-linear curve fit
    var x1 = 0.0000370355031346435;
    var x2 = 0.0916285793799129;
    var x3 = -0.389137843885012;
    var x4 = 0.0000147221178635628;
    var p = x1 * Math.exp(x2 * (age+x3)) + x4;    // value calculated by Nonlinear curve fitting
    
    p = p * ( ($('#deathRate').val() ));     // slider
//    console.log(age,p);
    return p;
}
function getScreenCoords(x, y, ctm) {
  var xn = ctm.e + x*ctm.a;
  var yn = ctm.f + y*ctm.d;
  return { x: xn, y: yn };
}
function getNewNode(new_generation, x, y) {
    var gender = (Math.random() >= 0.5) ? 'F' : 'M';        // assume 50% chance for male/female
      
    var new_node = {id: ++lastNodeId, 
                    reflexive: false,
                    celebrity: getCelebrityProbabilty, 
                    centrality: 0, 
                    age: 0, 
                    life: getLifeDuration(), 
                    generation: new_generation, 
                    died: 0, 
                    gender: gender,
                    x: x,
                    y: y};
    
    return new_node;
//    {id: ++lastNodeId, reflexive: false, celebrity: getCelebrityProbabilty(), centrality: 0, age: 0, life: getLifeDuration(), generation: 0, died: 0 };
}
function createNodes() {

    var topologyChanged = 0;

    var nodes_to_be_added = [];
    
    // each node divides into 2 cells w/ probability.
    nodes.forEach( function(node, idx) {
        if( node.died == 0 && node.gender === 'F' ) {           // must not have died and Female only...
            var prob = Math.random();
            
            var divisionProb = getProbOfBirthByAge(node.age);
            
            if( prob < divisionProb ) {        // time to divide!
                //console.log(prob);
    /*
                var cx = (Math.random() * width/2 + width/4 ) | 0;
                var cy = (Math.random() * height/2 + height/4 ) | 0;
                
                var circElem = elementsCircle[node.id];       // find node's circle's cx & cy 
                if( circElem ) {
                    cx = +circElem.getAttribute('cx');
                    cy = +circElem.getAttribute('cy');
                    var ctm = circElem.getCTM();
                    var coord = getScreenCoords(cx, cy, ctm);
    
                    //console.log(coord.x, coord.y);
                    cx = coord.x | 0;
                    cy = coord.y | 0;
                }
                
            */
                // insert new node at point

                var new_node = getNewNode(node.generation+1, node.x, node.y);
    
                //new_node.x = cx;
                //new_node.y = cy;
                  
                  
                nodes_to_be_added.push(new_node);
                
                links.push( {source: node, target: new_node, left: false, right: true } );
    
                
                numNodes++;
                topologyChanged++;
            }
        }        
    });
    
    nodes_to_be_added.forEach( function(n) {
       nodes.push(n); 
    });
    
    

    
/*
  var rnd_x = Math.random() * width/2;
  var rnd_y = Math.random() * height/2;
  // insert new node at point
  
  var p_celebrity = Math.random();  // higher means popular!
  
  var node = {id: ++lastNodeId, reflexive: false, celebrity: p_celebrity, centrality: 0, life: getLifeDuration() };
  node.x = rnd_x;
  node.y = rnd_y;
  
  nodes.push(node);
  numNodes++;
*/

  return topologyChanged;  // return # of nodes changed
}
function destroyNode() {
    var topologyChanged = 0;
/*    
    var node_to_be_removed = [];
        // now process DEATH of a node
    nodes.forEach( function(node, idx) {
        if( node.died == 0 ) {
            var prob = Math.random();
            var deathProb = getProbOfDeathByAge(node.age);
            if( prob < deathProb && numNodes > 1 ) {
                console.log(node.id, node.age, prob, deathProb);
                node.died = 1;
                numNodes--;
                topologyChanged++;
            }
        }
        else
            node.died++;        // this keeps died node for a while
            
        if( node.died > keepAfterDeath)
            node_to_be_removed.push(node);
    });
*/
    // physically remove node
    for(var i=nodes.length - 1; i >= 0; i-- ) {
        var node = nodes[i];

        if( node.died == 0 ) {
            var prob = Math.random();
            var deathProb = getProbOfDeathByAge(node.age);
            //if( prob < deathProb && numNodes > 1 ) {      // at least 1 survivor
            if( prob < deathProb ) {        // even 1 can die
                //console.log(node.id, node.age, prob, deathProb);
                node.died = 1;
                numNodes--;
            }
        }
        else
            node.died++;        // this keeps died node for a while
        
        if( node.died > keepAfterDeath ) {
            for(var j = links.length -1; j >= 0; j--) {
                if( links[j].source.id == node.id || links[j].target.id == node.id ) {
                    links.splice(j, 1);     // remove link
                }
                
            }
            nodes.splice(i, 1);     // remove node
            topologyChanged++;
        }        
    }
    
    
    return topologyChanged;
}
// returns pdf (cumulative) for all nodes, given a specific node 'n'
var createLink_Random = function(n) {
    
    var one_over_N = 1.0 / nodes.length;
    
    var prob = [];
    //p = 1 / nodes.length;  // use Bernourlli graph equation

    // now, when # of links reach maximum degree, then probability should decrease
    // according to Bernourlli graph
    // http://www.stats.ox.ac.uk/~reinert/talks/graduatenetworklectures.pdf  (slide #55)

    
    var lambda = -0.4;
    
    //console.log(p);
    nodes.forEach( function() {
        var numLinks = 0;
        links.forEach( function(l) {
           if( l.source.id == n.id || l.target.id == n.id ) 
           numLinks++;
        });
        //console.log(numLinks);
        
        var p = one_over_N * Math.exp(lambda * numLinks);
        //console.log(p);

        prob.push(p);
    });
    
    
    
    
    //console.log(prob_cumul);
    
    return prob;
};
var currLinkAlgorithm = createLink_Random;
function createLinks() {

    return 0;
    
    
    /*
    var topologyChangedCount = 0;
    // for each node, calculate probability from each node's point of view
    //for(var idx = 0; idx < nodes.length; idx++)
    nodes.forEach( function(node, idx) {
        var prob = currLinkAlgorithm(nodes[idx]);
        var p_cumul = 0;
        var prob_cumul = [];
        
        prob.forEach( function(p) {
            prob_cumul.push(p_cumul);
            p_cumul += p;
        });
        
        var q = -1;     // chosen node index to create a link, based on probability
        var r = Math.random();
        if( r > 0 )
        {
            for(var i = 0; i < prob_cumul.length; i++) {
                if( r < prob_cumul[i]) {
                    q = i;
                    break;
                }
            }
        }
        //console.log('q=' + q);
        if( q >= 0 && q != idx ) {  // must not be equal to self ( q!= idx)
            // node follows q
            // but, see if links[] exist already
            var existsInLink = false;
            var existsInLinkButOtherWay = false;   // this means q is already following me. Reflexive!
            var linkIndex = -1;     // currently not used.
            links.forEach( function(l, l_idx) {
                if(l.source == idx && l.target == q) {
                    existsInLink = true;
                    linkIndex = l_idx;
                   //break;
                }
                else if(l.source == q && l.target == idx) {     // in this case, q is following me already.
                    existsInLinkButOtherWay = true;
                    linkIndex = l_idx;
                }
            });
            if( !existsInLink ) {
                 
                if(existsInLinkButOtherWay ) {  // exists other way (q follows me), but, I'm not following.
                    nodes[idx].reflexive = true;
                    nodes[idx].centrality++;
                }
                else {
                    var node1 = nodes[idx];
                    var node2 = nodes[q];
                    links.push( {source: node1, target: node2, left: false, right: true } );
                    node2.centrality++; // increase target node's centrality (# of incoming arrow)
                    topologyChangedCount++;
                    //console.log( 'creating link: ' + node1.id + " ==> " + node2.id);
                }
            }
        }
            
        //console.log(prob_cumul);

    });
    
    return topologyChangedCount;
    */
}

function loop() {
    $('#population').text(numNodes + ' (Year ' + currYear++ + ')');
    nodes.forEach( function(node, idx) {        // reduce age
        if( node.died > 0 )     // no more changes
            return;
            
        if( node.life > 0)
            node.life--;
        node.age++;
        
        var txtElem = elementsText[ node.id ];
        if( txtElem )
            txtElem.textContent = node.age + ":" + node.generation;            // update current age display
    });
    
    var topologyChanged = 0;
    if( numNodes < maxNodes() )
    {
        topologyChanged += createNodes();
    }
    
    topologyChanged += destroyNode();
    
    topologyChanged += createLinks();
    
    if(topologyChanged > 0)
        restart();
        
        
        
    setTimeout('loop()', loopInterval());        
}


// set up SVG for D3
var width  = WIDTH,
    height = HEIGHT,
    colors = d3.scale.category10();


//var svg = d3.select('body')
var svg = d3.select('#d3svg')
  .append('svg:svg')
  .attr('viewBox', '0 0 ' + width + ' ' + height)
  //.attr('width', width)
  //.attr('height', height);


// init D3 force layout
var force = d3.layout.force()
    .nodes(nodes)
    .links(links)
    .size([width, height])
    .linkDistance(30)
    .charge(-100)
    .on('tick', tick)

// define arrow markers for graph links
svg.append('svg:defs').append('svg:marker')
    .attr('id', 'end-arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 6)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
  .append('svg:path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#000');

svg.append('svg:defs').append('svg:marker')
    .attr('id', 'start-arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 4)
    .attr('markerWidth', 4)
    .attr('markerHeight', 4)
    .attr('orient', 'auto')
  .append('svg:path')
    .attr('d', 'M10,-5L0,0L10,5')
    .attr('fill', '#000');

// line displayed when dragging new nodes
var drag_line = svg.append('svg:path')
  .attr('class', 'link dragline hidden')
  .attr('d', 'M0,0L0,0');

// handles to link and node element groups
var path = svg.append('svg:g').selectAll('path'),
    circle = svg.append('svg:g').selectAll('g');

// mouse event vars
var selected_node = null,
    selected_link = null,
    mousedown_link = null,
    mousedown_node = null,
    mouseup_node = null;

function resetMouseVars() {
  mousedown_node = null;
  mouseup_node = null;
  mousedown_link = null;
}

// update force layout (called automatically each iteration)
function tick() {
  // draw directed edges with proper padding from node centers
  path.attr('d', function(d) {
    var deltaX = d.target.x - d.source.x,
        deltaY = d.target.y - d.source.y,
        dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
        normX = deltaX / dist,
        normY = deltaY / dist,
        sourcePadding = d.left ? 17 : 12,
        targetPadding = d.right ? 17 : 12,
        sourceX = d.source.x + (sourcePadding * normX),
        sourceY = d.source.y + (sourcePadding * normY),
        targetX = d.target.x - (targetPadding * normX),
        targetY = d.target.y - (targetPadding * normY);
    return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
  });

  circle.attr('transform', function(d) {
    return 'translate(' + d.x + ',' + d.y + ')';
  });
}


var male_colors = d3.scale.quantize()
                    .domain(d3.range(100).reverse()).range(colorbrewer.Blues[9]);
var female_colors = d3.scale.quantize()
                    .domain(d3.range(100).reverse()).range(colorbrewer.Reds[9]);


// update graph (called when needed)
function restart() {
  // path (link) group
  path = path.data(links);

  // update existing links
  path.classed('selected', function(d) { return d === selected_link; })
    .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
    .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; });


  // add new links
  path.enter().append('svg:path')
    .attr('class', 'link')
    .classed('selected', function(d) { return d === selected_link; })
    .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
    .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; })
    .on('mousedown', function(d) {
      if(d3.event.ctrlKey) return;

      // select link
      mousedown_link = d;
      if(mousedown_link === selected_link) selected_link = null;
      else selected_link = mousedown_link;
      selected_node = null;
      restart();
    });

  // remove old links
  path.exit().remove();


  // circle (node) group
  // NB: the function arg is crucial here! nodes are known by id, not by index!
  circle = circle.data(nodes, function(d) { return d.id; });


    // radial
//    sortedCentrality = 

  // update existing nodes (reflexive & selected visual states)
  circle.selectAll('circle')
    .style('fill', function(d) 
        { 
            if( d.died > 0 )
                return "#eeeeee";


            if(d.gender === 'F') {
                return female_colors(d.age);
            }
            else {
                return male_colors(d.age);
            }
            
// random color
//            return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id); 
        })
    .classed('reflexive', function(d) { return d.reflexive; });

  // add new nodes
  var g = circle.enter().append('svg:g');



//.style('fill', function(d) { return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id); })


//    var colours = ["#6363FF", "#6373FF", "#63A3FF", "#63E3FF", "#63FFFB", "#63FFCB",
//                   "#63FF9B", "#63FF6B", "#7BFF63", "#BBFF63", "#DBFF63", "#FBFF63", 
//                   "#FFD363", "#FFB363", "#FF8363", "#FF7363", "#FF6364"];
    /*
    
    var heatmapColour = d3.scale.linear()
      .domain(d3.range(0, 1, 1.0 / (colours.length - 1)))
      .range(colours);
    
    // dynamic bit...
    var c = d3.scale.linear().domain(d3.extent(nodes, function(d) { return d.centrality; })).range([0,1]);

*/

//.style('fill', function(d) { return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id); })
//.style('stroke', function(d) { return d3.rgb(colors(d.id)).darker().toString(); })

  g.append('svg:circle')
    .attr('class', 'node')
    .attr('r', circleRadius)
    .style('fill', function(d) {
        if(d.gender === 'F') {
            return female_colors(d.age);
        }
        else {
            return male_colors(d.age);
        }
    })
        //elementsCircle[d.id] = this;       // store this SVG circle element
        //return heatmapColour(c(d.centrality)) })
    .classed('reflexive', function(d) { return d.reflexive; })
    .on('mouseover', function(d) {
      if(!mousedown_node || d === mousedown_node) return;
      // enlarge target node
      d3.select(this).attr('transform', 'scale(1.1)');
    })
    .on('mouseout', function(d) {
      if(!mousedown_node || d === mousedown_node) return;
      // unenlarge target node
      d3.select(this).attr('transform', '');
    })
    .on('mousedown', function(d) {
      if(d3.event.ctrlKey) return;

      // select node
      mousedown_node = d;
      if(mousedown_node === selected_node) selected_node = null;
      else selected_node = mousedown_node;
      selected_link = null;

      // reposition drag line
      drag_line
        .style('marker-end', 'url(#end-arrow)')
        .classed('hidden', false)
        .attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + mousedown_node.x + ',' + mousedown_node.y);

      restart();
    })
    .on('mouseup', function(d) {
      if(!mousedown_node) return;

      // needed by FF
      drag_line
        .classed('hidden', true)
        .style('marker-end', '');

      // check for drag-to-self
      mouseup_node = d;
      if(mouseup_node === mousedown_node) { resetMouseVars(); return; }

      // unenlarge target node
      d3.select(this).attr('transform', '');

      // add link to graph (update if exists)
      // NB: links are strictly source < target; arrows separately specified by booleans
      var source, target, direction;
      if(mousedown_node.id < mouseup_node.id) {
        source = mousedown_node;
        target = mouseup_node;
        direction = 'right';
      } else {
        source = mouseup_node;
        target = mousedown_node;
        direction = 'left';
      }

      var link;
      link = links.filter(function(l) {
        return (l.source === source && l.target === target);
      })[0];

      if(link) {        // existing link detected
        link[direction] = true;
      } else {
        link = {source: source, target: target, left: false, right: false};
        link[direction] = true;
        links.push(link);
      }

      // select new link
      selected_link = link;
      selected_node = null;
      restart();
    });

  // show node life
  g.append('svg:text')
      .attr('x', 0)
      .attr('y', 4)
      .attr('class', 'id')
      .style('font-size', '9px')
      .attr('fill', function(d) {
          return '#dddddd';
          /*
          if(d.age < 30) {
              return '#dddddd';
          }
          else
            return 'black';
        */
      })
      .text(function(d) { 
          elementsText[d.id] = this;        // this refers to <text class="id">(life)</text> object
          return d.age + ":" + d.generation; }
        );
    
  // remove old nodes
  circle.exit().remove();

  // set the graph in motion
  force.start();
}

function mousedown() {
  // prevent I-bar on drag
  //d3.event.preventDefault();
  
  // because :active only works in WebKit?
  svg.classed('active', true);

  if(d3.event.ctrlKey || mousedown_node || mousedown_link) return;

  // insert new node at point
  var point = d3.mouse(this);
  var node = getNewNode(0);     // 0 means 0th generation
  node.x = point[0];
  node.y = point[1];
  nodes.push(node);
  numNodes++;

  restart();
}


function mousemove() {
  if(!mousedown_node) return;

  // update drag line
  drag_line.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);

  restart();
}

function mouseup() {
  if(mousedown_node) {
    // hide drag line
    drag_line
      .classed('hidden', true)
      .style('marker-end', '');
  }

  // because :active only works in WebKit?
  svg.classed('active', false);

  // clear mouse event vars
  resetMouseVars();
}

function spliceLinksForNode(node) {
  var toSplice = links.filter(function(l) {
    return (l.source === node || l.target === node);
  });
  toSplice.map(function(l) {
    links.splice(links.indexOf(l), 1);
  });
}

// only respond once per keydown
var lastKeyDown = -1;


$(function() {

    var aspect = WIDTH / HEIGHT;

    svg.on('mousedown', mousedown)
      .on('mousemove', mousemove)
      .on('mouseup', mouseup);

// for future keyboard interaction
//d3.select(window)
//  .on('keydown', keydown)
//  .on('keyup', keyup);

    setTimeout('loop()', loopInterval());       // use this, so that time can be changed dynamically
    restart();
});








//////////////////////////////////

