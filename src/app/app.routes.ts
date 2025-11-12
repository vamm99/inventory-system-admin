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
import { CategoryDetail } from './admin/category/category-detail/category-detail';
import { AuthGuard } from './auth/guards/auth.guard';
import { Providerdetail } from './admin/provider/provider-detail/providerdetail';
import { ProductDetail } from './admin/product/product-detail/product-detail';
import { Detail } from './admin/provider/provider-detail/detail/detail';
import { ProviderProducts } from './admin/provider/provider-detail/provider-products/provider-products';

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
                path: 'category/category-detail/:id',
                title: 'Category Detail',
                component: CategoryDetail
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
                path: 'product/product-detail/:id',
                title: 'Product Detail',
                component: ProductDetail
            },
            {
                path: 'provider',
                title: 'Provider',
                component: Provider
            },
            {
                path: 'provider/provider-detail/:id',
                title: 'Provider Detail',
                component: Providerdetail,
                children: [
                    {
                        path: 'products',
                        component: ProviderProducts,
                    },
                    {
                        path: 'detail',
                        component: Detail,
                    },
                    {
                        path: '',
                        redirectTo: 'detail',
                        pathMatch: 'full'
                    }
                ]
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
