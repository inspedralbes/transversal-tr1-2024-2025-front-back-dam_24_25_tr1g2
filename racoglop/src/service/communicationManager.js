let ruta = 'http://localhost:3001';

export const getProductos = async () => {
    try {
        const response = await fetch(`${ruta}/getProducto`);
        if (!response.ok) {
            throw new Error('Error al obtener los productos');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

export const addProducto = async (producto) => {
    try {
        const response = await fetch(`${ruta}/addProducto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(producto),
        });
        if (!response.ok) {
            throw new Error('Error al agregar el producto');
        }
        return await response.json();
    } catch (error) {
        console.error('Error adding product:', error);
        throw error;
    }
};


export const updateProducto = async (id, updatedProducto) => {
    try {
        const response = await fetch(`${ruta}/updateProducto/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedProducto),
        });
        if (!response.ok) {
            throw new Error('Error al actualizar el producto');
        }
        return await response.json();
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
};


export const deleteProducto = async (id) => {
    try {
        const response = await fetch(`${ruta}/deleteProducto/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            throw new Error('Error al eliminar el producto');
        }
        return await response.json();
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
};
