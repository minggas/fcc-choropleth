const endCountry =
  "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json";

const endEducation =
  "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json";

const width = 960,
  height = 600;

let tooltip = d3
  .select("body")
  .append("div")
  .attr("id", "tooltip")
  .style("opacity", 0);

let svg = d3
  .select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const path = d3.geoPath();

d3.json(endCountry).then(us => {
  //console.log(us);
  d3.json(endEducation).then(edu => {
    const eduDomain = edu.map(el => el.bachelorsOrHigher);

    console.log(us);

    const legendColor = d3
      .scaleThreshold()
      .domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 8))
      .range(d3.schemeGreens[9]);

    svg
      .append("g")
      .attr("class", "usa")
      .selectAll("path")
      .data(topojson.feature(us, us.objects.states).features)
      .enter()
      .append("path")
      .attr("class", "state")
      .attr("d", path)
      .attr("stroke", "#fff");

    svg
      .append("g")
      .attr("class", "counties")
      .selectAll("path")
      .data(topojson.feature(us, us.objects.counties).features)
      .enter()
      .append("path")
      .attr("class", "county")
      .attr("d", path)
      .attr("fill", d => {
        let result = edu.filter(obj => obj.fips === d.id);
        console.log(result);
        if (result[0]) {
          return legendColor(result[0].bachelorsOrHigher);
        }
        //could not find a matching fips id in the data
        return legendColor(0);
      })
      .style("opacity", 0.8)
      .on("mouseover", d => {
        tooltip.style("opacity", 1);
        tooltip
          .html(`${getKeyByValue(edu, d.id)}`)
          .style("left", d3.event.pageX + 15 + "px")
          .style("top", d3.event.pageY - 5 + "px");
      })
      .on("mouseout", d => {
        tooltip.style("opacity", 0);
      });

    let data = [
      [0, 2.6],
      [2.6, 11.6625],
      [11.6625, 20.725],
      [20.725, 29.7875],
      [29.7875, 38.85],
      [38.85, 47.9125],
      [47.9125, 56.975],
      [56.975, 66.0375],
      [66.0375, 75.1]
    ];
    let legend = svg
      .append("g")
      .attr("id", "legend")
      .attr("transform", "translate(50,20)");

    legend
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d, i) => 0 + i * 30)
      .attr("width", 30)
      .attr("height", 30)
      .style("fill", d => legendColor(d[0]));
  });
});

function getKeyByValue(object, value) {
  var result = object.filter(obj => {
    return obj.fips === value;
  });
  return `${result[0].area_name}, ${result[0].state}: ${
    result[0].bachelorsOrHigher
  }%`;
}
