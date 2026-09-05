import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<any>();

/**
 * Navega de forma segura a cualquier pantalla dentro de la app desde fuera del árbol de React,
 * como en manejadores de notificaciones o deep links.
 */
export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  } else {
    // Si la app aún está inicializándose, reintentar tras un breve retardo
    setTimeout(() => {
      if (navigationRef.isReady()) {
        navigationRef.navigate(name, params);
      }
    }, 500);
  }
}
