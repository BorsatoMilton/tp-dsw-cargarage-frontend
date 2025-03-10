import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const apiUrl = environment.SERVER_URL;

  const excludedEndpoints = [
    { url: `${apiUrl}/api/usuarios/login`, methods: ['POST'] },
    { url: `${apiUrl}/api/marcas`, methods: ['GET'] },
    { url: `${apiUrl}/api/vehiculos`, methods: ['GET'] },
    { url: `${apiUrl}/api/categorias`, methods: ['GET'] },
    { url: `${apiUrl}/api/faq`, methods: ['GET'] },
    { url: `${apiUrl}/api/recuperacion`, methods: ['GET','POST'] },
    { url: `${apiUrl}/api/usuarios`, methods: ['POST'] },
    { url: `${apiUrl}/api/usuarios/reset`, methods: ['POST'] },
    { url: `${apiUrl}/api/vehiculos`, methods: ['GET'] },
    { url: `${apiUrl}/api/compras/confirmarCompra`, methods: ['POST'] },
    { url: `${apiUrl}/api/alquiler/confirmarAlquiler`, methods: ['PATCH'] },
    { url: `${apiUrl}/api/alquiler`, methods: ['GET'] },
  ];

  const isExcluded = excludedEndpoints.some(endpoint =>
    (req.url === endpoint.url || (req.url.startsWith(endpoint.url) && !req.url.slice(endpoint.url.length).startsWith('/'))) && endpoint.methods.includes(req.method)  
  );

  if (isExcluded) {
    return next(req);
  }

  const token = localStorage.getItem('token');
  console.log(token)
  if (token) {
    const clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(clonedReq);
  }

  return next(req);
};
