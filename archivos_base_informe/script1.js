// Cargar datos desde la URL del dataset
const url = 'https://raw.githubusercontent.com/PacitaUgarte/V1/main/astronauts.csv';

    
d3.csv(url).then(data => {
    // Filtrar datos para obtener el conteo total de astronautas por género
    const countsByGender = d3.rollup(data, v => v.length, d => d.Gender);

    // Convertir el objeto de conteo a un array
    const genderCounts = Array.from(countsByGender, ([gender, count]) => ({ gender, count }));

    // Tamaño del SVG
    const width = 1000;
    const height = 600;

    // Configurar margen y tamaño del gráfico de barras
    const margin = { top: 40, right: 300, bottom: 90, left: 40 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Crear escala de colores
    const colorScale = d3.scaleOrdinal()
        .domain(genderCounts.map(d => d.gender))
        .range(d3.schemeCategory10);

    // Crear SVG
    const svg = d3.select("#bar-chart-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Crear grupo principal
    const chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Escala X (Género)
    const xScale = d3.scaleBand()
        .domain(genderCounts.map(d => d.gender))
        .range([0, chartWidth])
        .padding(0.1);

    // Escala Y (Número de Astronautas)
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(genderCounts, d => d.count)])
        .range([chartHeight, 0]);

    // Crear ejes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Dibujar barras
    const bars = chartGroup.selectAll(".bar")
        .data(genderCounts)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.gender))
        .attr("y", d => yScale(d.count))
        .attr("width", xScale.bandwidth())
        .attr("height", d => chartHeight - yScale(d.count))
        .attr("fill", d => colorScale(d.gender))
        .on("mouseover", handleMouseOver) // Agregar evento mouseover
        .on("mouseout", handleMouseOut); // Agregar evento mouseout

    // Agregar ejes al gráfico
    chartGroup.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(xAxis);

    chartGroup.append("g")
        .attr("class", "y-axis")
        .call(yAxis);

    // Agregar título al gráfico
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .text("Cantidad de Astronautas por Género");

    // Agregar leyenda de colores
    const legend = svg.append("g")
        .attr("transform", `translate(${width - margin.right}, ${margin.top})`);

    const legendRectSize = 18;
    const legendSpacing = 4;

    const legendItems = legend.selectAll(".legend-item")
        .data(genderCounts.map(d => d.gender))
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0,${i * (legendRectSize + legendSpacing)})`);

    legendItems.append("rect")
        .attr("width", legendRectSize)
        .attr("height", legendRectSize)
        .attr("fill", d => colorScale(d));

    legendItems.append("text")
        .attr("x", legendRectSize + legendSpacing)
        .attr("y", legendRectSize - legendSpacing)
        .text(d => d);

        function dispatchGenderChangeEvent(selectedGender) {
            const event = new CustomEvent("genderChange", { detail: { selectedGender } });
            document.dispatchEvent(event);
        }
        
// Función para manejar el evento mouseover
function handleMouseOver(event, d) {
    // Cambiar la apariencia de la barra al pasar el ratón
    d3.select(this)
        .attr("opacity", 0.7)
        .attr("stroke", "black")
        .attr("stroke-width", 2);

    // Mostrar tooltip con la cantidad de personas al lado del mouse
    const tooltip = chartGroup.append("g")
        .attr("class", "tooltip");

    // Escuchar eventos mousemove para actualizar la posición del tooltip
    d3.select("body")
        .on("mousemove", (event) => handleMouseMove(event, d, tooltip))
        .on("mouseout", () => handleMouseOut(d, tooltip));
}

// Función para manejar el evento mousemove
function handleMouseMove(event, d, tooltip) {
    // Obtener las coordenadas del mouse
    const [mouseX, mouseY] = d3.pointer(event);

    // Actualizar la posición del tooltip con el mouse
    tooltip.attr("transform", `translate(${mouseX + 10},${mouseY - 10})`); // Ajustar la posición del tooltip

    // Actualizar el contenido del tooltip
    tooltip.selectAll("*").remove(); // Limpiar el contenido existente

    // Estilo mejorado para el cuadrado del tooltip
    tooltip.append("rect")
        .attr("width", 120)
        .attr("height", 60)
        .attr("rx", 10) // Radio de esquina para bordes redondeados
        .attr("ry", 10) // Radio de esquina para bordes redondeados
        .attr("fill", "#f8f9fa") // Color de fondo más claro
        .style("stroke", "#6c757d") // Color de borde
        .style("stroke-width", 2);

        tooltip.append("text")
        .attr("x", 60)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text(`${d.count} personas ${d.gender}`);
}

// Función para manejar el evento mouseout
function handleMouseOut(d, tooltip) {
    // Restaurar la apariencia original de la barra
    chartGroup.selectAll(".bar")
        .attr("opacity", 1)
        .attr("stroke", "none");

    // Ocultar tooltip después de un breve tiempo
    setTimeout(() => {
        tooltip.remove();
    }, 500); // Puedes ajustar la duración según tus preferencias
}

   // Agregar lógica para actualizar el gráfico al cambiar la selección del filtro
   d3.select("#gender-filter").on("change", updateChart);

   function updateChart() {
    const selectedGender = d3.select("#gender-filter").node().value;

    // Filtrar datos según la selección del filtro
    const filteredData = (selectedGender === "Todos") ? data : data.filter(d => d.Gender === selectedGender);

    // Actualizar el conteo por género
    const countsBySelectedGender = d3.rollup(filteredData, v => v.length, d => d.Gender);
    const filteredGenderCounts = Array.from(countsBySelectedGender, ([gender, count]) => ({ gender, count }));

    // Actualizar la escala X y las barras según el filtro
    xScale.domain(filteredGenderCounts.map(d => d.gender));
    bars.data(filteredGenderCounts);

    // Mostrar u ocultar barras según la selección del filtro
    bars.style("display", d => (selectedGender === "Todos" || d.gender === selectedGender) ? "block" : "none");

    // Actualizar ejes
    chartGroup.select(".x-axis")
        .call(xAxis.tickValues((selectedGender === "Todos") ? null : [selectedGender]));


    // Actualizar las barras y colores
    bars.join(
        enter => enter.append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d.gender))
            .attr("y", chartHeight) // Empiezan desde la parte inferior
            .attr("width", xScale.bandwidth())
            .attr("height", 0) // Comienzan con altura cero
            .attr("fill", d => colorScale(d.gender))
            .call(enter => enter.transition().duration(500)
                .attr("y", d => yScale(d.count))
                .attr("height", d => chartHeight - yScale(d.count))
            ),
        update => update
            .transition()
            .duration(500)
            .attr("x", d => xScale(d.gender))
            .attr("y", d => yScale(d.count))
            .attr("width", xScale.bandwidth())
            .attr("height", d => chartHeight - yScale(d.count))
            .attr("fill", d => colorScale(d.gender)),
        exit => exit
            .transition()
            .duration(500)
            .attr("y", chartHeight) // Salen hacia la parte inferior
            .attr("height", 0) // Altura cero al salir
            .remove()
    );

    }

}).catch(error => {
    console.error('Error al cargar los datos:', error);
});











