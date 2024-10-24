import productosData from './productos.json';

class CommunicationManager {
    constructor() {
        this.productos = productosData.productos; // Cargar productos desde el archivo JSON
    }

    // Crear un nuevo producto
    create(producto) {
        this.productos.push(producto);
        console.log('Producto creado:', producto);
    }

    // Leer todos los productos
    read() {
        return this.productos;
    }

    // Leer un producto por ID
    readById(id) {
        const producto = this.productos.find(p => p.id === id);
        if (producto) {
            return producto;
        } else {
            console.log('Producto no encontrado con ID:', id);
            return null;
        }
    }

    // Actualizar un producto por ID
    update(id, updatedProducto) {
        const index = this.productos.findIndex(p => p.id === id);
        if (index !== -1) {
            this.productos[index] = { ...this.productos[index], ...updatedProducto };
            console.log('Producto actualizado:', this.productos[index]);
        } else {
            console.log('Producto no encontrado con ID:', id);
        }
    }

    // Eliminar un producto por ID
    delete(id) {
        const index = this.productos.findIndex(p => p.id === id);
        if (index !== -1) {
            const deletedProducto = this.productos.splice(index, 1);
            console.log('Producto eliminado:', deletedProducto);
        } else {
            console.log('Producto no encontrado con ID:', id);
        }
    }
}

// Ejemplo de uso
const manager = new CommunicationManager();

// Crear un nuevo producto
manager.create({ id: 5, nombre: 'Vodka Absolut', volumen: '70 cl', tipo: 'Vodka', precio: null, descripcion: 'Vodka sueco de alta calidad.', imagen: 'url_a_imagen_absolut.jpg' });

// Leer todos los productos
console.log(manager.read());

// Leer un producto por ID
console.log(manager.readById(1));

// Actualizar un producto
manager.update(1, { nombre: 'Johnnie Walker Black Label' });

// Eliminar un producto
manager.delete(2);

// Leer todos los productos después de la eliminación
console.log(manager.read());
