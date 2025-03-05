import { Routes } from '@angular/router';
import { FaqComponent } from './shared/components/faq/faq.component';
import { FaqListComponent } from './shared/components/faq-list/faq-list.component';
import { onlyAdmin } from './guards/onlyAdmin.guard';

export const routes: Routes = [
    { path: 'auth', loadChildren: () => import('./components/auth/auth.routes').then(m => m.authRoutes)},
    {path: 'product', loadChildren: () => import('./components/product/product.routes').then(m => m.productRoutes)},
    { path: 'faq' , component: FaqComponent},
    { path: 'faq-list' , component: FaqListComponent, canActivate: [onlyAdmin]},
    {path: '', loadChildren: () => import('./components/product/product.routes').then(m => m.productRoutes)}

];
