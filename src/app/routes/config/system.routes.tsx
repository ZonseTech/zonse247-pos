import { lazy } from 'react'
import { Route } from 'react-router'
import { ROUTES } from '../../utils/constants'

const Settings = lazy(() => import('../../pages/settings'))
const SyncData = lazy(() => import('../../pages/sync-data'))
const Migrations = lazy(() => import('../../pages/migrations'))
const DatabaseExporter = lazy(() => import('../../pages/export-db'))
const NotFound = lazy(() => import('../../pages/errors/NotFound'))

export const SystemRoutes = (
    <>
        <Route path={ROUTES.SETTINGS} element={<Settings />} />
        <Route path={ROUTES.SYNC_DATA} element={<SyncData />} />
        <Route path={ROUTES.MIGRATIONS} element={<Migrations />} />
        <Route path={ROUTES.EXPORT_DB} element={<DatabaseExporter />} />
    </>
)

export const ErrorRoutes = (
    <Route path="/not-found" element={<NotFound />} />
)
