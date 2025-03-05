import {Routes} from '@angular/router';
import { CategoriesComponent } from './categories/categories.component';
import { BrandComponent } from './brand/brand.component';
import { VehicleComponent } from './vehicles/vehicles.component';
import { VehiclesCardComponent } from './vehicles-card/vehicles-card.component';
import { onlyAdmin } from '../../guards/onlyAdmin.guard';
import { isLoggedInGuard } from '../../guards/is-logged-in.guard';
import { CompraComponent } from './compra/compra.component';
import { ConfirmPurchaseComponent } from './confirm-purchase/confirm-purchase.component';
import { PurchasesComponent } from './purchases/purchases.component';
import { RentListComponent } from './rent-list/rent-list.component';
import { RentComponent } from './rent/rent.component';
import { ConfirmRentComponent } from './confirm-rent/confirm-rent.component';
import { PaymentStatusComponent } from './payment-status/payment-status.component';

export const productRoutes: Routes = [
    {path: 'categories', component: CategoriesComponent, canActivate: [onlyAdmin]},
    {path: 'brands', component: BrandComponent, canActivate: [onlyAdmin]},
    {path: 'vehicles', component: VehicleComponent, canActivate: [isLoggedInGuard]},
    {path: 'compra/:id', component: CompraComponent, canActivate: [isLoggedInGuard]},
    {path: 'confirm-purchase', component: ConfirmPurchaseComponent, canActivate: [isLoggedInGuard]},
    {path: 'rent-list', component:RentListComponent, canActivate: [isLoggedInGuard]},
    {path: 'rent/:id', component:RentComponent, canActivate: [isLoggedInGuard]},
    {path: 'confirm-rent', component:ConfirmRentComponent, canActivate: [isLoggedInGuard]},
    {path: 'purchases', component: PurchasesComponent, canActivate: [isLoggedInGuard]},
    { path: 'payment-status', component: PaymentStatusComponent }, 
    {path: '', component: VehiclesCardComponent},
];