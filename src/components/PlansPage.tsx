import React from 'react';
import { PLAN_REGULAR_INR } from '../data/planRegularINR';
import { PLAN_FIGMA_INR } from '../data/planFigmaINR';
import { ADDON_REGULAR_INR } from '../data/addonRegularINR';
import { PLAN_REGULAR_USD } from '../data/planRegularUSD';
import { PLAN_FIGMA_USD } from '../data/planFigmaUSD';
import { ADDON_REGULAR_USD } from '../data/addonRegularUSD';

const PlansPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Available Plans & Add-ons</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore all our available plans and add-ons with detailed pricing information for both USD and INR currencies.
          </p>
        </div>

        {/* INR Plans Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">INR Pricing (₹)</h2>
          
          {/* Regular Plans - INR */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mr-3">Regular</span>
              Service Plans
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PLAN_REGULAR_INR.map((plan) => (
                <div key={plan.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="mb-4">
                    <h4 className="text-xl font-bold text-gray-900">{plan.name}</h4>
                    <p className="text-gray-600 text-sm mt-1">{plan.description}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Base Price:</span>
                      <span className="font-bold text-lg">₹{plan.basePrice}</span>
                    </div>
                    
                    {plan.taxApplicable && (
                      <>
                        <div className="border-t pt-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">Tax Breakdown:</p>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">CGST:</span>
                              <span>₹{plan.cgst}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">SGST:</span>
                              <span>₹{plan.sgst}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">IGST:</span>
                              <span>₹{plan.igst}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                    
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-800 font-medium">Total Price:</span>
                        <span className="font-bold text-2xl text-green-600">₹{plan.total}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {plan.taxApplicable ? 'Including applicable taxes' : 'No tax applicable'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Figma Plans - INR */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium mr-3">Figma</span>
              Design Services
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PLAN_FIGMA_INR.map((plan) => (
                <div key={plan.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="mb-4">
                    <h4 className="text-xl font-bold text-gray-900">{plan.name}</h4>
                    <p className="text-gray-600 text-sm mt-1">{plan.description}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-800 font-medium">Price:</span>
                      <span className="font-bold text-2xl text-green-600">₹{plan.total}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {plan.taxApplicable ? 'Including applicable taxes' : 'No tax applicable'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add-ons - INR */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mr-3">Add-on</span>
              Additional Services
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ADDON_REGULAR_INR.map((addon) => (
                <div key={addon.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="mb-4">
                    <h4 className="text-xl font-bold text-gray-900">{addon.name}</h4>
                    <p className="text-gray-600 text-sm mt-1">{addon.description}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-800 font-medium">Price:</span>
                      <span className="font-bold text-2xl text-green-600">₹{addon.total}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {addon.taxApplicable ? 'Including applicable taxes' : 'No tax applicable'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* USD Plans Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">USD Pricing ($)</h2>
          
          {/* Regular Plans - USD */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mr-3">Regular</span>
              Service Plans
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PLAN_REGULAR_USD.map((plan) => (
                <div key={plan.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="mb-4">
                    <h4 className="text-xl font-bold text-gray-900">{plan.name}</h4>
                    <p className="text-gray-600 text-sm mt-1">{plan.description}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-800 font-medium">Price:</span>
                      <span className="font-bold text-2xl text-green-600">${plan.total}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {plan.taxApplicable ? 'Including applicable taxes' : 'No tax applicable'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Figma Plans - USD */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium mr-3">Figma</span>
              Design Services
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PLAN_FIGMA_USD.map((plan) => (
                <div key={plan.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="mb-4">
                    <h4 className="text-xl font-bold text-gray-900">{plan.name}</h4>
                    <p className="text-gray-600 text-sm mt-1">{plan.description}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-800 font-medium">Price:</span>
                      <span className="font-bold text-2xl text-green-600">${plan.total}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {plan.taxApplicable ? 'Including applicable taxes' : 'No tax applicable'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add-ons - USD */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mr-3">Add-on</span>
              Additional Services
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ADDON_REGULAR_USD.map((addon) => (
                <div key={addon.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="mb-4">
                    <h4 className="text-xl font-bold text-gray-900">{addon.name}</h4>
                    <p className="text-gray-600 text-sm mt-1">{addon.description}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-800 font-medium">Price:</span>
                      <span className="font-bold text-2xl text-green-600">${addon.total}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {addon.taxApplicable ? 'Including applicable taxes' : 'No tax applicable'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-800 font-medium mb-2">Need a custom solution?</p>
          <p className="text-blue-600 text-sm">
            Contact us for custom pricing and enterprise solutions tailored to your specific requirements.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlansPage;