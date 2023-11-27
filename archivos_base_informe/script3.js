// Cargar datos desde la URL del dataset
const url = 'https://raw.githubusercontent.com/PacitaUgarte/V1/main/astronauts.csv';

d3.csv(url).then(data => {
    // Crear dos conjuntos de datos, uno para "Undergraduate Major" y otro para "Graduate Major"
    const undergraduateData = aggregateData(data, 'Undergraduate Major');
    const graduateData = aggregateData(data, 'Graduate Major');

    // Tamaño del SVG
    const width = 800; // Ajusta el ancho según tus preferencias
    const height = 400; // Ajusta la altura según tus preferencias

    // Crear escala de colores
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Crear SVG para "Undergraduate Major"
    const svgUndergraduate = d3.select("#undergraduate-bubble-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Crear burbujas para "Undergraduate Major"
    createBubbleChart(svgUndergraduate, undergraduateData, "Undergraduate Major");

    // Crear SVG para "Graduate Major"
    const svgGraduate = d3.select("#graduate-bubble-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Crear burbujas para "Graduate Major"
    createBubbleChart(svgGraduate, graduateData, "Graduate Major");

    // Función para crear un gráfico de burbujas
    function createBubbleChart(svg, data, title) {
        // Escala para el tamaño de las burbujas
        const radiusScale = d3.scaleSqrt()
            .domain([0, d3.max(data, d => d.count)])
            .range([5, 40]); // Ajusta el rango según tus preferencias

        // Ordenar datos por tamaño de burbuja de menor a mayor
        data.sort((a, b) => d3.descending(a.count, b.count));

        // Posición inicial X para el primer círculo
        let currentX = 10;

        // Crear burbujas ordenadas
        const bubbles = svg.selectAll(".bubble")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "bubble")
            .attr("cx", (d, i) => {
                // Ajustar la posición X según el tamaño del círculo
                const offset = radiusScale(d.count) + 5; // 5 de espacio entre círculos
                currentX += offset;
                return currentX - offset / 2; // Centrar el círculo en la posición calculada
            })
            .attr("cy", height / 2) // Centrar verticalmente
            .attr("r", d => radiusScale(d.count))
            .attr("fill", (d, i) => colorScale(i)) // Colores diferentes para cada burbuja
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut);

        // Crear título
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .style("font-size", "18px")
            .text(title);

        // Función para manejar el evento mouseover
        function handleMouseOver(event, d) {
            // Mostrar tooltip con la cantidad de personas al lado del mouse
            const tooltip = svg.append("g")
                .attr("class", "tooltip");

            // Actualizar el contenido del tooltip
            tooltip.append("text")
                .attr("x", width / 2)
                .attr("y", height - 10)
                .attr("text-anchor", "middle")
                .style("font-size", "14px")
                .text(`${d.major}: ${d.count} personas`);
        }

        // Función para manejar el evento mouseout
        function handleMouseOut() {
            // Ocultar tooltip
            d3.select(".tooltip").remove();
        }
    }

    // Función para agregar y consolidar datos duplicados
    function aggregateData(data, column) {
        const aggregatedData = d3.rollup(data, v => v.length, d => d[column]);
        return Array.from(aggregatedData, ([major, count]) => ({ major, count }));
    }
}).catch(error => {
    console.error('Error al cargar los datos:', error);
});




