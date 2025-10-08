import { useEffect, useState } from 'react';
import { ShoppingCart, BookOpen, Blocks, Palette, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Integration {
  id: string;
  name: string;
  enabled: boolean;
  config: any;
  last_sync: string | null;
}

const integrationIcons: Record<string, any> = {
  woocommerce: ShoppingCart,
  edd: ShoppingCart,
  tutorlms: BookOpen,
  elementor: Palette,
  gutenberg: Blocks,
};

const integrationLabels: Record<string, string> = {
  woocommerce: 'WooCommerce',
  edd: 'Easy Digital Downloads',
  tutorlms: 'Tutor LMS',
  elementor: 'Elementor',
  gutenberg: 'Gutenberg Blocks',
};

const integrationDescriptions: Record<string, string> = {
  woocommerce: 'Sync products and enable review collection for WooCommerce orders',
  edd: 'Integrate with Easy Digital Downloads for digital product reviews',
  tutorlms: 'Collect course reviews from Tutor LMS students',
  elementor: 'Add review widgets to Elementor page builder',
  gutenberg: 'Use review blocks in WordPress Gutenberg editor',
};

export default function Integrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      if (data) setIntegrations(data);
    } catch (error) {
      console.error('Error loading integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleIntegration = async (id: string, enabled: boolean) => {
    setSaving(id);
    try {
      const { error } = await supabase
        .from('integrations')
        .update({ enabled, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      loadIntegrations();
    } catch (error) {
      console.error('Error updating integration:', error);
    } finally {
      setSaving(null);
    }
  };

  const updateConfig = async (id: string, config: any) => {
    setSaving(id);
    try {
      const { error } = await supabase
        .from('integrations')
        .update({ config, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      loadIntegrations();
    } catch (error) {
      console.error('Error updating configuration:', error);
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Integrations</h2>
        <p className="text-slate-600 mt-1">Connect ReviewPool with your favorite platforms</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {integrations.map((integration) => {
          const Icon = integrationIcons[integration.name] || Blocks;
          const label = integrationLabels[integration.name] || integration.name;
          const description = integrationDescriptions[integration.name] || 'Integration with third-party service';

          return (
            <div key={integration.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{label}</h3>
                    <p className="text-sm text-slate-600 mt-1">{description}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={integration.enabled}
                    onChange={(e) => toggleIntegration(integration.id, e.target.checked)}
                    disabled={saving === integration.id}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {integration.enabled && ['woocommerce', 'edd'].includes(integration.name) && (
                <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">API URL</label>
                    <input
                      type="text"
                      value={integration.config.api_url || ''}
                      onChange={(e) => {
                        const newConfig = { ...integration.config, api_url: e.target.value };
                        setIntegrations(integrations.map(i =>
                          i.id === integration.id ? { ...i, config: newConfig } : i
                        ));
                      }}
                      placeholder="https://yourstore.com/wp-json"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">API Key</label>
                    <input
                      type="password"
                      value={integration.config.api_key || ''}
                      onChange={(e) => {
                        const newConfig = { ...integration.config, api_key: e.target.value };
                        setIntegrations(integrations.map(i =>
                          i.id === integration.id ? { ...i, config: newConfig } : i
                        ));
                      }}
                      placeholder="Enter your API key"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => updateConfig(integration.id, integration.config)}
                    disabled={saving === integration.id}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving === integration.id ? 'Saving...' : 'Save Configuration'}
                  </button>
                </div>
              )}

              {integration.enabled && integration.name === 'elementor' && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-900 font-medium mb-2">Elementor Widgets Available</p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Review List Widget</li>
                      <li>• Review Form Widget</li>
                      <li>• Rating Summary Widget</li>
                      <li>• Review Carousel Widget</li>
                    </ul>
                  </div>
                </div>
              )}

              {integration.enabled && integration.name === 'gutenberg' && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-900 font-medium mb-2">Gutenberg Blocks Available</p>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Review List Block</li>
                      <li>• Review Form Block</li>
                      <li>• Rating Display Block</li>
                      <li>• Review Summary Block</li>
                    </ul>
                  </div>
                </div>
              )}

              {integration.last_sync && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500">
                    Last synced: {new Date(integration.last_sync).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Integration Documentation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <h4 className="font-medium text-slate-900 mb-2">WooCommerce Setup</h4>
            <p className="text-sm text-slate-600 mb-3">
              Enable automatic review requests after order completion and sync product data.
            </p>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View Documentation →
            </a>
          </div>

          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <h4 className="font-medium text-slate-900 mb-2">Page Builder Integration</h4>
            <p className="text-sm text-slate-600 mb-3">
              Add review widgets to your pages using Elementor or Gutenberg blocks.
            </p>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View Documentation →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
