class Histogram {
    constructor(_config, _data) {
        // Configuration object with defaults
        // Important: depending on your vis and the type of interactivity you need
        // you might want to use getter and setter methods for individual attributes
        this.config = {
          parentElement: _config.parentElement,
          containerWidth: _config.containerWidth || 500,
          containerHeight: _config.containerHeight || 300,
          margin: _config.margin || {top: 20, right: 20, bottom: 40, left: 40},
          tooltipPadding: _config.tooltipPadding || 10,
          dataFunc: _config.dataFunc || function(d){return d.median_household_income;},
          axisTitle: _config.axisTitle || "Median Household Income (USD)"
        }
        this.data = _data;
        this.fullData = this.data;
        this.resettingBrush = false;
        this.updatingFromBrush = false;
        this.initVis();
      }

    initVis(){
        let vis = this;

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        vis.svg = d3.select(vis.config.parentElement)
            .append("svg")
                .attr("width", vis.config.containerWidth)
                .attr("height", vis.config.containerHeight)

        // vis.brushG = vis.svg.append('g')
        //     .attr('class', 'brush');
        
        vis.chart = vis.svg
            .append("g")
                .attr("transform",`translate(${vis.config.margin.left},${vis.config.margin.top})`);
        
        vis.brushG = vis.chart.append('g')
            .attr('class', 'brush');

        vis.brush = d3.brushX()
            .extent([[0, 0], [vis.width, vis.height]])
            .on('start brush end', function({selection}) {
                // if (selection) vis.brushed(selection);
            });
    

        // Initialize scales
        vis.xScale = d3.scaleLinear()
            .range([0, vis.width]);

        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);

        // Initialize axes
        vis.xAxis = d3.axisBottom(vis.xScale)
            .ticks(6)
            .tickSizeOuter(0);

        vis.yAxis = d3.axisLeft(vis.yScale)

        vis.xAxisG = vis.chart.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`);
        
        vis.yAxisG = vis.chart.append('g')
            .attr('class', 'axis y-axis');

        // Append titles
        vis.chart.append('text')
            .attr('class', 'x-axis-title')
            .attr('y', vis.height + 25)
            .attr('x', vis.width + 10)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')
            .text(vis.config.axisTitle);

        vis.svg.append('text')
            .attr('class', 'y-axis-title')
            .attr('x', 0)
            .attr('y', 0)
            .attr('dy', '.71em')
            .text('Number of Counties');
    }

    updateVis() {
        let vis = this;


        vis.hist = d3.bin()
            .value(vis.config.dataFunc)
            .thresholds(20);
            

        vis.bins = vis.hist(vis.data.filter(d => vis.config.dataFunc(d) >= 0));

        // vis.xScale.domain([0, d3.max(vis.data, d => d.median_household_income)]);
        // vis.yScale.domain([0, d3.max(vis.bins, d => d.length)]);
        vis.xScale.domain([vis.bins[0].x0, vis.bins[vis.bins.length-1].x1]);
        vis.yScale.domain([0, d3.max(vis.bins, d => d.length)]);

        vis.renderVis();
    }

    renderVis(){
        let vis = this;

        vis.chart.append('text')
            .attr('class', 'x-axis-title')
            .attr('y', vis.height + 25)
            .attr('x', vis.width + 10)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')
            .text(vis.config.axisTitle);

        const bars = vis.chart.selectAll('.bar')
            .data(vis.bins)
        .join('rect')
            .attr('class', 'bar')
            .attr('width', d => vis.xScale(d.x1) - vis.xScale(d.x0) - 1)
            .attr('height', d => vis.yScale(0) - vis.yScale(d.length))
            .attr('y', d => vis.yScale(d.length))
            .attr('x', d => vis.xScale(d.x0) + 1)
            .attr('fill', 'steelblue');

        bars
            .on('mousemove', (event,d) => {
                d3.select('#tooltip')
                .style('display', 'block')
                .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
                .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
                .html(`
                    <div class="tooltip-title">${vis.config.axisTitle} Range: ${d.x0} - ${d.x1}</div>
                    <div><i>Number of counties: ${d.length}</i></div>
                `);
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
        
        vis.xAxisG.call(vis.xAxis);
        vis.yAxisG.call(vis.yAxis);

        vis.brushG.call(vis.brush.on('end', function({selection}) {
            let value = [];
            if (selection){
                const [x0, x1] = selection;
                value = bars
                .style("fill", "lightgray")
                .filter(d => x0 <= vis.xScale(d.x1) && vis.xScale(d.x0) < x1)
                .style("fill", "steelblue")
                .data();
            } else {
                bars.style("fill", "steelblue");
            }

            if(!vis.resettingBrush && !vis.updatingFromBrush && selection){
                const [x0, x1] = selection;

                let filteredData = [];

                vis.bins.forEach(d => {
                    if (x0 <= vis.xScale(d.x1) && vis.xScale(d.x0) < x1){
                        d.forEach(county => filteredData.push(county));
                        // filteredData.push(d);
                    }
                });

                d3.select(vis.config.parentElement)
                    .node()
                    .dispatchEvent(new CustomEvent('brush-selection', {detail:{
                        brushedData: filteredData
                    }}))
            }

            if (vis.resettingBrush){
                vis.updateVis();
            }
        })
        // .on('end', function({selection}) {

        // })
        .on('start', function() {
            if (!vis.resettingBrush){
                vis.updateVis();
                d3.select(vis.config.parentElement)
                    .node()
                    .dispatchEvent(new CustomEvent('brush-start', {detail:{

                    }}));
            }
        }));
    }

    resetBrush(){
        let vis = this;
        vis.resettingBrush = true;
        vis.brushG.call(vis.brush.clear);
        vis.resettingBrush = false;
    }

    updateFromBrush(brushedData){
        let vis = this;

        vis.updatingFromBrush = true;
        vis.data = brushedData;
        vis.updateVis();
        vis.data = vis.fullData;
        vis.updatingFromBrush = false;
    }
}
