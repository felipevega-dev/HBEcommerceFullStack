/**
 * Loading state for the new product wizard page
 * 
 * Displays a loading spinner while fetching categories
 * and initializing the wizard.
 */
export default function NewProductWizardLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando wizard...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
