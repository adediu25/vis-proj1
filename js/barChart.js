class BarChart {
    constructor(_config, _data) {
        // Configuration object with defaults
        // Important: depending on your vis and the type of interactivity you need
        // you might want to use getter and setter methods for individual attributes
        this.config = {
          parentElement: _config.parentElement,
          containerWidth: _config.containerWidth || 700,
          containerHeight: _config.containerHeight || 500,
          margin: _config.margin || {top: 5, right: 5, bottom: 20, left: 50},
          tooltipPadding: _config.tooltipPadding || 10,
        }
        this.data = _data;
        this.fullData = this.data;
        this.resettingBrush = false;
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
        vis.xScale = d3.scaleBand()
            .range([0, vis.width])
            .paddingInner(0.1);

        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);

        // Initialize axes
        vis.xAxis = d3.axisBottom(vis.xScale)
            .ticks(6)
            .tickSizeOuter(0);

        vis.yAxis = d3.axisLeft(vis.yScale)
            .tickSizeOuter(0);

        vis.xAxisG = vis.chart.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`);
        
        vis.yAxisG = vis.chart.append('g')
            .attr('class', 'axis y-axis');

        // Append titles
    }

    updateVis() {
        let vis = this;
        
        vis.bars = [
            {
                value: 'Urban',
                count: vis.data.filter(d => d.urban_rural_status == 'Urban').length
            },
            {
                value: 'Small City',
                count: vis.data.filter(d => d.urban_rural_status == 'Small City').length
            },
            {
                value: 'Suburban',
                count: vis.data.filter(d => d.urban_rural_status == 'Suburban').length
            },
            {
                value: 'Rural',
                count: vis.data.filter(d => d.urban_rural_status == 'Rural').length
            }
        ]

        vis.xScale.domain(vis.bars.map(d => d.value));
        vis.yScale.domain([0, d3.max(vis.bars, d => d.count)]);
        
        vis.renderVis();
    }

    renderVis(){
        let vis = this;

        const bars = vis.chart.selectAll('.bar')
            .data(vis.bars)
        .join('rect')
            .attr('class', 'bar')
            .attr('width', vis.xScale.bandwidth())
            .attr('height', d => vis.yScale(0) - vis.yScale(d.count))
            .attr('y', d => vis.yScale(d.count))
            .attr('x', d => vis.xScale(d.value))
            .attr('fill', 'steelblue');

        bars
            .on('mousemove', (event,d) => {
                d3.select('#tooltip')
                .style('display', 'block')
                .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
                .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
                .html(`
                    <div class="tooltip-title">${d.value}</div>
                    <div><i>Number of counties: ${d.count}</i></div>
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

        vis.brushG.call(vis.brush.on('brush end', function({selection}) {
            let value = [];
            if (selection){
                const [x0, x1] = selection;
                value = bars
                .style("fill", "lightgray")
                .filter(d => x0 <= vis.xScale(d.value) + vis.xScale.bandwidth() && vis.xScale(d.value) < x1)
                .style("fill", "steelblue")
                .data();
            } else {
                bars.style("fill", "steelblue");
            }

            if(!vis.resettingBrush && selection){
                const [x0, x1] = selection;

                let filteredData = vis.data.filter(d => x0 <= vis.xScale(d.urban_rural_status) + vis.xScale.bandwidth() && vis.xScale(d.urban_rural_status) < x1);

                d3.select(vis.config.parentElement)
                    .node()
                    .dispatchEvent(new CustomEvent('brush-selection', {detail:{
                        brushedData: filteredData
                    }}))
            }
        }
        ).on('start', function() {
            console.log('started');
            // vis.updateVis();
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
        vis.updateVis();
        vis.resettingBrush = false;
    }

    updateFromBrush(brushedData){
        let vis = this;

        vis.data = brushedData;
        vis.updateVis();
        vis.data = vis.fullData;
    }
}