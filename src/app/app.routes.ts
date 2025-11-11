import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Admin } from './admin/admin';
import { Home } from './admin/home/home';
import { Barcode } from './admin/barcode/barcode';
import { Category } from './admin/category/category';
import { Deshe } from './admin/deshe/deshe';
import { Inventory } from './admin/inventory/inventory';
import { Product } from './admin/product/product';
import { Provider } from './admin/provider/provider';
import { Nofound } from './admin/nofound/nofound';
import { ProductDetail } from './admin/category/product-detail/product-detail';
import { AuthGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        title: 'Login',
        component: Login
    },
    {
        path: 'admin',
        component: Admin,
        canActivate: [AuthGuard],
        children: [
            {
                path: 'home',
                title: 'Home',
                component: Home
            },
            {
                path: 'barcode',
                title: 'Barcode',
                component: Barcode
            },
            {
                path: 'category',
                title: 'Category',
                component: Category
            },
            {
                path: 'category/product-detail/:id',
                title: 'Product Detail',
                component: ProductDetail
            },
            {
                path: 'deshe',
                title: 'Deshe',
                component: Deshe
            },
            {
                path: 'inventory',
                title: 'Inventory',
                component: Inventory
            },
            {
                path: 'product',
                title: 'Product',
                component: Product
            },
            {
                path: 'provider',
                title: 'Provider',
                component: Provider
            },
            {
                path: '',
                redirectTo: 'home',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: '**',
        component: Nofound,
        pathMatch: 'full'
    }
];
