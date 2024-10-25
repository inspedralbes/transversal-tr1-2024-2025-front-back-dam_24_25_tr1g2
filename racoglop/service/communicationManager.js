let ruta = 'http://localhost:3000';
export async function getProducto() {
    const response = await fetch(`${ruta}/productos`);
    if (!response.ok) {
        throw new Error('Error al obtener las preguntas');
    }
    const data = await response.json();
    return data;
}
