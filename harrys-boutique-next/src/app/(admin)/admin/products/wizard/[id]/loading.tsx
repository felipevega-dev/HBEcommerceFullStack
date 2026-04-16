/**
 * Loading state for the edit product wizard page
 * 
 * Displays a loading spinner while fetching the product data
 * and categories for editing.
 */
export default function EditProductWizardLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando producto...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
