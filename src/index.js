import './index.scss';
import countries from './countries';
import * as d3 from 'd3';
import 'normalize.css';
import './assets/sprites/flags.css';
import imgBlank from './assets/sprites/blank.gif';

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

window.addEventListener('load', loaded);

function loaded() {
  const nodes = d3.select('svg')
    .append('g')
    .attr('class', 'nodes')
    .selectAll('rect')
    .data(nodesData)
    .enter()
    .append('rect')
    .attr('width', 1)
    .attr('height', 1)
    .attr('fill', 'green')
  ;

  const flagContainer = d3.select('.flag-container')
    .selectAll('rect')
    .data(nodesData)
    .enter()
    .append('rect')
    .attr('href', imgBlank)
    .attr('class', d => `flag flag-${d.code}`)
    .attr('title', d => d.country)
    .call(d3
      .drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended)
    )
  ;

  const links = d3.select('svg')
    .append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(linksData)
    .enter()
    .append('line')
    .attr('stroke-width', 1)
    .attr('stroke', 'gray')
  ;

  const svgElement = document.querySelector('svg');
  let offsetX = svgElement.getBoundingClientRect().left + scrollX;
  let offsetY = svgElement.getBoundingClientRect().top + scrollY;

  window.addEventListener('resize', function () {
    offsetX = svgElement.getBoundingClientRect().left + scrollX;
    offsetY = svgElement.getBoundingClientRect().top + scrollY;
  });

  let originalPos;
  const pauseOnHover = function (node, key) {
    if (!!originalPos && node.country === originalPos.id) {
      node[key] = originalPos[key];
    }
    return node[key];
  };

  simulation.on('tick', function () {
    nodes
      .attr('x', d => pauseOnHover(d, 'x'))
      .attr('y', d => pauseOnHover(d, 'y'))
    ;

    flagContainer
      .style(
        'left',
        d => (pauseOnHover(d, 'x') + offsetX - 8) + 'px'
      )
      .style(
        'top',
        d => (pauseOnHover(d, 'y') + offsetY - 8) + 'px'
      )
    ;

    links
      .attr('x1', d => pauseOnHover(d.source, 'x'))
      .attr('y1', d => pauseOnHover(d.source, 'y'))
      .attr('x2', d => pauseOnHover(d.target, 'x'))
      .attr('y2', d => pauseOnHover(d.target, 'y'))
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

  flagContainer.on('mouseover', function (e) {
    if (!active) {
      if (!originalPos) {
        originalPos = { x: e.x, y: e.y, id: e.country };
      }
    }
  });
  flagContainer.on('mouseleave', function () {
    originalPos = null;
  });
};
