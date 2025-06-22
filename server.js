const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Servir archivos estáticos

// Rutas para archivos de datos
const DATA_DIR = './data';
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const SCHOOLS_FILE = path.join(DATA_DIR, 'schools.json');

// Crear directorio de datos si no existe
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// Crear archivos iniciales si no existen
function initializeDataFiles() {
    // Productos iniciales
    const initialProducts = [
        { id: 1, name: 'Uniforme Jardín Completo', price: 12500, category: 'uniforme-jardin', stock: 25, image: 'fas fa-baby' },
        { id: 2, name: 'Uniforme Primaria Completo', price: 15000, category: 'uniforme-primaria', stock: 30, image: 'fas fa-graduation-cap' },
        { id: 3, name: 'Uniforme Secundaria Completo', price: 18000, category: 'uniforme-secundaria', stock: 20, image: 'fas fa-user-graduate' },
        { id: 4, name: 'Uniforme Deportivo', price: 8500, category: 'uniforme-deportivo', stock: 40, image: 'fas fa-running' },
        { id: 5, name: 'Bordado Personalizado', price: 2500, category: 'bordado', stock: 100, image: 'fas fa-cut' },
        { id: 6, name: 'Sublimación Personalizada', price: 3500, category: 'sublimacion', stock: 50, image: 'fas fa-palette' }
    ];

    // Escuelas iniciales
    const initialSchools = [
        'Escuela San Martín', 'Colegio Nacional', 'Instituto Santa María', 'Escuela Técnica',
        'Jardín Pequeños Genios', 'Colegio Bilingüe', 'Escuela Rural', 'Instituto Comercial',
        'Jardín Arco Iris', 'Colegio Católico', 'Escuela de Arte', 'Instituto Tecnológico'
    ];

    if (!fs.existsSync(ORDERS_FILE)) {
        fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
    }

    if (!fs.existsSync(PRODUCTS_FILE)) {
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(initialProducts, null, 2));
    }

    if (!fs.existsSync(SCHOOLS_FILE)) {
        fs.writeFileSync(SCHOOLS_FILE, JSON.stringify(initialSchools, null, 2));
    }
}

// Funciones auxiliares para leer/escribir archivos
function readJSONFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return [];
    }
}

function writeJSONFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
        return false;
    }
}

// RUTAS API

// Obtener todos los pedidos
app.get('/api/orders', (req, res) => {
    const orders = readJSONFile(ORDERS_FILE);
    res.json(orders);
});

// Crear nuevo pedido
app.post('/api/orders', (req, res) => {
    const orders = readJSONFile(ORDERS_FILE);
    const newOrder = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        ...req.body,
        status: 'Nuevo'
    };
    
    orders.push(newOrder);
    
    if (writeJSONFile(ORDERS_FILE, orders)) {
        res.status(201).json({ success: true, order: newOrder });
    } else {
        res.status(500).json({ success: false, error: 'Error al guardar el pedido' });
    }
});

// Eliminar pedido
app.delete('/api/orders/:id', (req, res) => {
    const orders = readJSONFile(ORDERS_FILE);
    const filteredOrders = orders.filter(order => order.id !== parseInt(req.params.id));
    
    if (writeJSONFile(ORDERS_FILE, filteredOrders)) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false, error: 'Error al eliminar el pedido' });
    }
});

// Obtener todos los productos
app.get('/api/products', (req, res) => {
    const products = readJSONFile(PRODUCTS_FILE);
    res.json(products);
});

// Crear nuevo producto
app.post('/api/products', (req, res) => {
    const products = readJSONFile(PRODUCTS_FILE);
    const newProduct = {
        id: Date.now(),
        ...req.body,
        image: req.body.image || 'fas fa-tshirt'
    };
    
    products.push(newProduct);
    
    if (writeJSONFile(PRODUCTS_FILE, products)) {
        res.status(201).json({ success: true, product: newProduct });
    } else {
        res.status(500).json({ success: false, error: 'Error al guardar el producto' });
    }
});

// Actualizar producto
app.put('/api/products/:id', (req, res) => {
    const products = readJSONFile(PRODUCTS_FILE);
    const productIndex = products.findIndex(product => product.id === parseInt(req.params.id));
    
    if (productIndex !== -1) {
        products[productIndex] = { ...products[productIndex], ...req.body };
        
        if (writeJSONFile(PRODUCTS_FILE, products)) {
            res.json({ success: true, product: products[productIndex] });
        } else {
            res.status(500).json({ success: false, error: 'Error al actualizar el producto' });
        }
    } else {
        res.status(404).json({ success: false, error: 'Producto no encontrado' });
    }
});

// Eliminar producto
app.delete('/api/products/:id', (req, res) => {
    const products = readJSONFile(PRODUCTS_FILE);
    const filteredProducts = products.filter(product => product.id !== parseInt(req.params.id));
    
    if (writeJSONFile(PRODUCTS_FILE, filteredProducts)) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false, error: 'Error al eliminar el producto' });
    }
});

// Obtener todas las escuelas
app.get('/api/schools', (req, res) => {
    const schools = readJSONFile(SCHOOLS_FILE);
    res.json(schools);
});

// Agregar nueva escuela
app.post('/api/schools', (req, res) => {
    const schools = readJSONFile(SCHOOLS_FILE);
    const newSchool = req.body.name;
    
    if (newSchool && !schools.includes(newSchool)) {
        schools.push(newSchool);
        
        if (writeJSONFile(SCHOOLS_FILE, schools)) {
            res.status(201).json({ success: true, school: newSchool });
        } else {
            res.status(500).json({ success: false, error: 'Error al guardar la escuela' });
        }
    } else {
        res.status(400).json({ success: false, error: 'Escuela inválida o ya existe' });
    }
});

// Eliminar escuela
app.delete('/api/schools/:index', (req, res) => {
    const schools = readJSONFile(SCHOOLS_FILE);
    const index = parseInt(req.params.index);
    
    if (index >= 0 && index < schools.length) {
        schools.splice(index, 1);
        
        if (writeJSONFile(SCHOOLS_FILE, schools)) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, error: 'Error al eliminar la escuela' });
        }
    } else {
        res.status(404).json({ success: false, error: 'Escuela no encontrada' });
    }
});

// Inicializar archivos de datos
initializeDataFiles();

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor Cylaba ejecutándose en http://localhost:${PORT}`);
    console.log(`📁 Datos guardados en: ${DATA_DIR}`);
    console.log('🔧 Para detener el servidor, presiona Ctrl+C');
});

module.exports = app;
