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
        this.resettingBrush = false;
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

        // vis.brushG = vis.svg.append('g')
        //     .attr('class', 'brush');

        // Append group element that will contain our actual chart 
        // and position it according to the given margin config
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
        
        vis.brushG = vis.chart.append('g')
            .attr('class', 'brush');

        // Initialize projection and path generator
        vis.projection = d3.geoAlbersUsa().translate([vis.width / 2, vis.height/2]);
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

        vis.chart.append('path')
          .datum(topojson.mesh(vis.data, vis.data.objects.states, function(a,b){return a !== b;}))
          .attr("id", "state-borders")
          .attr('d', vis.geoPath)
          .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        vis.brush = d3.brush()
          .extent([[0, 0], [vis.width, vis.height]]);

        vis.svg.append('path')
          .datum(topojson.mesh(vis.data, vis.data.objects.states, function(a,b){return a !== b;}))
          .attr("id", "state-borders")
          .attr('d', vis.geoPath)
          .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);


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
        const countyPath = vis.chart.selectAll('.county')
            .data(counties.features)
          .join('path')
            .attr('class', 'county')
            .attr('d', vis.geoPath)
            .style('fill', d => {
              if (d.properties.county_data && vis.config.geoDataFunc(d) >= 0) {
                return vis.colorScale(vis.config.geoDataFunc(d));
              } else {
                return 'url(#lightstripe)';
              }
            });
    
        countyPath
            .on('mousemove', (event,d) => {
              const dataValue = vis.config.geoDataFunc(d) >= 0 ? `<strong>${vis.config.geoDataFunc(d)}` : 'No data available'; 
              d3.select('#tooltip')
                .style('display', 'block')
                .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
                .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
                .html(`
                  <div class="tooltip-title">${d.properties.county_data.display_name}</div>
                  <div>${d.properties.county_data.urban_rural_status}</div>
                  <div>${vis.config.axisTitle}: ${dataValue}</div>
                `);

              // pass the same event down to brush to allow panning
              let brush_element = vis.svg.select('.overlay').node();
              let new_event = new MouseEvent('mousemove', {
                  bubbles: true,
                  cancelable: true,
                  view: window,
                  pageX: event.pageX,
                  pageY: event.pageY,
                  clientX: event.clientX,
                  clientY: event.clientY
              })
              brush_element.dispatchEvent(new_event);
            })
            .on('mouseleave', () => {
              d3.select('#tooltip').style('display', 'none');
            })
            .on('mousedown', (event, d) => {
              let brush_element = vis.svg.select('.overlay').node();
              let new_event = new MouseEvent('mousedown', {
                  bubbles: true,
                  cancelable: true,
                  view: window,
                  pageX: event.pageX,
                  pageY: event.pageY,
                  clientX: event.clientX,
                  clientY: event.clientY
              })
              brush_element.dispatchEvent(new_event);
          });
    
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

        // update legend label
        vis.legend.selectAll('.legend-title').join('text')
            .attr('class', 'legend-title')
            .attr('dy', '.35em')
            .attr('y', -10)
            .text(vis.config.axisTitle);

        ///
        ///not really working look into it
        //
        // vis.chart.selectAll('#state-borders')
        //     .datum(topojson.mesh(vis.data, vis.data.objects.states, function(a,b){return a !== b;}))
        //     .join()
        //     .attr("id", "state-borders")
        //     .attr('d', vis.geoPath)
        //     .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        //revisit have to get based on geoData now
        vis.brushG.call(vis.brush.on('end', function({selection}) {
          let value = [];
          if (selection){
              const [[x0, y0], [x1, y1]] = selection;
              value = countyPath
              .style("fill", "lightgray")
              // figure out this filter
              .filter(d => {
                const [[countyX0, countyY0],[countyX1, countyY1]] = vis.geoPath.bounds(d);
                return countyX1 >= x0-1 && countyX0 <= x1+1 && countyY1 >= y0-1 && countyY0 <= y1+1;
              })
              .style("fill", d => {
                if (d.properties.county_data && vis.config.geoDataFunc(d) >= 0) {
                  return vis.colorScale(vis.config.geoDataFunc(d));
                } else {
                  return 'url(#lightstripe)';
                }
              })
              .data();
          } else {
              countyPath.style("fill", d => {
                if (d.properties.county_data && vis.config.geoDataFunc(d) >= 0) {
                  return vis.colorScale(vis.config.geoDataFunc(d));
                } else {
                  return 'url(#lightstripe)';
                }
              });
          }
          }
        ).on('start', function() {
          console.log('started')
          if (!vis.resettingBrush){
            d3.select(vis.config.parentElement)
                .node()
                .dispatchEvent(new CustomEvent('brush-start', {}));
          }
        }));
      }

      resetBrush(){
        let vis = this;
        vis.resettingBrush = true;
        vis.brushG.call(vis.brush.clear);
        vis.resettingBrush = false;
    }
}