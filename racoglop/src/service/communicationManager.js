let ruta = 'http://localhost:3001';
//let ruta = 'http://tr1g2.dam.inspedralbes.cat:23461';

// Función para obtener las comandas desde el servidor
export const getComandas = async () => {
    try {
        const response = await fetch(`${ruta}/getPedidos`);
        if (!response.ok) {
            throw new Error('Error al obtener las comandas');
        }
        return await response.json();  // Devolver la data directamente
    } catch (error) {
        console.error('Error al obtener las comandas:', error);
        throw error;  // Lanzar el error para manejarlo en el componente
    }
};

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

// Funciones para agregar, actualizar y eliminar productos se mantienen igual
export const addProducto = async (data) => {
    try {
        const response = await fetch(`${ruta}/addProducto`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
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

export const updateProducto = async (id, formData) => {
    try {
        const response = await fetch(`${ruta}/updateProducto/${id}`, {
            method: 'PUT',
            body: formData,
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
        const response = await fetch(`${ruta}/deleteProducto/${id}`,{
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al eliminar el producto');
        }
        return await response.json();
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
};


export const deleteComanda = async (id) => {
    try {
        const response = await fetch(`${ruta}/eliminarCompra/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Error deleting comanda:', error);
        throw error;
    }
};

export const updateComandaStatus = async (comandaId, nuevoEstado) => {
    try {
        const response = await fetch(`${ruta}/updateEstadoPedido/${comandaId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ estado: nuevoEstado }),
        });

        if (!response.ok) {
            throw new Error('Error en la actualización del estado');
        }
        
        return await response.json(); // Devuelve la comanda actualizada
    } catch (error) {
        console.error("Error en updateComandaStatus", error);
        throw error;
    }
};

export const updateComanda = async (comanda) => {
    try {
        const response = await fetch(`${ruta}/actualizarCompra/${comanda.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                estado: comanda.estado,
                detalles: comanda.detalles
            })
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating comanda:', error);
        throw error;
    }
};


export const getUsuarios = async () => {
    try {
        const response = await fetch(`${ruta}/getUsuarios`);
        if (!response.ok) {
            throw new Error('Error al obtener los usuarios');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};
