
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface RiskRadarProps {
  data: {
    security: number;
    privacy: number;
    operations: number;
  };
}

const RiskRadar: React.FC<RiskRadarProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 240;
    const height = 240;
    const margin = 40;
    const radius = Math.min(width, height) / 2 - margin;
    const levels = 4;
    
    const axes = [
      { name: 'Security', value: data.security },
      { name: 'Privacy', value: data.privacy },
      { name: 'Ops', value: data.operations }
    ];

    const angleSlice = (Math.PI * 2) / axes.length;
    const rScale = d3.scaleLinear().domain([0, 100]).range([0, radius]);

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .html('');

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Draw the concentric circles (the grid)
    for (let j = 0; j < levels; j++) {
      const levelFactor = radius * ((j + 1) / levels);
      g.append('circle')
        .attr('r', levelFactor)
        .style('fill', 'none')
        .style('stroke', '#1f2937')
        .style('stroke-dasharray', '4 4');
    }

    // Draw the axis lines
    const axis = g.selectAll('.axis')
      .data(axes)
      .enter()
      .append('g');

    axis.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', (d, i) => rScale(100) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('y2', (d, i) => rScale(100) * Math.sin(angleSlice * i - Math.PI / 2))
      .style('stroke', '#374151');

    axis.append('text')
      .attr('x', (d, i) => rScale(115) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('y', (d, i) => rScale(115) * Math.sin(angleSlice * i - Math.PI / 2))
      .attr('text-anchor', 'middle')
      .attr('class', 'text-[10px] font-black fill-gray-500 uppercase tracking-widest')
      .text(d => d.name);

    // Draw the radar area
    const radarLine = d3.lineRadial<{ name: string; value: number }>()
      .radius(d => rScale(d.value))
      .angle((d, i) => i * angleSlice)
      .curve(d3.curveLinearClosed);

    g.append('path')
      .datum(axes)
      .attr('d', radarLine as any)
      .style('fill', 'rgba(79, 70, 229, 0.3)')
      .style('stroke', '#6366f1')
      .style('stroke-width', '2px')
      .style('filter', 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.5))');

    // Add blobs for points
    g.selectAll('.radarCircle')
      .data(axes)
      .enter().append('circle')
      .attr('r', 4)
      .attr('cx', (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('cy', (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2))
      .style('fill', '#818cf8');

  }, [data]);

  return (
    <div className="flex items-center justify-center p-2 bg-gray-900/20 rounded-3xl border border-gray-800/50">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default RiskRadar;
