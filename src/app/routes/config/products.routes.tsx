import { lazy } from 'react'
import { Route } from 'react-router'
import { ROUTES } from '../../utils/constants'

const Products = lazy(() => import('../../pages/products'))
const ProductForm = lazy(() => import('../../pages/products/create'))
const Categories = lazy(() => import('../../pages/categories'))

export const ProductRoutes = (
    <>
        <Route path={ROUTES.PRODUCTS} element={<Products />} />
        <Route path={ROUTES.PRODUCT_FORM} element={<ProductForm />} />
        <Route path={ROUTES.CATEGORIES} element={<Categories />} />
    </>
)
