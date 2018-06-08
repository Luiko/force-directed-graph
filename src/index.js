import './index.scss';
import countries from './countries';
import * as d3 from 'd3';

const { nodes: nodesData, links: linksData } = countries;

const simulation = d3.forceSimulation(nodesData);

const width = +d3.select('svg').attr('width');
const height = +d3.select('svg').attr('height');

simulation.force('many', d3.forceManyBody());
simulation.force('center', d3.forceCenter(width / 2, height / 2));
simulation.force('links', d3.forceLink(linksData).id((_, i) => i));
simulation.force('radial', d3.forceRadial(100, width / 2, height / 2));

const standardRadialStrength = 0.09;
simulation.force('radial').strength(standardRadialStrength);

const links = d3.select('svg')
  .append('g')
  .attr('class', 'links')
  .selectAll('line')
  .data(linksData)
  .enter()
  .append('line')
  .attr('stroke-width', 1)
  .attr('stroke', 'yellow')
;

const nodes = d3.select('svg')
  .append('g')
  .attr('class', 'nodes')
  .selectAll('circle')
  .data(nodesData)
  .enter()
  .append('circle')
  .attr('r', 4)
  .attr('fill', 'green')
  .call(d3
    .drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended)
  )
;

nodes.append('title').text(d => d.country);

let originalPos;
const pauseOnHover = function (node, key) {
  if (!!originalPos && node.country === originalPos.id) {
    node[key] = originalPos[key];
  }
  return node[key];
};

simulation.on('tick', function () {

  links
    .attr('x1', d => pauseOnHover(d.source, 'x'))
    .attr('y1', d => pauseOnHover(d.source, 'y'))
    .attr('x2', d => pauseOnHover(d.target, 'x'))
    .attr('y2', d => pauseOnHover(d.target, 'y'))
  ;

  nodes
    .attr('cx', d => pauseOnHover(d, 'x'))
    .attr('cy', d => pauseOnHover(d, 'y'))
  ;
})
;

let active = false;

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.7).restart();
  d.fx = d.x;
  d.fy = d.y;
  active = true;
  simulation.force('radial').strength(0.16);
  setTimeout(() => {
    simulation.force('radial').strength(standardRadialStrength);
  }, 300);
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0.1);
  d.fx = null;
  d.fy = null;
  active = false;
}

nodes.on('mouseover', function (e) {
  if (!active) {
    if (!originalPos) {
      originalPos = { x: e.x, y: e.y, id: e.country };
    }
  }
});

nodes.on('mouseleave', function () {
  originalPos = null;
});
