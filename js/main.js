d3.csv('data/national_health_data.csv')
    .then(data => {
        // work with data
        data.forEach(d => {
            d.median_household_income = +d.median_household_income;
            d.park_access = +d.park_access;
            console.log(d);
        });

        const scatterplot = new Scatterplot({parentElement: '#chart-area'}, data);

        scatterplot.updateVis()
    })
    .catch(error => {
        console.error('Error:');
        console.log(error);
    });
