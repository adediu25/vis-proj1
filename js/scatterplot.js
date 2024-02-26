class Scatterplot {
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 700,
            containerHeight: _config.containerHeight || 500,
            margin: _config.margin || {top: 30, right: 20, bottom: 20, left: 35},
            tooltipPadding: _config.tooltipPadding || 10,
            dataFuncX: _config.dataFuncX || function(d){return d.median_household_income;},
            dataFuncY: _config.dataFuncY || function(d){return d.park_access;},
            axisTitleX: _config.axisTitleX || "Median Household Income (USD)",
            axisTitleY: _config.axisTitleY || "Park Access"
        }
        this.data = _data;
        this.resettingBrush = false;
        this.initVis();
    }

    initVis(){
        let vis = this;

        vis.svg = d3.select(vis.config.parentElement)
            .append("svg")
                .attr("width", vis.config.containerWidth)
                .attr("height", vis.config.containerHeight)

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
    
        vis.xScale = d3.scaleLinear()
            .range([0, vis.width])
    
        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);    

        vis.xAxis = d3.axisBottom(vis.xScale);

        vis.yAxis = d3.axisLeft(vis.yScale);

        // vis.brushG = vis.svg.append('g')
        //     .attr('class', 'brush');
        
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        vis.brushG = vis.chart.append('g')
            .attr('class', 'brush');
    
        vis.xAxisG = vis.chart.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`);

        vis.yAxisG = vis.chart.append('g')
            .attr('class', 'axis y-axis');

        vis.chart.append('text')
            .attr('class', 'x-axis-title')
            .attr('y', vis.height - 15)
            .attr('x', vis.width + 10)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')
            .text(vis.config.axisTitleX);

        vis.svg.append('text')
            .attr('class', 'y-axis-title')
            .attr('x', 0)
            .attr('y', 0)
            .attr('dy', '.71em')
            .text(vis.config.axisTitleY);

        vis.brush = d3.brush()
            .extent([[0, 0], [vis.width, vis.height]]);
    }

    updateVis() {
        let vis = this;

        vis.xScale.domain([0, d3.max(vis.data, vis.config.dataFuncX)]);
        vis.yScale.domain([0, d3.max(vis.data, vis.config.dataFuncY)]);

        vis.renderVis();
    }

    renderVis() {
        let vis = this;

        // update x axis label
        vis.chart.selectAll('.x-axis-title').join('text')
            .attr('class', 'x-axis-title')
            .attr('y', vis.height - 15)
            .attr('x', vis.width + 10)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')
            .text(vis.config.axisTitleX);

        vis.svg.selectAll('.y-axis-title').join('text')
            .attr('class', 'y-axis-title')
            .attr('x', 0)
            .attr('y', 0)
            .attr('dy', '.71em')
            .text(vis.config.axisTitleY);

        const circles = vis.chart.selectAll('circle')
                // filter out data not collected
                .data(vis.data.filter(d => vis.config.dataFuncX(d) >= 0 && vis.config.dataFuncY(d) >= 0))
            .join('circle')
                .attr('r', 3)
                .attr('cy', d => vis.yScale(vis.config.dataFuncY(d)))
                .attr('cx', d => vis.xScale(vis.config.dataFuncX(d)))
                .attr('fill', 'steelblue');


        // vis.brushG.call(vis.brush);

        circles
            .on('mousemove', (event,d) => {
                d3.select('#tooltip')
                .style('display', 'block')
                .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
                .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
                .html(`
                    <div class="tooltip-title">${d.display_name}</div>
                    <div><i>${d.urban_rural_status}</i></div>
                    <ul>
                    <li>${vis.config.axisTitleX}: ${vis.config.dataFuncX(d)}</li>
                    <li>${vis.config.axisTitleY}: ${vis.config.dataFuncY(d)}</li>
                    </ul>
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
                console.log(new_event.type);
                brush_element.dispatchEvent(new_event);
            });
   
        vis.xAxisG
            .call(vis.xAxis)

        vis.yAxisG
            .call(vis.yAxis)

        vis.brushG.call(vis.brush.on('brush end', function({selection}) {
            let value = [];
            if (selection){
                const [[x0, y0], [x1, y1]] = selection;
                value = circles
                .style("fill", "gray")
                .filter(d => x0 <= vis.xScale(vis.config.dataFuncX(d)) && vis.xScale(vis.config.dataFuncX(d)) <= x1
                        && y0 <= vis.yScale(vis.config.dataFuncY(d)) && vis.yScale(vis.config.dataFuncY(d)) <= y1)
                .style("fill", "steelblue")
                .data();
            } else {
                circles.style("fill", "steelblue");
            }
            }
        ).on('start', function() {
            console.log('started')
            if (!vis.resettingBrush){
                d3.select(vis.config.parentElement)
                    .node()
                    .dispatchEvent(new CustomEvent('selection', {}));
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
