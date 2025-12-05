import { useState, useEffect, useMemo } from 'react';
import { envConfigApi } from '../../services/adminApi';
import { useNotify } from '../Common/NotificationProvider';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Select } from '../ui/select';
import { cn } from '@/lib/utils';

// Tab configuration
const ENV_TABS = [
  { id: 'shared', label: 'Shared', icon: 'share-2.svg', description: 'Variables shared between services' },
  { id: 'backend', label: 'Main Backend', icon: 'server.svg', description: 'Main backend service variables' },
  { id: 'adminBackend', label: 'Admin Backend', icon: 'shield.svg', description: 'Admin backend service variables' },
  { id: 'custom', label: 'Custom', icon: 'plus-circle.svg', description: 'Add custom variables' },
];

export default function EnvironmentConfig() {
  const [activeTab, setActiveTab] = useState('shared');
  const [definitions, setDefinitions] = useState({});
  const [configs, setConfigs] = useState({});
  const [formData, setFormData] = useState({});
  const [customVariables, setCustomVariables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newCustomVar, setNewCustomVar] = useState({
    key: '', value: '', label: '', type: 'string', category: 'Custom', target: 'shared', sensitive: false
  });
  const notify = useNotify();

  useEffect(() => {
    loadAllConfigs();
  }, []);

  const loadAllConfigs = async () => {
    try {
      setLoading(true);
      const response = await envConfigApi.getAll();
      if (response.success) {
        setDefinitions(response.definitions || {});
        setConfigs(response.configs || {});
        
        // Initialize form data from configs, with process.env fallback for pre-fill
        const initialFormData = {};
        const processEnvValues = response.processEnvValues || {};
        
        for (const [type, config] of Object.entries(response.configs || {})) {
          const envFallback = processEnvValues[type] || {};
          const formValues = { ...(config.variables || {}) };
          
          // Pre-fill from process.env if Firestore is empty and env has value
          // Only for non-sensitive values (sensitive ones need manual entry)
          if (!config.isConfigured) {
            for (const [key, envInfo] of Object.entries(envFallback)) {
              if (envInfo.value !== undefined && !formValues[key]) {
                formValues[key] = envInfo.value;
              }
            }
          }
          
          initialFormData[type] = formValues;
        }
        setFormData(initialFormData);
      }
      
      // Load custom variables
      const customResponse = await envConfigApi.getCustomVariables();
      if (customResponse.success) {
        setCustomVariables(customResponse.customVariables || []);
      }
    } catch (err) {
      notify.error('Failed to load environment configs: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (type) => {
    try {
      setSaving(true);
      const response = await envConfigApi.save(type, formData[type] || {});
      if (response.success) {
        notify.success(`${type} environment config saved!`);
        // Reload to get updated masked values
        await loadAllConfigs();
      }
    } catch (err) {
      notify.error('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (type, key, value) => {
    setFormData(prev => ({
      ...prev,
      [type]: {
        ...(prev[type] || {}),
        [key]: value
      }
    }));
  };

  const handleAddCustomVariable = async () => {
    if (!newCustomVar.key) {
      notify.warning('Variable key is required');
      return;
    }
    
    try {
      setSaving(true);
      const response = await envConfigApi.addCustomVariable(newCustomVar);
      if (response.success) {
        notify.success('Custom variable added!');
        setNewCustomVar({ key: '', value: '', label: '', type: 'string', category: 'Custom', target: 'shared', sensitive: false });
        setShowAddCustom(false);
        await loadAllConfigs();
      }
    } catch (err) {
      notify.error('Failed to add: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCustomVariable = async (target, key) => {
    if (!confirm(`Delete custom variable ${key}?`)) return;
    
    try {
      const response = await envConfigApi.deleteCustomVariable(target, key);
      if (response.success) {
        notify.success('Custom variable deleted!');
        await loadAllConfigs();
      }
    } catch (err) {
      notify.error('Failed to delete: ' + err.message);
    }
  };

  // Group variables by category
  const groupedVariables = useMemo(() => {
    const def = definitions[activeTab];
    if (!def?.variables) return {};
    
    return def.variables.reduce((acc, variable) => {
      const category = variable.category || 'Other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(variable);
      return acc;
    }, {});
  }, [definitions, activeTab]);

  const renderVariableInput = (variable, type) => {
    const value = formData[type]?.[variable.key] ?? '';
    const hasValue = configs[type]?.variables?.[variable.key];
    
    // For sensitive fields that have saved value but no current input
    const showSavedIndicator = variable.sensitive && hasValue && !value;
    
    switch (variable.type) {
      case 'boolean':
        return (
          <Switch
            checked={value === true || value === 'true'}
            onCheckedChange={(checked) => handleInputChange(type, variable.key, checked)}
          />
        );
      
      case 'select':
        return (
          <Select
            value={value}
            onChange={(e) => handleInputChange(type, variable.key, e.target.value)}
            options={[
              { value: '', label: 'Select...' },
              ...(variable.options?.map(opt => ({ value: opt, label: opt })) || [])
            ]}
            placeholder="Select..."
          />
        );
      
      case 'textarea':
        return (
          <div className="relative">
            <textarea
              className={cn(
                "w-full px-3 py-2 rounded-lg border bg-background text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px] font-mono text-sm",
                showSavedIndicator ? "border-success/50 bg-success/5" : "border-border"
              )}
              value={value}
              onChange={(e) => handleInputChange(type, variable.key, e.target.value)}
              placeholder={variable.sensitive && hasValue ? '••••••••••••••••' : `Enter ${variable.label}`}
            />
            {showSavedIndicator && (
              <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-success/10 text-success text-xs rounded-md">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Saved
              </div>
            )}
          </div>
        );
      
      case 'password':
        return (
          <div className="relative">
            <Input
              type="password"
              value={value}
              onChange={(e) => handleInputChange(type, variable.key, e.target.value)}
              placeholder={hasValue ? '••••••••••••••••' : `Enter ${variable.label}`}
              className={cn(
                showSavedIndicator && "border-success/50 bg-success/5 pr-20"
              )}
            />
            {showSavedIndicator && (
              <div className="absolute top-1/2 right-2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 bg-success/10 text-success text-xs rounded-md">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Saved
              </div>
            )}
          </div>
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(type, variable.key, e.target.value ? Number(e.target.value) : '')}
            placeholder={String(variable.default || '')}
          />
        );
      
      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(type, variable.key, e.target.value)}
            placeholder={String(variable.default || '')}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-primary">Environment Configuration</h2>
          <p className="text-sm text-muted">Manage environment variables stored in Firestore</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "px-3 py-1 rounded-full text-xs font-medium",
            configs[activeTab]?.isConfigured ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
          )}>
            {configs[activeTab]?.isConfigured ? 'Configured' : 'Using Defaults'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        {ENV_TABS.map(tab => (
          <button
            key={tab.id}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "text-muted hover:bg-surface-secondary hover:text-primary"
            )}
            onClick={() => setActiveTab(tab.id)}
          >
            <img src={`/icon/${tab.icon}`} alt="" className={cn("w-4 h-4", activeTab === tab.id ? "icon-white" : "icon-gray")} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'custom' ? (
        <CustomVariablesTab
          customVariables={customVariables}
          showAddCustom={showAddCustom}
          setShowAddCustom={setShowAddCustom}
          newCustomVar={newCustomVar}
          setNewCustomVar={setNewCustomVar}
          handleAddCustomVariable={handleAddCustomVariable}
          handleDeleteCustomVariable={handleDeleteCustomVariable}
          saving={saving}
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedVariables).map(([category, variables]) => (
            <Card key={category} className="p-6">
              <h3 className="text-md font-semibold text-primary mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                {category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {variables.map(variable => {
                  const envFallback = configs[activeTab]?.envFallback?.[variable.key];
                  const hasFirestoreValue = configs[activeTab]?.variables?.[variable.key];
                  const source = hasFirestoreValue ? 'firestore' : (envFallback?.source || null);
                  
                  return (
                    <div key={variable.key} className="space-y-1">
                      <label className="text-sm font-medium text-primary flex items-center gap-2">
                        {variable.label}
                        {variable.sensitive && (
                          <span className="px-1.5 py-0.5 bg-warning/10 text-warning text-xs rounded">Sensitive</span>
                        )}
                        {source === 'env' && !hasFirestoreValue && (
                          <span className="px-1.5 py-0.5 bg-info/10 text-info text-xs rounded">From ENV</span>
                        )}
                      </label>
                      {renderVariableInput(variable, activeTab)}
                      <p className="text-xs text-muted">
                        Key: <code className="bg-surface-secondary px-1 rounded">{variable.key}</code>
                        {variable.default !== undefined && variable.default !== '' && (
                          <span className="ml-2">Default: {String(variable.default)}</span>
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={() => handleSave(activeTab)} loading={saving}>
              <img src="/icon/save.svg" alt="" className="w-4 h-4 icon-white" />
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>

          {/* Info Card */}
          <Card className="p-4 bg-surface-secondary">
            <div className="flex items-start gap-3">
              <img src="/icon/info.svg" alt="" className="w-5 h-5 mt-0.5" />
              <div className="text-sm text-muted">
                <p className="font-medium text-primary mb-1">How it works</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Values saved here are stored in Firestore and take priority over environment variables</li>
                  <li>If a value is not set here, the system falls back to process.env</li>
                  <li>Sensitive values are encrypted before storage</li>
                  <li>Changes take effect immediately (no redeploy needed)</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// Custom Variables Tab Component
function CustomVariablesTab({ 
  customVariables, showAddCustom, setShowAddCustom, 
  newCustomVar, setNewCustomVar, handleAddCustomVariable, 
  handleDeleteCustomVariable, saving 
}) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-md font-semibold text-primary">Custom Variables</h3>
            <p className="text-sm text-muted">Add your own environment variables</p>
          </div>
          <Button variant="secondary" onClick={() => setShowAddCustom(!showAddCustom)}>
            <img src="/icon/plus.svg" alt="" className="w-4 h-4" />
            Add Variable
          </Button>
        </div>

        {showAddCustom && (
          <div className="p-4 bg-surface-secondary rounded-lg mb-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Variable Key"
                value={newCustomVar.key}
                onChange={(e) => setNewCustomVar(prev => ({ ...prev, key: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_') }))}
                placeholder="MY_CUSTOM_VAR"
                hint="Uppercase with underscores"
              />
              <Input
                label="Label"
                value={newCustomVar.label}
                onChange={(e) => setNewCustomVar(prev => ({ ...prev, label: e.target.value }))}
                placeholder="My Custom Variable"
              />
              <Input
                label="Value"
                type={newCustomVar.sensitive ? 'password' : 'text'}
                value={newCustomVar.value}
                onChange={(e) => setNewCustomVar(prev => ({ ...prev, value: e.target.value }))}
                placeholder="Enter value"
              />
              <Select
                label="Target Service"
                value={newCustomVar.target}
                onChange={(e) => setNewCustomVar(prev => ({ ...prev, target: e.target.value }))}
                options={[
                  { value: 'shared', label: 'Shared (Both)' },
                  { value: 'backend', label: 'Main Backend' },
                  { value: 'adminBackend', label: 'Admin Backend' }
                ]}
              />
              <Select
                label="Type"
                value={newCustomVar.type}
                onChange={(e) => setNewCustomVar(prev => ({ ...prev, type: e.target.value }))}
                options={[
                  { value: 'string', label: 'String' },
                  { value: 'number', label: 'Number' },
                  { value: 'boolean', label: 'Boolean' },
                  { value: 'password', label: 'Password' }
                ]}
              />
              <Input
                label="Category"
                value={newCustomVar.category}
                onChange={(e) => setNewCustomVar(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Custom"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={newCustomVar.sensitive}
                  onChange={(e) => setNewCustomVar(prev => ({ ...prev, sensitive: e.target.checked }))}
                  className="rounded"
                />
                Sensitive (encrypt value)
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowAddCustom(false)}>Cancel</Button>
              <Button onClick={handleAddCustomVariable} loading={saving}>Add Variable</Button>
            </div>
          </div>
        )}

        {customVariables.length === 0 ? (
          <div className="text-center py-8 text-muted">
            <img src="/icon/inbox.svg" alt="" className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No custom variables yet</p>
            <p className="text-sm">Click "Add Variable" to create one</p>
          </div>
        ) : (
          <div className="space-y-2">
            {customVariables.map((variable, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-medium text-primary">{variable.key}</code>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">{variable.target}</span>
                    {variable.sensitive && (
                      <span className="px-2 py-0.5 bg-warning/10 text-warning text-xs rounded">Sensitive</span>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-1">{variable.label || variable.key} • {variable.category}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteCustomVariable(variable.target, variable.key)}
                >
                  <img src="/icon/trash-2.svg" alt="" className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
