// Cargar datos desde la URL del dataset
const url = 'https://raw.githubusercontent.com/PacitaUgarte/V1/main/astronauts.csv';

d3.csv(url).then(data => {
    // Agrupar datos por especialidad y sumar la cantidad de personas
    const undergraduateGrouped = d3.rollup(data, v => v.length, d => d['Undergraduate Major'] || 'Sin especialidad');
    const graduateGrouped = d3.rollup(data, v => v.length, d => d['Graduate Major'] || 'Sin especialidad');

    // Convertir los resultados de la agrupación a un array
    const undergraduateData = Array.from(undergraduateGrouped, ([major, count]) => ({ major, count, area: getArea(data, major) }));
    const graduateData = Array.from(graduateGrouped, ([major, count]) => ({ major, count, area: getArea(data, major) }));

    // Escala de colores categóricos por área
    const colorScaleUndergraduate = d3.scaleOrdinal(d3.schemeCategory10);
    const colorScaleGraduate = d3.scaleOrdinal(d3.schemeCategory10);


    // Función para obtener el área de una especialidad
    function getArea(data, major) {
        const match = data.find(d => d['Undergraduate Major'] === major || d['Graduate Major'] === major);
        return match ? match.Area : null;
    }
    // Función para crear un treemap
    function createTreemap(container, data, title) {
        // Tamaño del SVG
        const width = 500;
        const height = 400;

        // Margen superior para ajustar la posición vertical del treemap
        const marginTop = 50;

        // Crear escala de colores
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        // Crear SVG
        const svg = d3.select(container)
            .append("svg")
            .attr("width", width)
            .attr("height", height + marginTop); // Añadir el margen superior

        // Crear treemap
        const treemap = d3.treemap()
            .size([width, height])
            .padding(1);

        // Jerarquía de datos
        const root = d3.hierarchy({ children: data })
            .sum(d => d.count);

        // Crear nodos del treemap
        const nodes = treemap(root);

        // Crear grupos para cada nodo
        const cell = svg.selectAll("g")
            .data(nodes.leaves())
            .enter().append("g")
            .attr("transform", d => `translate(${d.x0},${d.y0 + marginTop})`); // Ajustar la posición vertical

        // Crear rectángulos
        cell.append("rect")
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .attr("fill", d => colorScale(d.data.major))
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut);

        // Agregar título
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", marginTop / 2) // Ajustar la posición vertical
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
        .attr("y",  45) // Ajustar la posición vertical
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text(`${d.data.major}: ${d.value} personas`);
}


        // Función para manejar el evento mouseout
        function handleMouseOut() {
            // Ocultar tooltip
            d3.select(".tooltip").remove();
        }
    }

    // Llamar a la función para crear los treemaps
    createTreemap("#undergraduate-treemap", undergraduateData, "Undergraduate Major");
    createTreemap("#graduate-treemap", graduateData, "Graduate Major");
}).catch(error => {
    console.error('Error al cargar los datos:', error);
});






