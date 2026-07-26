import { lazy } from 'react'
import { Route } from 'react-router'
import { ROUTES } from '../../utils/constants'

const Expenses = lazy(() => import('../../pages/expenses'))
const ExpenseCategories = lazy(() => import('../../pages/expenses/categories'))

export const ExpenseRoutes = (
    <>
        <Route path={ROUTES.EXPENSES} element={<Expenses />} />
        <Route path={ROUTES.EXPENSE_CATEGORIES} element={<ExpenseCategories />} />
    </>
)
