import React, { FunctionComponent } from 'react';
import AppLayout from '../../layouts/AppLayout';
import TransactionToSaleMigration from './partials/TransactionToSaleMigration';
import { HiOutlineArrowRight } from 'react-icons/hi';

/**
 * Migrations Page
 * 
 * This page handles the migration of legacy transaction records to the new Sale format.
 * Uses the zonse247-pos-api endpoints:
 * - GET /sales/migration/status - Check migration status
 * - POST /sales/migration/run - Run migration
 * - GET /sales/migration/unified - Get unified sales data
 * - GET /sales/migration/unified/summary - Get unified summary
 */
const Migrations: FunctionComponent = () => {
	const handleMigrationComplete = (result: { success: boolean; message: string; migratedCount: number }) => {
		console.log('Migration completed:', result);
		// Could add notifications or other side effects here
	};

	return (
		<AppLayout>
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
				<div className="px-4 py-8 sm:px-6 lg:px-8">
					<div className="max-w-5xl mx-auto">
						{/* Header */}
						<div className="mb-8">
							<div className="flex items-center space-x-3 mb-2">
								<div className="p-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg">
									<HiOutlineArrowRight className="w-6 h-6 text-white" />
								</div>
								<div>
									<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
										Data Migration
									</h1>
									<p className="text-gray-600 dark:text-gray-300 mt-1">
										Migrate legacy transaction records to the new Sale format
									</p>
								</div>
							</div>
						</div>

						{/* Migration Content */}
						<TransactionToSaleMigration
							onMigrationComplete={handleMigrationComplete}
						/>
					</div>
				</div>
			</div>
		</AppLayout>
	);
};

export default Migrations;
