class ChoroplethMap {
    constructor(_config, _data) {
        this.config = {
          parentElement: _config.parentElement,
          containerWidth: _config.containerWidth || 700,
          containerHeight: _config.containerHeight || 600,
          margin: _config.margin || {top: 0, right: 0, bottom: 0, left: 0},
          tooltipPadding: 10,
          legendBottom: 50,
          legendLeft: 50,
          legendRectHeight: 12, 
          legendRectWidth: 150,
          geoDataFunc: _config.geoDataFunc || function(d){return d.properties.county_data.median_household_income;},
          axisTitle: _config.axisTitle || "Median Household Income (USD)"
        }
        this.data = _data;
        this.initVis();
      }
  
    initVis() {
        let vis = this;

        // Calculate inner chart size. Margin specifies the space around the actual chart.
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement).append('svg')
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        // Append group element that will contain our actual chart 
        // and position it according to the given margin config
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        // Initialize projection and path generator
        vis.projection = d3.geoAlbersUsa();
        vis.geoPath = d3.geoPath().projection(vis.projection);

        vis.colorScale = d3.scaleLinear()
            .range(['#cfe2f2', '#0d306b'])
            .interpolate(d3.interpolateHcl);


        // Initialize gradient that we will later use for the legend
        vis.linearGradient = vis.svg.append('defs').append('linearGradient')
            .attr("id", "legend-gradient");

        // Append legend
        vis.legend = vis.chart.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${vis.config.legendLeft},${vis.height - vis.config.legendBottom})`);
        
        vis.legendRect = vis.legend.append('rect')
            .attr('width', vis.config.legendRectWidth)
            .attr('height', vis.config.legendRectHeight);

        vis.legendTitle = vis.legend.append('text')
            .attr('class', 'legend-title')
            .attr('dy', '.35em')
            .attr('y', -10)
            .text(vis.config.axisTitle)

        vis.updateVis();
    }

    updateVis() {
        let vis = this;
        
        // prevent issues with counties not included in data but included in json
        const dataExtent = d3.extent(vis.data.objects.counties.geometries.filter(d => d.properties.county_data != null && vis.config.geoDataFunc(d) >= 0), vis.config.geoDataFunc);
        // const dataExtent = d3.extent(vis.data.objects.counties.geometries.filter(d => d.properties.county_data != null), (d) => d.properties.county_data.park_access);

        
        // Update color scale
        vis.colorScale.domain(dataExtent);

        // Define begin and end of the color gradient (legend)
        vis.legendStops = [
        { color: '#cfe2f2', value: dataExtent[0], offset: 0},
        { color: '#0d306b', value: dataExtent[1], offset: 100},
        ];

        vis.renderVis();
    }

    renderVis() {
        let vis = this;
        // Convert compressed TopoJSON to GeoJSON format
        const counties = topojson.feature(vis.data, vis.data.objects.counties)
  
        // Defines the scale of the projection so that the geometry fits within the SVG area
        vis.projection.fitSize([vis.width, vis.height], counties);
    
        // Append world map
        const countryPath = vis.chart.selectAll('.county')
            .data(counties.features)
          .join('path')
            .attr('class', 'county')
            .attr('d', vis.geoPath)
            .attr('fill', d => {
              if (d.properties.county_data && vis.config.geoDataFunc(d) >= 0) {
                return vis.colorScale(vis.config.geoDataFunc(d));
              } else {
                return 'url(#lightstripe)';
              }
            });
    
        // countryPath
        //     .on('mousemove', (event,d) => {
        //       const popDensity = d.properties.pop_density ? `<strong>${d.properties.pop_density}</strong> pop. density per km<sup>2</sup>` : 'No data available'; 
        //       d3.select('#tooltip')
        //         .style('display', 'block')
        //         .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
        //         .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
        //         .html(`
        //           <div class="tooltip-title">${d.properties.name}</div>
        //           <div>${popDensity}</div>
        //         `);
        //     })
        //     .on('mouseleave', () => {
        //       d3.select('#tooltip').style('display', 'none');
        //     });
    
        // Add legend labels
        vis.legend.selectAll('.legend-label')
            .data(vis.legendStops)
          .join('text')
            .attr('class', 'legend-label')
            .attr('text-anchor', 'middle')
            .attr('dy', '.35em')
            .attr('y', 20)
            .attr('x', (d,index) => {
              return index == 0 ? 0 : vis.config.legendRectWidth;
            })
            .text(d => Math.round(d.value * 10 ) / 10);
    
        // Update gradient for legend
        vis.linearGradient.selectAll('stop')
            .data(vis.legendStops)
          .join('stop')
            .attr('offset', d => d.offset)
            .attr('stop-color', d => d.color);
    
        vis.legendRect.attr('fill', 'url(#legend-gradient)');
      }
}