import React, { useEffect, useState } from 'react';
// Asegúrate de que las rutas coincidan con donde guardaste los archivos anteriores
import { DashboardService } from '../../services/dashboardService';
import { CrudService } from '../../services/crudServices';

const DashboardAPI = () => {
  const [estaMontado, setEstaMontado] = useState(false);

  useEffect(() => {
    console.log('DashboardAPI (Modular v9+) MONTADO - Inicializando...');

    const inicializarAPIs = () => {
      try {
        // 1. Exponer las clases de servicio directamente
        window.DashboardService = DashboardService;
        window.CrudService = CrudService;

        // 2. Crear el objeto crudManager global para que lo usen los scripts de assets/js
        window.crudManager = {
          // Órdenes
          getOrdenes: () => CrudService.getOrdenes(),
          getOrdenById: (id) => CrudService.getOrdenById(id),
          updateOrdenEstado: (id, estado) => CrudService.updateOrdenEstado(id, estado),
          
          // Productos
          getProductos: () => CrudService.getProductos(),
          getProductoById: (id) => CrudService.getProductoById(id),
          createProducto: (producto) => CrudService.createProducto(producto),
          updateProducto: (id, datos) => CrudService.updateProducto(id, datos),
          deleteProducto: (id) => CrudService.deleteProducto(id),
          
          // Categorías
          getCategorias: () => CrudService.getCategorias(),
          createCategoria: (categoria) => CrudService.createCategoria(categoria),
          updateCategoria: (id, datos) => CrudService.updateCategoria(id, datos),
          deleteCategoria: (id) => CrudService.deleteCategoria(id),
          
          // Usuarios
          getUsuarios: () => CrudService.getUsuarios(),
          getUsuarioById: (id) => CrudService.getUsuarioById(id),
          updateUsuario: (id, datos) => CrudService.updateUsuario(id, datos),
          
          // Reportes
          getReporteVentas: (fechaInicio, fechaFin) => CrudService.getReporteVentas(fechaInicio, fechaFin),
          getProductosMasVendidos: () => CrudService.getProductosMasVendidos()
        };

        // 3. Exponer la función específica para el dashboard
        window.obtenerEstadisticasDashboard = async () => {
          console.log('obtenerEstadisticasDashboard llamado desde HTML');
          try {
            const stats = await DashboardService.getEstadisticasCompletas();
            return stats;
          } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            return null;
          }
        };

        // 4. Señalizar que todo está listo
        window.dashboardAPIReady = true;
        setEstaMontado(true);
        
        console.log('DashboardAPI INICIALIZADO CORRECTAMENTE');

        // Disparar evento para que los scripts de JS sepan que pueden empezar
        const event = new CustomEvent('dashboardAPIReady');
        window.dispatchEvent(event);

        // Soporte para callbacks directos si existieran
        if (window.onDashboardAPIReady) {
          window.onDashboardAPIReady();
        }

      } catch (error) {
        console.error('ERROR CRÍTICO en DashboardAPI:', error);
      }
    };

    // Pequeño retraso para asegurar que el objeto window esté disponible y limpio
    setTimeout(inicializarAPIs, 100);

    // Limpieza al desmontar
    return () => {
      console.log('DashboardAPI desmontándose...');
      delete window.DashboardService;
      delete window.CrudService;
      delete window.crudManager;
      delete window.obtenerEstadisticasDashboard;
      delete window.dashboardAPIReady;
      setEstaMontado(false);
    };
  }, []);

  if (!estaMontado) {
    return <div style={{display: 'none'}}>Cargando APIs Firebase v9...</div>;
  }

  return null;
};

export default DashboardAPI;