class Scatterplot {
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 700,
            containerHeight: _config.containerHeight || 500,
            margin: _config.margin || {top: 30, right: 20, bottom: 20, left: 35},
            dataFuncX: _config.dataFuncX || function(d){return d.median_household_income;},
            dataFuncY: _config.dataFuncY || function(d){return d.park_access;},
            axisTitleX: _config.axisTitleX || "Median Household Income (USD)",
            axisTitleY: _config.axisTitleY || "Park Access"
        }
        this.data = _data;
        this.initVis();
    }

    initVis(){
        let vis = this;

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
    
        vis.xScale = d3.scaleLinear()
            .range([0, vis.width])
    
        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);    

        vis.xAxis = d3.axisBottom(vis.xScale);

        vis.yAxis = d3.axisLeft(vis.yScale);

        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);
        
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
    
        vis.xAxisG = vis.chart.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`);

        vis.yAxisG = vis.chart.append('g')
            .attr('class', 'axis y-axis');

        vis.chart.append('text')
            .attr('class', 'axis-title')
            .attr('y', vis.height - 15)
            .attr('x', vis.width + 10)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')
            .text(vis.config.axisTitleX);

        vis.svg.append('text')
            .attr('class', 'axis-title')
            .attr('x', 0)
            .attr('y', 0)
            .attr('dy', '.71em')
            .text(vis.config.axisTitleY);
    }

    updateVis() {
        let vis = this;

        // vis.xValue = d => d.median_household_income;
        // vis.yValue = d => d.park_access;

        vis.xScale.domain([0, d3.max(vis.data, vis.config.dataFuncX)]);
        vis.yScale.domain([0, d3.max(vis.data, vis.config.dataFuncY)]);

        vis.renderVis();
    }

    renderVis() {
        let vis = this;

        vis.chart.selectAll('circle')
                // filter out data not collected
                .data(vis.data.filter(d => vis.config.dataFuncX(d) >= 0 && vis.config.dataFuncY(d) >= 0))
                .enter()
            .append('circle')
                .attr('r', 4)
                .attr('cy', d => vis.yScale(vis.config.dataFuncY(d)))
                .attr('cx', d => vis.xScale(vis.config.dataFuncX(d)))
                .attr('fill', 'steelblue');
   
        vis.xAxisG
            .call(vis.xAxis)

        vis.yAxisG
            .call(vis.yAxis)
    }
}
