
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface ShipScoreProps {
  score: number;
}

const ShipScore: React.FC<ShipScoreProps> = ({ score }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 180;
    const height = 180;
    const margin = 10;
    const radius = Math.min(width, height) / 2 - margin;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .html(''); // Clear previous

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const arc = d3.arc()
      .innerRadius(radius - 15)
      .outerRadius(radius)
      .startAngle(-Math.PI * 0.75)
      .endAngle(Math.PI * 0.75)
      .cornerRadius(10);

    const background = g.append('path')
      .datum({ endAngle: Math.PI * 0.75 })
      .style('fill', '#1f2937')
      .attr('d', arc as any);

    const color = score > 80 ? '#10b981' : score > 50 ? '#f59e0b' : '#ef4444';

    const foreground = g.append('path')
      .datum({ endAngle: -Math.PI * 0.75 })
      .style('fill', color)
      .attr('d', arc as any);

    const targetAngle = -Math.PI * 0.75 + (Math.PI * 1.5 * (score / 100));

    foreground.transition()
      .duration(1500)
      .ease(d3.easeCubicOut)
      .attrTween('d', (d: any) => {
        const interpolate = d3.interpolate(d.endAngle, targetAngle);
        return (t) => {
          d.endAngle = interpolate(t);
          return arc(d) as string;
        };
      });

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('class', 'font-bold text-4xl fill-white')
      .text(score);

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '2.5em')
      .attr('class', 'text-xs fill-gray-400 font-medium')
      .text('SHIP SCORE');

  }, [score]);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default ShipScore;
