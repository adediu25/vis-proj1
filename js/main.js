let data;

d3.csv('data/national_health_data.csv')
    .then(_data => {
        data = _data
        // work with data
        data.forEach(d => {
            console.log(d.display_name);
        });
    }, data)
    .catch(error => {
        console.error('Error:');
        console.log(error);
    });
